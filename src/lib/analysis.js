import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { SPECTRAL_TYPES } from './constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const personalitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    spectralType: {
      type: SchemaType.STRING,
      description: "The user's primary spectral researcher type (OBSERVER, CATALYST, SYNTHESIZER, or ARCHIVIST)",
    },
    personalityOverview: {
      type: SchemaType.STRING,
      description: "4-5 sentences describing their research style and how they process information",
      maxLength: 800,
    },
    supportingEvidence: {
      type: SchemaType.ARRAY,
      description: "3 key behavioral patterns that indicate their type",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          pattern: { 
            type: SchemaType.STRING,
            description: "Two-word name for this behavioral pattern",
            maxLength: 30,
          },
          phrases: {
            type: SchemaType.ARRAY,
            description: "1-3 short phrases from their casts demonstrating this pattern",
            items: { 
              type: SchemaType.STRING,
              maxLength: 30,
            },
            maxItems: 3,
            minItems: 1,
          },
          explanation: { 
            type: SchemaType.STRING,
            description: "One clear sentence explaining how these phrases reveal their research style",
            maxLength: 150,
          },
        },
      },
      maxItems: 3,
      minItems: 2,
    },
    whyNotOtherTypes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING }
        }
      }
    },
    secondaryType: {
      type: SchemaType.STRING,
      description: "The user's secondary spectral researcher type that complements their primary type",
    },
    growthAreas: {
      type: SchemaType.STRING,
      description: "2-3 sentences about potential areas for development based on their type",
      maxLength: 300,
    },
  },
  required: ["spectralType", "personalityOverview", "supportingEvidence", "secondaryType", "growthAreas"],
};

export async function analyzePersonality(bio, casts) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 1.2,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 3072,
      responseMimeType: "application/json",
      responseSchema: personalitySchema,
    },
  });

  const prompt = `Analyze this Farcaster user's bio and casts to determine their Spectral Researcher type. The four types are:

OBSERVER: Notices patterns and details others miss
CATALYST: Generates unique, unexpected outputs
SYNTHESIZER: Connects and interprets multiple insights
ARCHIVIST: Documents and classifies findings

Bio: ${bio || 'No bio provided'}

Recent casts:
${casts.join('\n')}

IMPORTANT RULES:
1. Keep everything concise and specific
2. Use exactly TWO words for pattern names
3. Focus on information processing and research styles
4. Look for evidence of how they gather, process, and share knowledge
5. Consider both their primary and secondary types
6. Identify clear behavioral patterns from their writing style and content

Provide a personality overview that:
1. Describes their natural approach to learning and research
2. Explains how they typically process and share information
3. Highlights their unique strengths as a researcher
4. Suggests how they complement other types

Example overview:
"You have a natural talent for spotting subtle patterns in information and behavior. Your posts demonstrate careful attention to detail and systematic documentation of observations. As an Observer, you excel at building comprehensive understanding through methodical analysis."`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = result.response;
  try {
    return JSON.parse(response.text());
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Failed to parse response:', response.text());
    throw error;
  }
}

export async function fetchUserInfo(fid) {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    }
  );
  const data = await response.json();
  return data.users[0];
}

export async function fetchUserCasts(fid) {
  let allCasts = [];
  let cursor = undefined;
  const MAX_PAGES = 5;

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL('https://api.neynar.com/v2/farcaster/feed/user/casts');
    url.searchParams.set('fid', fid.toString());
    url.searchParams.set('limit', '150');
    url.searchParams.set('include_replies', 'false');
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const newCasts = data.casts.map(cast => cast.text);
    allCasts = [...allCasts, ...newCasts];

    cursor = data.next?.cursor;
    if (!cursor) break;
  }

  return allCasts;
} 