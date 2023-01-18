<script lang="ts">
	import { cueData, videoFile } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";
	import Controls from "./Controls.svelte";
	// import Map from "./Map.svelte";
	import Timeline from "./Timeline.svelte";

	let captionsFile: string;
	let mapFile: string;

	if (import.meta.env.MODE == "development") {
		$videoFile = import.meta.env.VITE_VIDEO_FILE;
		captionsFile = import.meta.env.VITE_TRANSCRIPT_FILE;
		// mapFile =  import.meta.env.VITE_TRANSCRIPT_FILE
	}
</script>

<Input bind:captionsFile bind:mapFile />
<Labels />
<div id="container">
	<Video bind:captionsFile />
	{#if $cueData.length}
		<Transcript />
	{/if}

	<!-- <Map {mapFile} /> -->
</div>
<Controls></Controls>
<Timeline />

<Notes />

<style>
	#container {
		display: flex;
		height: 40vh;
	}
</style>
