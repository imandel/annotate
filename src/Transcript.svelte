<script lang="ts">
	import { cueData, currentTime, tags } from "./stores";
	import type { Tags } from "./stores";
	import { onMount, tick } from "svelte";
	import Toggle from "svelte-toggle";
	import { saveFile, getElementRange } from "./util.js";
	import { createPopper } from "@popperjs/core";
	import { appendLabel } from "./Notes.svelte";
	import TagSelect from "./TagSelect.svelte";
	$: updateMarkers($tags);

	// TODO make cell unactive on click
	// TODO sticky headers https://css-tricks.com/position-sticky-and-table-headers/
	const updateMarkers = async (trigger: Tags) => {
		tick().then(() => {
			Object.values(trigger).forEach((tag) => {
				[...tag.idxs].forEach((idx) => {
					const rowMarker = transcriptContent.querySelector(
						`.marker[data-idx="${idx}"].${tag.label}`
					);
					rowMarker?.classList.add("marked");
				});
			});
		});
	};

	// hack to keep popper running
	window.process = { env: { NODE_ENV: import.meta.env.MODE } };
	let transcriptBox: HTMLDivElement;
	let transcriptContent: HTMLDivElement;
	let currentCue = 0;
	let editable = false;
	let elements: HTMLElement[] = [];
	let mousedown = false;
	let highlight: HTMLDivElement;
	let start: HTMLDivElement;
	let end: HTMLDivElement;

	$: elements?.forEach((element) => {
		element.classList.add("active-highlight");
	});

	onMount(() => {
		$cueData.forEach((cue) => {
			const activeNode = <HTMLElement>(
				transcriptContent.querySelector(
					`div.content[data-idx="${cue.id - 1}"]`
				)
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

	const onMouseDown = (e: MouseEvent) => {
		start = (<HTMLDivElement>e.target).closest("div.content");
		mousedown = true;
	};
	const onMouseUp = (e: MouseEvent) => {
		if (mousedown && !editable) {
			end = (<HTMLDivElement>e.target).closest("div.content");
			elements = getElementRange(start, end);
			createPopper(elements[elements.length - 1], highlight, {
				placement: "bottom-end",
			});
			highlight.style.display = "";
			mousedown = false;
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		if (mousedown) {
			end = (<HTMLDivElement>e.target).closest("div.content");
			elements = getElementRange(start, end);
		}
	};

	const downloadTranscript = async () => {
		let content = "WEBVTT\n";
		$cueData.forEach((cue) => {
			const activeNode = <HTMLElement>(
				transcriptContent.querySelector(
					`div.content[data-idx="${cue.id - 1}"]`
				)
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

	const tagSelectCallback = (_label: string, _color: string) => {
		appendLabel(
			[
				parseFloat(elements[0].dataset.starttime),
				parseFloat(elements[elements.length - 1].dataset.endtime),
			],
			_label,
			_color
		);
		elements.forEach((element) => {
			$tags[_label].idxs.add(parseInt(element.dataset.idx));
		});
		$tags = $tags;
		elements = [];
		highlight.style.display = "none";
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
		<TagSelect callback={tagSelectCallback} />
	</div>
	<div
		tabindex="0"
		on:focusin={() => {}}
		on:blur={() => {
			document
				.querySelectorAll(".active-highlight")
				.forEach((element) =>
					element.classList.remove("active-highlight")
				);
			highlight.style.display = "none";
			window.getSelection()?.removeAllRanges();
			// elements = [];
		}}
	>
		<div
			bind:this={transcriptContent}
			class="transcript-content"
			style="grid-template-columns: repeat({Object.values($tags)
				.length}, minmax(6px, auto)) 95%;"
			on:mouseup={onMouseUp}
			on:mousedown={onMouseDown}
			on:mousemove={onMouseMove}
		>
			{#each $cueData as cue, index}
				<!-- <tr
					data-startTime={cue.startTime}
					data-endTime={cue.endTime}
					data-idx={index}
				> -->
				{#each Object.values($tags) as tag}
					<div
						class="marker {tag.label}"
						style="--tag-color: {tag.color}"
						data-idx={index}
					/>
				{/each}

				<div
					class="content"
					data-starttime={cue.startTime}
					data-endtime={cue.endTime}
					data-idx={index}
				>
					<p
						class:activeLine={index === currentCue}
						on:click={() => {
							if (!editable) $currentTime = cue.startTime;
						}}
					>
						<span class="bold"
							>{new Date(cue.startTime * 1000)
								.toISOString()
								.substring(11, 19)}-{new Date(
								cue.endTime * 1000
							)
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
				</div>
				<!-- </tr> -->
			{/each}
		</div>
	</div>
</div>

<style>
	.transcript-container {
		flex: 15 1 30%;
		padding: 0 0.5em 0.5em 0.5em;
		display: block;
		overflow: auto;
		/* user-select: none; */
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
		/* visibility: hidden; */
		pointer-events: none;
		display: none;
	}
	.marked {
		/* width: 9px; */
		background-color: var(--tag-color);
		/* padding: 0px; */
	}
	.marker {
		/* width: 9px; */
		/* background-color: var(--tag-color); */
		padding: 0px;
	}
	.transcript-content {
		display: grid;
	}

	.content {
		padding-left: 8px;
	}
	p {
		margin: 0.5em 0em 0.5em 0em;
	}
	:global(.active-highlight) {
		background-color: #e6e4fe;
	}
	:global(.active-highlight::selection) {
		background-color: transparent;
	}
</style>
