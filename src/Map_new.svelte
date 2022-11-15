<script>
	
	import { gpx } from '@tmcw/togeojson';
  	import { point } from '@turf/helpers';
  	import { getId } from './util';
  	import nearestPointOnLine from '@turf/nearest-point-on-line';

	import { curKeypoint, timingObject, mapStyle, gps } from './stores';

    import {onMount} from "svelte"

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

    let files;

    document.addEventListener('DOMContentLoaded', ()=>{
            let url = "./16-Dec-2020-0945.gpx";
            fetch(url)
            .then(response=>response.text())
            .then(data=>{
            //console.log(data);
            let parser = new DOMParser();
            let xml = parser.parseFromString(data, "application/xml");
            let list = xml.getElementsByTagName('trkpt')
            let coord = Array(list.length)
            console.log([coord])
            //console.log(xml)
            //console.log(list[0].innerHTML)
           // console.log(list[0].getAttribute("lat"))
            //console.log(list[0].getAttribute("lon"))
            

            for(let i=0; i<list.length; i++){
                let li = document.createElement('li');
                coord[i] =[list[i].getAttribute("lon"), list[i].getAttribute("lat")];
                
            }
            //console.log(coord)
            //load(coord);

            })
        });

	function load(coord) {
        
		map = new mapbox.Map({
			container,
			style: 'mapbox://styles/mapbox/streets-v9',
			//center: [lon, lat],
            center: [-73.98513941419534, 40.666829038314006] ,
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
                    'coordinates': [coord]
                    //[[-73.98513941419534, 40.666829038314006]]
                    // [
                    //     [-122.483696, 37.833818],
                    //     [-122.483482, 37.833174],
                    //     [-122.483396, 37.8327],
                    //     [-122.483568, 37.832056],
                    //     [-122.48404, 37.831141],
                    //     [-122.48404, 37.830497],
                    //     [-122.483482, 37.82992],
                    //     [-122.483568, 37.829548],
                    //     [-122.48507, 37.829446],
                    //     [-122.4861, 37.828802],
                    //     [-122.486958, 37.82931],
                    //     [-122.487001, 37.830802],
                    //     [-122.487516, 37.831683],
                    //     [-122.488031, 37.832158],
                    //     [-122.488889, 37.832971],
                    //     [-122.489876, 37.832632],
                    //     [-122.490434, 37.832937],
                    //     [-122.49125, 37.832429],
                    //     [-122.491636, 37.832564],
                    //     [-122.492237, 37.833378],
                    //     [-122.493782, 37.833683]
                    // ]
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
