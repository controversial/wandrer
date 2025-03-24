'use client';

import React, { useEffect, useCallback, useState } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import classNames from 'classnames/bind';
import styles from './Map.module.scss';
const cx = classNames.bind(styles);


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
declare global { interface Window { map?: mapboxgl.Map; } }


export default function MapboxMap({
  onLoad = undefined,
}: {
  onLoad?: (map: mapboxgl.Map) => () => void;
}) {
  // holds the mapboxgl.Map instance
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  // callback ref to initialize the map within the container div
  const mapContainerRef = useCallback((node: HTMLDivElement) => {
    const m = new mapboxgl.Map({
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
    setMap(m);
    window.map = m;

    return () => { m.remove(); };
  }, []);


  // Run onLoad
  useEffect(() => {
    if (!map || !onLoad) return;
    // run the provided onLoad function at the appropriate time
    let cleanup = () => {};
    const cb = () => { cleanup = onLoad(map); };
    if (map._loaded) cb();
    else map.on('load', cb);
    // cleanup after
    return () => {
      map.off('load', cb);
      if (!map._removed) cleanup();
    };
  }, [map, onLoad]);


  return <div className={cx('base')} ref={mapContainerRef} />;
}
