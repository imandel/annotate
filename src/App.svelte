
<script lang="ts">
	import { cueData } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";
	import { onMount } from "svelte";
	// import Gantt from "./Gantt.svelte";

	let videoFile: string;
	let captionsFile: string;

	if (process.env.NODE_ENV == "dev") {
		const files = JSON.parse(process.env.FILES)
		console.log(files)
        videoFile = files.find((file: string)=>{return file.endsWith('.mp4')|| file.endsWith('.MP4')})
		captionsFile = files.find((file: string)=>{return file.endsWith('.vtt')|| file.endsWith('.VTT')})
    }

	import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
    const ffmpeg = createFFmpeg({ log: true, progress: p => console.log(p),  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js", });
    onMount(async ()=>{
        await ffmpeg.load();
    })


    const clip = async () => {
		const data = await fetchFile(videoFile);
		console.log(data);
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
<button on:click={clip}>clip</button>
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
