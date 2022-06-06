<script lang="ts">
	import { cueData, currentTime } from "./stores";
	import { onMount } from "svelte";
	import Toggle from "svelte-toggle";
	import { saveFile, getSelectionElements } from "./util.js";
	import { createPopper } from "@popperjs/core";
	import { appendLabel } from "./Notes.svelte";
	import TagSelect from "./TagSelect.svelte";

	// hack to keep popper running
	window.process = { env: { NODE_ENV: process.env.NODE_ENV } };

	let transcriptBox: HTMLDivElement;
	let transcriptContent: HTMLDivElement;
	let currentCue = 0;
	let editable = false;
	let popper;
	let mousedown = false;
	// the highlighted range
	// let start = 0;
	// let end = 0;
	let highlight: HTMLDivElement;
	let color = "#fff";
	// let addTag = false;

	onMount(() => {
		$cueData.forEach((cue) => {
			const activeNode = <HTMLElement>(
				transcriptContent.childNodes[cue.id - 1]
			);
			cue.onenter = () => {
				currentCue = cue.id - 1;
				const middleOffset =
					transcriptBox.getBoundingClientRect().height / 2;
				transcriptBox.scrollTo({
					left: 0,
					top: activeNode.offsetTop - middleOffset,
					behavior: "smooth",
				});
			};
		});
	});

	// function change_highlightarea() {
	// 	// do highlight
	// }

	// $: start, end, change_highlightarea();

	const downloadTranscript = async () => {
		let content = "WEBVTT\n";
		$cueData.forEach((cue) => {
			const activeNode = <HTMLElement>(
				transcriptContent.childNodes[cue.id - 1]
			);
			content += `\n${cue.id}\n${new Date(cue.startTime * 1000)
				.toISOString()
				.slice(11, -1)} --> ${new Date(cue.endTime * 1000)
				.toISOString()
				.slice(11, -1)}\n${
				activeNode.querySelector("span:nth-child(2)").textContent
			}\n`;
		});
		saveFile(new Blob([content]), "transcript.vtt");
	};

	const mouseUp = (e: MouseEvent) => {
		const elements = getSelectionElements(window.getSelection());
		if (mousedown && !editable) {
			// show tooltip
			// TODO popper destroy?
			console.log(<Element>elements[elements.length - 1]);
			popper = createPopper(<Element>elements[elements.length - 1], highlight, {
				placement: "bottom-end",
			});
			mousedown = false;
			highlight.style.display=''
		}
	};
</script>

<div class="transcript-container" bind:this={transcriptBox}>
	<div class="settings">
		<Toggle small label="Edit transcript" bind:toggled={editable} />
		<button on:click={downloadTranscript} style="margin-bottom: 0em;"
			>Download</button
		>
	</div>
	<div
		bind:this={highlight}
		class="transcript-tooltip"
		data-popper-reference-hidden
		data-popper-arrow
	>
		<TagSelect callback={(_label, _color) => {
			appendLabel([10,11], _label, _color)
			if(popper) {highlight.style.display='none'}
			}}/>
	</div>
	<div
		bind:this={transcriptContent}
		on:mouseup={mouseUp}
		on:mousedown={()=>{mousedown=true}}
	>
		{#each $cueData as cue, index}
			<p
				class:activeLine={index === currentCue}
				on:click={() => {
					if (!editable) $currentTime = cue.startTime;
				}}
				data-startTime={cue.startTime}
				data-endTime={cue.endTime}
				data-idx={index}
				id={"trans" + index}
			>
				<span class="bold"
					>{new Date(cue.startTime * 1000)
						.toISOString()
						.substring(11, 19)}-{new Date(cue.endTime * 1000)
						.toISOString()
						.substring(11, 19)}</span
				>:
				<span
					class={editable ? "edit-mode" : "read-mode"}
					class:editing={editable}
					contenteditable={editable}
				>
					{cue.text}</span
				>
			</p>
		{/each}
	</div>
</div>

<style>
	.transcript-container {
		flex: 15 1 30%;
		padding: 0 0.5em 0.5em 0.5em;
		display: block;
		overflow: auto;
	}
	.editing {
		color: #3f2e65;
	}
	.settings {
		position: sticky;
		top: 0px;
		background-color: #e6e4fe;
		padding: 2px;
		display: flex;
		row-gap: 10px;
	}
	.settings > button {
		margin-left: 1rem;
	}
	.activeLine {
		font-size: 1.1em;
	}
	:global(.bound) {
		height: 1em;
		width: 100%;
		background-color: red;
	}
	.transcript-tooltip {
		background-color: rgb(216, 216, 216);
		color: white;
		padding: 5px 10px;
		border-radius: 25px;
		font-size: 13px;
		display: flex;
		align-items: center;
	}
	/* Hide the popper when the reference is hidden */
	.transcript-tooltip[data-popper-reference-hidden] {
		visibility: hidden;
		pointer-events: none;
	}
</style>
