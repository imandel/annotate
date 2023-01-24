<script lang="ts">
	import { cueData, videoFiles, audio } from "./stores";
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

	// if (import.meta.env.MODE == "development") {
	// 	const paths = import.meta.env.VITE_VIDEO_FILES.split(",");
	// 	captionsFile = import.meta.env.VITE_TRANSCRIPT_FILE;
	// 	// mapFile =  import.meta.env.VITE_TRANSCRIPT_FILE;
	// 	const offsets = JSON.parse(import.meta.env.VITE_OFFSETS);
	// 	paths.forEach((a) => {
	// 		const name = a.split("/").pop();
	// 		$videoFiles[name] = {
	// 			src: a,
	// 			offset: offsets[name],
	// 			visible: offsets[name] == 0 ? true : false,
	// 		};
	// 		$audio=name;
	// 	});
	// }
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
<Controls />
<Timeline />

<Notes />

<style>
	#container {
		display: flex;
		height: 40vh;
	}
</style>
