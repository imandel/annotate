<script lang="ts">
	import {  videoFile } from "./stores";
	let files: FileList;
	export let captionsFile: string = undefined;
	let fileSpan = [];

	$: if (files) {
		console.log(files);

		for (const file of files) {
			// console.log(`${file.name}: ${file.size} bytes`);
			if (file.type == 'video/mp4') {
				$videoFile = URL.createObjectURL(file);
				console.log($videoFile);
			}
			if (file.type == 'text/vtt' || file.name.endsWith('.vtt')) {
				captionsFile = URL.createObjectURL(file);
				console.log(captionsFile);
				console.log(file);
			}
			else{
				console.log(file);
			}
			fileSpan = [...fileSpan, file.name];
		}
	}
</script>

<input type="file" bind:files multiple />

{#if files}
<div class=dropdown>
	<details>
		<summary>Selected files</summary>
		<div class="dropdown-content">
			{#each files as file}
			<p>{file.name}</p>
			{/each}
		</div>
	</details>
</div>
	{/if}

<style>
.dropdown {
  display: inline-block;
  position: relative;
}

.dropdown-content{
	z-index: 10;
}


/* Detaching details content */
.dropdown .dropdown-content {
  position: absolute;
  min-inline-size: max-content;
  background-color: white;
  border: 1px solid #9b7aba;
  right: 0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);
}

/* Closing the detail content on clicking anywhere else */
.dropdown details[open] summary::before {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  content: "";
  cursor: default;
}
</style>
