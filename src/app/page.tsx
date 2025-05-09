'use client';

import React, { useMemo } from 'react';
import { useControls, Leva } from 'leva';

import MapboxMap from 'components/Map';
import type { SourceSpecification, LayerSpecification } from 'mapbox-gl';
import { extractTileFeatures } from 'data/mapbox-util';

import spatialIndex from 'data/spatial-index';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);

if (!process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID) throw new Error('Missing athlete ID');
const WANDRER_ATHLETE_ID = process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID;


const sources = [
  // used for “traveled” segments; supports CORS
  {
    id: 'wandrer-1',
    type: 'vector',
    tiles: [`https://tiles2.wandrer.earth/tiles/${WANDRER_ATHLETE_ID}/bike/{z}/{x}/{y}`],
    maxzoom: 13,
  },
  // used for “untraveled” segments; proxied through an API route due to no CORS support
  {
    type: 'vector',
    id: 'wandrer-2',
    tiles: ['/api/tiles/untraveled/{z}/{x}/{y}'],
    maxzoom: 13,
  },
] satisfies SourceSpecification[];

const layers = (
  { traveledColor, untraveledColor }: { traveledColor: string; untraveledColor: string; },
) => [
  // untraveled segments in red
  {
    id: 'wandrer-untraveled',
    type: 'line',
    source: 'wandrer-2',
    'source-layer': 'missing_segments',
    slot: 'middle',
    paint: {
      'line-color': untraveledColor,
      'line-occlusion-opacity': 0.3,
      'line-width': {
        type: 'exponential',
        base: 1.5,
        stops: [[11, 1], [16, 4]],
      },
    },
  },

  // traveled segments in blue
  {
    id: 'wandrer-traveled',
    type: 'line',
    source: 'wandrer-1',
    'source-layer': 'se',
    slot: 'middle',
    paint: {
      'line-color': traveledColor,
      'line-occlusion-opacity': 0.3,
      'line-width': {
        type: 'exponential',
        base: 1.5,
        stops: [[11, 1], [16, 4]],
      },
    },
  },
] satisfies LayerSpecification[];


export default function Page() {
  const { traveledColor, untraveledColor } = useControls({
    traveledColor: {
      value: '#0040ff',
      label: 'Traveled',
      input: 'color',
    },
    untraveledColor: {
      value: '#ff6973',
      label: 'Untraveled',
      input: 'color',
    },
  });

  return (
    <div className={cx('base')}>
      <MapboxMap
        sources={sources}
        layers={useMemo(
          () => layers({ traveledColor, untraveledColor }),
          [traveledColor, untraveledColor],
        )}

        onData={(e) => {
          if (e.dataType !== 'source') return;
          if (e.sourceId !== 'wandrer-1' && e.sourceId !== 'wandrer-2') return;
          // extract features from loaded tile
          if (!e.tile) return;
          const targetLayerID = { 'wandrer-1': 'se', 'wandrer-2': 'missing_segments' }[e.sourceId];
          const features = extractTileFeatures(e.tile, targetLayerID);
          if (!features) return;
          // record features in the spatial index
          const featuresTraveled = e.sourceId === 'wandrer-1';
          const { z } = e.tile.tileID.canonical;
          spatialIndex.recordLoadedFeatures(features, featuresTraveled, z)
            .catch((err: unknown) => { console.error('Error recording features', err); });
        }}
      />

      <Leva collapsed />
    </div>
  );
}
