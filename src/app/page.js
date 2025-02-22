// This is a server component (no 'use client' directive)
import HomeComponent from './components/HomeComponent';
import { generateFrameMetadata } from '../lib/page-metadata';
import { analyzePersonality, fetchUserInfo, fetchUserCasts } from '../lib/analysis';
import { getFromKV, putToKV } from '../lib/cloudflare-kv';

export async function generateMetadata({ searchParams }) {
  return generateFrameMetadata({ searchParams });
}

export default async function Page({ searchParams }) {
  console.log('Page component rendering with searchParams:', searchParams);

  const params = await searchParams;
  const rawFid = params?.fid;
  const fid = rawFid ? parseInt(rawFid, 10) : null;
  
  console.log('Parsed FID:', fid);
  
  let initialData = null;
  if (fid && !isNaN(fid)) {
    try {
      const cacheKey = `spectral:analysis:${fid}`;
      console.log('Trying to fetch from cache:', cacheKey);
      const cachedData = await getFromKV(cacheKey);
      
      if (cachedData) {
        console.log('Found cached data');
        initialData = JSON.parse(cachedData);
      } else {
        console.log('Cache miss, fetching fresh data');
        const [userInfo, casts] = await Promise.all([
          fetchUserInfo(fid),
          fetchUserCasts(fid),
        ]);
        
        const analysis = await analyzePersonality(userInfo.profile?.bio?.text || null, casts);
        
        initialData = {
          fid,
          analysis,
          username: userInfo.username,
          displayName: userInfo.display_name,
          pfpUrl: userInfo.pfp_url,
          bio: userInfo.profile?.bio?.text || null,
        };

        await putToKV(cacheKey, initialData);
      }
    } catch (error) {
      console.error('Error in SSR:', error);
    }
  }

  console.log('Rendering with initialData:', initialData);
  return <HomeComponent fid={fid} initialData={initialData} />;
}
