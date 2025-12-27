import type { MapSourceDataEvent } from 'mapbox-gl';
import type { Feature } from 'geojson';

export type Tile = NonNullable<MapSourceDataEvent['tile']>;

// Ref: https://github.com/mapbox/mapbox-gl-js/blob/30827531c3807a3c833711480714df3844e20c02/src/source/tile.ts#L510-L544
export function extractTileFeatures(tile: Tile, targetSourceLayer: string): Feature[] | null {
  const featureIndex = tile.latestFeatureIndex;
  if (!featureIndex) return null;
  const vtLayers = featureIndex.loadVTLayers();
  const layer = vtLayers[targetSourceLayer];
  if (!layer) return null;
  const features: Feature[] = [];
  for (let i = 0; i < layer.length; i += 1) {
    const layerFeature = layer.feature(i);
    const { z, x, y } = tile.tileID.canonical;
    const feature = layerFeature.toGeoJSON(x, y, z);
    features.push(feature);
  }
  return features;
}
