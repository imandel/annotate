<script>
	
	import { gpx } from '@tmcw/togeojson';
  	import { point } from '@turf/helpers';
  	import { getId } from './util';
  	import nearestPointOnLine from '@turf/nearest-point-on-line';

	import { curKeypoint, timingObject, mapStyle, gps } from './stores';
  	let mapRef;
	let line;
	let route;
	let start;
	let keyOrigin;
	let hidden = false;

	import { onDestroy, setContext } from 'svelte';
	import { mapbox, key } from './mapbox.js';

	setContext(key, {
		getMap: () => map,
	});

	export let lat;
	export let lon;
	export let zoom;

	let container;
	let map;

    let geojsonPoint = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      },
    ],
    };

	function load() {
		map = new mapbox.Map({
			container,
			style: 'mapbox://styles/mapbox/streets-v9',
			//center: [lon, lat],
            center: [-122.486052, 37.830348],
			//zoom,
            zoom: 15

		});
        map.on('load', () => {

        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [-122.483696, 37.833818],
                        [-122.483482, 37.833174],
                        [-122.483396, 37.8327],
                        [-122.483568, 37.832056],
                        [-122.48404, 37.831141],
                        [-122.48404, 37.830497],
                        [-122.483482, 37.82992],
                        [-122.483568, 37.829548],
                        [-122.48507, 37.829446],
                        [-122.4861, 37.828802],
                        [-122.486958, 37.82931],
                        [-122.487001, 37.830802],
                        [-122.487516, 37.831683],
                        [-122.488031, 37.832158],
                        [-122.488889, 37.832971],
                        [-122.489876, 37.832632],
                        [-122.490434, 37.832937],
                        [-122.49125, 37.832429],
                        [-122.491636, 37.832564],
                        [-122.492237, 37.833378],
                        [-122.493782, 37.833683]
                    ]
                    }
            }
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#888',
                'line-width': 8
            }
        });

    });
    
    } 
    


	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<!-- this special element will be explained in a later section -->
<svelte:head>
	<link
		rel="stylesheet"
		href="../node_modules/mapbox-gl/dist/mapbox-gl.css"
		on:load={load}
	/>
</svelte:head>

<div bind:this={container}>
	{#if map}
		<slot />
	{/if}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
</style>
