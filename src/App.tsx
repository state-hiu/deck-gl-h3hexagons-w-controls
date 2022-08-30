import React, {useState } from 'react';
//import { HexagonLayer } from '@deck.gl/aggregation-layers/typed';
import {H3HexagonLayer} from '@deck.gl/geo-layers/typed';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
//import { Box } from 'grommet';
import {
  Map,
  ScaleControl,
  FullscreenControl,
  NavigationControl,
  AttributionControl,
  useControl,
} from 'react-map-gl';

//import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it
import mapboxgl from 'mapbox-gl';
//import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker';
import 'mapbox-gl/dist/mapbox-gl.css';


// add to apply the following fix so that the basemap works in production: https://github.com/visgl/react-map-gl/issues/1266
// npm install worker-loader
// eslint-disable-next-line import/no-webpack-loader-syntax
//mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;
//mapboxgl.workerClass = MapboxWorker;

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGl1IiwiYSI6InJWNGZJSzgifQ.xK1ndT3W8XL9lwVZrT6jvQ';

function getDataAsync() {
  return fetch('boston_crimes_h3.json'
  ,{
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  }
  )
  .then((response) => response.json())
  .then((responseJson) => {
    return responseJson;
  })
  .catch((error) => {
    console.error(error);
  });
}


function DeckGLOverlay(props: MapboxOverlayProps & {
  interleaved?: boolean;
}) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {

  //https://deck.gl/docs/developer-guide/interactivity
  const [viewState, setViewState] = useState({
    longitude: -71.039,
    latitude: 42.352,
    zoom: 9,
    maxZoom: 15,
    pitch: 30,
    bearing: 0
  });

  const layer = new H3HexagonLayer({
    id: 'h3-hexagon-layer',
    data: getDataAsync(),
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 20,
    getHexagon: d => d.hex,
    getFillColor: d => [255, (1 - d.value / 500) * 255, 0],
    getElevation: d => d.value
  });

  return(

      <Map
        attributionControl={false}
        initialViewState={viewState}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      >
        <DeckGLOverlay layers={[layer]} getTooltip={({object}) => object && `${object.hex} value: ${object.value}`}/>
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <AttributionControl position="bottom-right" />
        <ScaleControl position="bottom-right" />
      </Map>

   );
};

