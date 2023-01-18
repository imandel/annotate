<script lang="ts">
	import { tags, videoFile } from "./stores";
	import { get } from "svelte/store";
	import { setData } from "./Notes.svelte";
	import { parseRangeString } from "./customFormatting";
	import type { Delta } from "@typewriter/document";
	import { text } from "stream/consumers";
	let files: FileList;
	export let captionsFile: string = undefined;
	export let mapFile: string = undefined;
	let fileSpan = [];
	async function fileToJSON(file: File) {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onload = (event) =>
				resolve(JSON.parse(event.target.result as string));
			fileReader.onerror = (error) => reject(error);
			fileReader.readAsText(file);
		});
	}
	let loadedNotes: Delta;
	$: if (files) {
		console.log(files);
		for (const file of files) {
			// console.log(`${file.name}: ${file.size} bytes`);
			if (file.type == "video/mp4") {
				$videoFile = URL.createObjectURL(file);
				console.log($videoFile);
			}
			if (file.type == "text/vtt" || file.name.endsWith(".vtt")) {
				captionsFile = URL.createObjectURL(file);
				console.log(captionsFile);
				console.log(file);
			}
			if (file.type == "text/plain" || file.name.endsWith(".gpx")) {
				mapFile = URL.createObjectURL(file);
				console.log("Map loaded");
				// console.log(file.text());
				// console.log(file);
			}

			if (file.type == "application/json" && !loadedNotes) {
				fileToJSON(file).then((data: Delta) => {
					loadedNotes = data;
					const tempTags = get(tags);
					data.ops
						.filter((op) => op.attributes?.ts)
						.forEach(({ attributes }) => {
							const { ts, label, color, id } = attributes;
							const { start, end } = parseRangeString(ts);
							if (label in tempTags == false) {
								tempTags[label] = {
									label,
									color,
									annotations: new Map(),
								};
							}

							tempTags[label].annotations.set(id, {
								start: start,
								end: end,
							});
							tags.set(tempTags);
						});
					setData(data as Delta);
				});
			} else {
				console.log(file);
			}
			fileSpan = [...fileSpan, file.name];
		}
	}
</script>

<input type="file" bind:files multiple />

{#if files}
	<div class="dropdown">
		<details>
			<summary>Selected files</summary>
			<div class="dropdown-content">
				{#each Array.from(files) as file, i}
					<p>{file.name}</p>
					{#await file.text() then text}
						<p>e: {text} i: {i}</p>
						console.log({text})
					{/await}
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

	.dropdown-content {
		z-index: 10;
	}

	/* Detaching details content */
	.dropdown .dropdown-content {
		position: absolute;
		min-inline-size: max-content;
		background-color: white;
		border: 1px solid #9b7aba;
		right: 0;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
