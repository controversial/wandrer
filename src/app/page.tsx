import React from 'react';

import MapboxMap from 'components/Map';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);

if (!process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID) throw new Error('Missing athlete ID');
const WANDRER_ATHLETE_ID = process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID;


export default function Page() {
  return (
    <div className={cx('base')}>
      <MapboxMap
        sources={[
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
        ]}

        layers={[
          // untraveled segments in red
          {
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
          },

          // traveled segments in blue
          {
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
          },
        ]}
      />
    </div>
  );
}
