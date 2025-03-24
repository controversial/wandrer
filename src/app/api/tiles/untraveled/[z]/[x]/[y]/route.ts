import type { NextRequest } from 'next/server';
import { WANDRER_USER_ID } from '../../../../../../../constants';

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

  const tileUrl = `https://wandrer.earth/tiles/m2/${WANDRER_USER_ID}/bike/${z}/${x}/${y}?f=1`;
  const r = await fetch(tileUrl);
  return new Response(r.body);
}
