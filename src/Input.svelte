<script lang="ts">
	import { tags, videoFiles, audio } from "./stores";
	import { get } from "svelte/store";
	import { setData } from "./Notes.svelte";
	import { parseRangeString } from "./customFormatting";
	import type { Delta } from "@typewriter/document";
	let files: FileList;
	export let captionsFile: string = undefined;
	export let mapFile: string = undefined;
	export let tagFile: string = undefined;
	let loadedNotes: Delta;

	async function fileToJSON(file: File) {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onload = (event) =>
				resolve(JSON.parse(event.target.result as string));
			fileReader.onerror = (error) => reject(error);
			fileReader.readAsText(file);
		});
	}
	// TODO this is running twice even though files are only being loaded once. this needs to be fixed this is just a hacky work around
	$: if (files && Object.keys($videoFiles).length === 0) {
		console.log('load files')
		let offset: File;
		for (const file of files) {
			if (file.type == "video/mp4") {
				$videoFiles[file.name] = {
					src: URL.createObjectURL(file),
					offset: 0,
					visible: true,
				};
			}
			if (
				file.type == "application/json" &&
				file.name.includes("offset")
			) {
				offset = file;
				console.log('offset')
			}
			if (file.type == "text/vtt" || file.name.endsWith(".vtt")) {
				captionsFile = URL.createObjectURL(file);
				console.log('captions', captionsFile);
			}
			if (file.type == "text/plain" || file.name.endsWith(".gpx")) {
				mapFile = URL.createObjectURL(file);
				console.log("map", mapFile);
			}
			if (file.type == "application/json" && file.name.includes("tag")) {				
				// update to tagFile
				tagFile = URL.createObjectURL(file);
				console.log('tag', tagFile);
			}

			// TODO: change this part
			if (
				file.type == "application/json" &&
				file.name.endsWith(".annotations.json") &&
				!loadedNotes
			) {
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
			}
		}
		if (offset) {
			fileToJSON(offset).then((data) => {
				console.log('here', data)
				for (const [key, value] of Object.entries(data)) {
					if (key in $videoFiles == false) {
						// console.log("file not found", key);
						continue;
					}
					console.log("setting offset", key, value);
					$videoFiles[key].offset = value;
					// console.log("Now we have these videoFiles", $videoFiles)
					if (value == 0) {
						$videoFiles[key].visible = true;
						$audio = key;
					} else {
						$videoFiles[key].visible = false;
					}
				}
			});
		} else {
			$audio = Object.keys($videoFiles).pop();
		}
	}
</script>

<input type="file" bind:files multiple />

{#if typeof $videoFiles !== "undefined"}
	<div class="dropdown">
		<details>
			<summary>Selected files</summary>
			<div class="dropdown-content">
				{#each Object.entries($videoFiles) as [name, value]}
					<p>
						{name}
						{value.visible}
						<label class="vid-data"
							>👀
							<input
								type="checkbox"
								bind:checked={$videoFiles[name].visible}
								value={name}
							/>
						</label>
						<label class="vid-data"
							>🔊<input
								type="radio"
								bind:group={$audio}
								value={name}
							/></label
						>
					</p>
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
	.vid-data {
		display: inline;
		padding: 0 0 0 0.5em;
	}

	/* Detaching details content */
	.dropdown .dropdown-content {
		position: absolute;
		min-inline-size: max-content;
		background-color: white;
		border: 1px solid #9b7aba;
		right: 0;
		padding: 1em;
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
