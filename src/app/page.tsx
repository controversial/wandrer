'use client';

import React from 'react';
import type { Map as MapboxInstance } from 'mapbox-gl';

import MapboxMap from 'components/Map';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);

if (!process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID) throw new Error('Missing athlete ID');
const WANDRER_ATHLETE_ID = process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID;


function setupMap(map: MapboxInstance) {
  // used for “traveled” segments; supports CORS
  map.addSource('wandrer-1', {
    type: 'vector',
    tiles: [`https://tiles2.wandrer.earth/tiles/${WANDRER_ATHLETE_ID}/bike/{z}/{x}/{y}`],
    maxzoom: 13,
  });
  // used for “untraveled” segments; proxied through an API route due to no CORS support
  map.addSource('wandrer-2', {
    type: 'vector',
    tiles: [`${window.location.origin}/api/tiles/untraveled/{z}/{x}/{y}`],
    maxzoom: 13,
  });

  // untraveled segments in red
  map.addLayer({
    id: 'wandrer-untraveled',
    type: 'line',
    source: 'wandrer-2',
    'source-layer': 'missing_segments',
    slot: 'middle',
    paint: {
      'line-color': '#fa737c',
      'line-occlusion-opacity': 0.3,
      'line-width': {
        type: 'exponential',
        base: 1.5,
        stops: [[13, 1], [16, 3]],
      },
    },
  });

  // traveled segments in blue
  map.addLayer({
    id: 'wandrer-traveled',
    type: 'line',
    source: 'wandrer-1',
    'source-layer': 'se',
    slot: 'middle',

    paint: {
      'line-color': '#0544ff',
      'line-occlusion-opacity': 0.3,
      'line-width': {
        type: 'exponential',
        base: 1.5,
        stops: [[13, 1], [16, 3]],
      },
    },
  });

  // clean up by removing the sources/layers we added
  return () => {
    map.removeLayer('wandrer-traveled');
    map.removeLayer('wandrer-untraveled');
    map.removeSource('wandrer-1');
    map.removeSource('wandrer-2');
  };
}


export default function Page() {
  return (
    <div className={cx('base')}>
      <MapboxMap onLoad={setupMap} />
    </div>
  );
}
