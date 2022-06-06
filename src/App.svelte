
<script lang="ts">
	import { cueData } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";
	// import { onMount } from "svelte";
	// import Gantt from "./Gantt.svelte";

	let videoFile: string;
	let captionsFile: string;

	if (import.meta.env.MODE == "development") {
        videoFile = import.meta.env.VITE_VIDEO_FILE
		captionsFile = import.meta.env.VITE_TRANSCRIPT_FILE
    }

	// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
    // const ffmpeg = createFFmpeg({ log: true, progress: p => console.log(p),  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js", });
    // onMount(async ()=>{
    //     await ffmpeg.load();
    // })


    const clip = async () => {
		// const data = await fetchFile(videoFile);
		// console.log(data);
    }
</script>


<Input bind:videoFile bind:captionsFile />
<Labels />
<div id="container">
	<Video bind:videoFile bind:captionsFile />
	{#if $cueData.length}
		<Transcript />
	{/if}
</div>
<!-- <button on:click={clip}>clip</button> -->
<Notes />

<style>

	#container {
		display: flex;
		height: 40vh;
	}
	/* 
 bind:videoFile
    bind:captionsFile */
</style>
