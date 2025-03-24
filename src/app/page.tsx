'use client';

import React, { useCallback } from 'react';
import type { Map as MapboxInstance } from 'mapbox-gl';

import MapboxMap from 'components/Map';
import { WANDRER_USER_ID } from '../constants';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);


export default function Page() {
  const setupMap = useCallback((map: MapboxInstance) => {
    map.addSource('wandrer-1', {
      type: 'vector',
      tiles: [
        `https://tiles2.wandrer.earth/tiles/${WANDRER_USER_ID}/bike/{z}/{x}/{y}`,
      ],
      maxzoom: 13,
    });

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
          stops: [
            [13, 1],
            [16, 3],
          ],
        },
      },
    });

    return () => {
      map.removeLayer('wandrer-traveled');
      map.removeSource('wandrer-1');
    };
  }, []);

  return (
    <div className={cx('base')}>
      <MapboxMap onLoad={setupMap} />
    </div>
  );
}
