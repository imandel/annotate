
<script lang="ts">
	import { cueData, videoFile } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";

	let captionsFile: string;

	if (import.meta.env.MODE == "development") {
        $videoFile = import.meta.env.VITE_VIDEO_FILE
		captionsFile = import.meta.env.VITE_TRANSCRIPT_FILE
    }

</script>


<Input bind:captionsFile />
<Labels />
<div id="container">
	<Video bind:captionsFile />
	{#if $cueData.length}
		<Transcript />
	{/if}
</div>
<Notes />

<style>

	#container {
		display: flex;
		height: 40vh;
	}
</style>
