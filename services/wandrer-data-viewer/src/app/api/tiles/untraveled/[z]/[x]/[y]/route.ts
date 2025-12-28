import type { NextRequest } from 'next/server';

if (!process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID) throw new Error('Missing athlete ID');
const WANDRER_ATHLETE_ID = process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID;

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ z: string; x: string; y: string; }> },
): Promise<Response> {
  const params = await paramsPromise;
  const z = parseInt(params.z, 10);
  const x = parseInt(params.x, 10);
  const y = parseInt(params.y, 10);
  if (Number.isNaN(z) || Number.isNaN(x) || Number.isNaN(y)) {
    return new Response('Invalid parameters', { status: 400 });
  }

  const tileUrl = `https://wandrer.earth/tiles/m2/${WANDRER_ATHLETE_ID}/bike/${z}/${x}/${y}?f=1`;
  const r = await fetch(tileUrl);
  return new Response(r.body);
}

export const dynamic = 'force-static';
export function generateStaticParams() { return Promise.resolve([]); }
export const revalidate = 3600; // 1 hour
