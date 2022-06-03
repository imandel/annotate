
<script lang="ts">
	import { cueData } from "./stores";
	import Video from "./Video.svelte";
	import Transcript from "./Transcript.svelte";
	import Input from "./Input.svelte";
	import Notes from "./Notes.svelte";
	import Labels from "./Labels.svelte";
	// import Gantt from "./Gantt.svelte";

	let videoFile: string;
	let captionsFile: string;

	if (process.env.NODE_ENV == "dev") {
		const files = JSON.parse(process.env.FILES)
		console.log(files)
        videoFile = files.find((file: string)=>{return file.endsWith('.mp4')|| file.endsWith('.MP4')})
		captionsFile = files.find((file: string)=>{return file.endsWith('.vtt')|| file.endsWith('.VTT')})
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
