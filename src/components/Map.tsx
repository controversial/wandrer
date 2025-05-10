'use client';

import React, { useEffect, useCallback, useState, useImperativeHandle } from 'react';

import mapboxgl, { type LayerSpecification, type SourceSpecification } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import classNames from 'classnames/bind';
import styles from './Map.module.scss';
const cx = classNames.bind(styles);


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
declare global { interface Window { map?: mapboxgl.Map; } }


const url = (partial: string) => {
  if (typeof window === 'undefined') throw new Error('url is client-only');
  const fullUrl = new URL(partial, window.location.origin).href;
  return fullUrl.replace(/%7B([a-zA-Z0-9_]+)%7D/g, '{$1}'); // unescape curly parameters like {x}
};


export default function MapboxMap({
  sources = [],
  layers = [],
  onData = undefined,
  ref = undefined,
}: {
  sources?: ({ id: string } & SourceSpecification)[];
  layers?: LayerSpecification[];
  onData?: (e: mapboxgl.MapDataEvent) => void;
  ref?: React.RefObject<{ map: mapboxgl.Map | null } | null>;
}) {
  // holds the mapboxgl.Map instance
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  useImperativeHandle(ref, () => ({
    map,
  }), [map]);

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
          theme: 'faded',
          showPointOfInterestLabels: false,
          showTransitLabels: false,
        },
      },
    });
    setMap(m);
    window.map = m;

    return () => { m.remove(); };
  }, []);

  useEffect(() => {
    if (!map || sources.length === 0) return;
    let cleanup = () => {};
    // Add sources
    const cb = () => {
      sources.forEach((source) => {
        map.addSource(source.id, {
          ...source,
          // expand relative URLs
          ...'tiles' in source && { tiles: source.tiles?.map((tile) => url(tile)) },
        });
      });

      // Add layers
      layers.forEach((layer) => { map.addLayer(layer); });

      cleanup = () => {
        // remove layers
        layers.forEach((layer) => {
          if (!map._removed) { map.removeLayer(layer.id); }
        });
        // remove sources
        sources.forEach((source) => {
          if (!map._removed) { map.removeSource(source.id); }
        });
      };
    };
    if (map._loaded) cb();
    else map.on('load', cb);

    return () => {
      map.off('load', cb);
      cleanup();
    };
  }, [map, sources, layers]);

  // attach event listeners
  useEffect(() => {
    if (!map || !onData) return;
    map.on('data', onData);
    return () => { map.off('data', onData); };
  }, [map, onData]);


  return <div className={cx('base')} ref={mapContainerRef} />;
}
