<script>
  import { onDestroy } from "svelte";
  import mapbox from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { gpx } from "@tmcw/togeojson";
  import { onMount } from "svelte";
  export let mapFile;
  export let lat = -73.98513941419534;
  export let lon = 40.666829038314006;
  export let zoom = 15;

  let container;
  let map;
  let coords;

  // After binding container, load map from your API token
  onMount(() => {
    mapbox.accessToken =
      "pk.eyJ1IjoiaW1hbmRlbCIsImEiOiJjankxdjU4ODMwYTViM21teGFpenpsbmd1In0.IN9K9rp8-I5pTbYTmwRJ4Q";
    map = new mapbox.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [lat, lon],
      zoom: zoom,
    });
  });

  $: if (map && mapFile) {
    load_from_file();
  }

  // To load map raw data to coord from mapFile
  function load_from_file() {
    fetch(mapFile)
      .then((response) => response.text())
      .then((data) => {
        // Use @tmcw/togeojson parse the data
        // transfer gpx to geojson for mapbox to read
        coords = gpx(new DOMParser().parseFromString(data, "application/xml"));
        // also calculate the average lat, lon
        const size = coords["features"][0]["geometry"]["coordinates"].length;
        let lat_sum = 0.0;
        let lon_sum = 0.0;
        for (let i = 0; i < size; i++) {
          const lat_now = Number(
            coords["features"][0]["geometry"]["coordinates"][i][0]
          );
          const lon_now = Number(
            coords["features"][0]["geometry"]["coordinates"][i][1]
          );
          coords[i] = [lat_now, lon_now];
          lat_sum += lat_now;
          lon_sum += lon_now;
        }
        lat = lat_sum / size;
        lon = lon_sum / size;
      });
    if (map) map.remove();
    map = new mapbox.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [lat, lon],
      zoom: zoom,
    });
    map.on("load", () => {
      map.addSource(mapFile, {
        type: "geojson",
        data: coords,
      });
      map.addLayer({
        id: mapFile,
        type: "line",
        source: mapFile,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 4,
        },
      });
    });
  }

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div bind:this={container} />

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
