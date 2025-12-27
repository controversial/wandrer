'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useControls, Leva } from 'leva';

import MapboxMap from 'components/Map';
import type { SourceSpecification, LayerSpecification } from 'mapbox-gl';
import { extractTileFeatures } from 'data/mapbox-util';

import Controls from 'components/Controls';

import spatialIndex from 'data/spatial-index';
import type { Temporal } from 'temporal-polyfill';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);


const sources = [
  // used for “traveled” segments; supports CORS
  {
    id: 'wandrer-1',
    type: 'vector',
    tiles: ['/api/tiles/traveled/{z}/{x}/{y}'],
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

const line = {
  type: 'line',
  slot: 'middle',
  paint: {
    'line-occlusion-opacity': 0.3,
    'line-width': {
      type: 'exponential',
      base: 1.5,
      stops: [[11, 1], [16, 4]],
    },
  },
} satisfies Partial<LayerSpecification>;

const layers = (
  { traveledColor, untraveledColor }: { traveledColor: string; untraveledColor: string; },
) => [
  // untraveled segments in red
  {
    id: 'wandrer-untraveled',
    source: 'wandrer-2',
    'source-layer': 'missing_segments',
    ...line,
    paint: { ...line.paint, 'line-color': untraveledColor },
  },

  // traveled segments in blue
  {
    id: 'wandrer-traveled',
    source: 'wandrer-1',
    'source-layer': 'se',
    ...line,
    paint: { ...line.paint, 'line-color': traveledColor }, // line-color will be overridden
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

  const mapRef = useRef<{ map: mapboxgl.Map | null }>(null);

  // record segment timestamps from spatial index in mapbox feature state
  useEffect(() => {
    const featureDataHandler = (
      data: Map<string | number, { traveled: boolean; timestamp: number | undefined }>,
    ) => {
      data.forEach((value, key) => {
        const map = mapRef.current?.map;
        // only traveled features have timestamps
        if (!map || !value.timestamp || !value.traveled) return;
        map.setFeatureState({ source: 'wandrer-1', sourceLayer: 'se', id: key }, {
          traveledAt: value.timestamp,
        });
      });
    };
    spatialIndex.mitt.on('features-recorded', featureDataHandler);
    return () => { spatialIndex.mitt.off('features-recorded', featureDataHandler); };
  }, []);


  // set the traveled-layers color visibility based on the maxDate
  const [dateLimit, setDateLimit] = useState<Temporal.ZonedDateTime | undefined>(undefined);
  console.log('maxDate', dateLimit?.toLocaleString());

  useEffect(() => {
    const map = mapRef.current?.map;
    if (!map) return;
    if (!dateLimit) map.setPaintProperty('wandrer-traveled', 'line-color', traveledColor);
    else {
      const segmentTraveledAt = ['number', ['feature-state', 'traveledAt'], 0];
      map.setPaintProperty('wandrer-traveled', 'line-color', [
        'case',
        ['<=', segmentTraveledAt, dateLimit.epochMilliseconds],
        traveledColor,
        untraveledColor,
      ]);
    }
  }, [dateLimit, traveledColor, untraveledColor]);

  return (
    <div className={cx('base')}>
      <MapboxMap
        ref={mapRef}
        sources={sources}
        layers={useMemo(
          () => layers({ traveledColor, untraveledColor }),
          [traveledColor, untraveledColor],
        )}

        onData={useCallback((e: mapboxgl.MapDataEvent) => {
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
          spatialIndex.recordLoadedFeatures(features, { traveled: featuresTraveled, tileZ: z })
            .catch((err: unknown) => { console.error('Error recording features', err); });
        }, [])}
      />

      <Controls untilDate={dateLimit} onUntilDateChange={setDateLimit} />

      <Leva collapsed />
    </div>
  );
}
