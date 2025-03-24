'use client';

import React, { useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import classNames from 'classnames/bind';
import styles from './Map.module.scss';
const cx = classNames.bind(styles);


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
declare global { interface Window { map?: mapboxgl.Map; } }


export default function MapboxMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = (node: HTMLDivElement) => {
    mapRef.current = new mapboxgl.Map({
      container: node,
      bounds: [
        { lng: -73.900, lat: 40.822 },
        { lng: -74.048, lat: 40.723 },
      ],
      config: {
        basemap: {
          showPointOfInterestLabels: false,
          theme: 'faded',
        },
      },
    });
    window.map = mapRef.current;

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    return () => { mapRef.current?.remove(); };
  };

  return (
    <div className={cx('base')} ref={mapContainerRef} />
  );
}
