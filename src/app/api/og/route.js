import { ImageResponse } from 'next/og';
import { getFromKV } from '@/lib/cloudflare-kv';
import { ENNEAGRAM_TYPES, SPECTRAL_TYPES } from '@/lib/constants';

export const runtime = 'edge';

// Load font
const karlaFontData = fetch(
  'https://images.kasra.codes/Karla-Regular.ttf'
).then(res => res.arrayBuffer());

async function getAnalysis(fid) {
  const cacheKey = `spectral:analysis:${fid}`;
  const cachedData = await getFromKV(cacheKey);
  
  if (!cachedData) {
    throw new Error('Analysis not found');
  }

  const data = JSON.parse(cachedData);
  const analysis = data.value ? JSON.parse(data.value) : data;

  if (!analysis?.username || !analysis?.pfpUrl || !analysis?.analysis?.spectralType) {
    throw new Error('Invalid analysis data');
  }

  return {
    username: analysis.username,
    pfp: analysis.pfpUrl,
    type: {
      id: analysis.analysis.spectralType,
      name: SPECTRAL_TYPES[analysis.analysis.spectralType].name
    }
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return new Response('Missing FID', { status: 400 });
    }

    // Get analysis data and font in parallel
    const [analysis, fontData] = await Promise.all([
      getAnalysis(fid),
      karlaFontData
    ]);

    // Generate the image
    const imageResponse = await new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FDA4AF',
          padding: '60px 40px',
          color: '#030303',
          fontFamily: 'Karla',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '60px',
          }}>
            <span style={{
              fontSize: '64px',
              fontWeight: 500,
            }}>
              Spectral Researcher Type
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '60px',
          }}>
            <img
              src={analysis.pfp}
              width="100"
              height="100"
              style={{
                borderRadius: '50px',
                marginRight: '20px',
              }}
            />
            <span style={{
              fontSize: '64px',
              fontWeight: 500,
            }}>
              @{analysis.username}
            </span>
          </div>

          <span style={{
            fontSize: '42px',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            Based on my research style, I'm a...
          </span>

          <span style={{
            fontSize: '72px',
            fontWeight: 500,
            marginBottom: '80px',
          }}>
            {analysis.type.name}
          </span>

          <span style={{
            fontSize: '42px',
            fontWeight: 500,
          }}>
            Discover Your Research Type ↓
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        fonts: [
          {
            name: 'Karla',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );

    return imageResponse;
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response(error.message || 'Failed to generate image', { status: 500 });
  }
} 