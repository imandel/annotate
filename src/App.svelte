
<script lang="ts">
	import { cueData, videoFile } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";
	import Timeline from "./Timeline.svelte";

	import Map from './Map.svelte';
	import MapMarker from './MapMarker.svelte';

	let captionsFile: string;

	if (import.meta.env.MODE == "development") {
        $videoFile = import.meta.env.VITE_VIDEO_FILE
		captionsFile = import.meta.env.VITE_TRANSCRIPT_FILE
    }

</script>



<Input bind:captionsFile />
<Labels />
<div id="container">
	<Map lat={35} lon={-84} zoom={3.5}>

		<!-- <MapMarker lat={37.8225} lon={-122.0024} label="Svelte Body Shaping"/>
		<MapMarker lat={33.8981} lon={-118.4169} label="Svelte Barbershop & Essentials"/>
		<MapMarker lat={29.7230} lon={-95.4189} label="Svelte Waxing Studio"/>
		<MapMarker lat={28.3378} lon={-81.3966} label="Svelte 30 Nutritional Consultants"/>
		<MapMarker lat={40.6483} lon={-74.0237} label="Svelte Brands LLC"/>
		<MapMarker lat={40.6986} lon={-74.4100} label="Svelte Medical Systems"/> -->
	</Map>
	
	<Video bind:captionsFile />
	{#if $cueData.length}
		<Transcript />
	{/if}

</div>
<Timeline />
<Notes />


<style>
	#container {
		display: flex;
		height: 40vh;
	}
</style>
