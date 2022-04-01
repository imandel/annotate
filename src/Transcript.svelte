<script lang="ts">
	// 	 on:mousedown={(e)=>{if(e.shiftKey){selecting=true; $curKeypoint.id = getId('transcript_')}}}
	//  on:mousemove={selection}
	//  on:mouseup={(e)=>{if(selecting){selection(e);selecting=false; window.getSelection().empty()}}}
	import { cueData, currentTime } from './stores';
	import { onMount } from 'svelte';
	import Toggle from 'svelte-toggle';
	import { saveFile } from './util.js'
	import { createPopper } from '@popperjs/core';

	let transcriptBox;
	let transcriptContent;
	let currentCue;
	let editable = false;
	// the highlighted range
    let start;
    let end;
    let mDown = false;
	let highlight;
	let color = "#fff";
	let colors = ["rgb(255, 255, 131)", "rgb(166, 255, 233)","rgb(255, 199, 186)","rgb(217, 195, 255)",
				"rgb(184, 238, 255)", "rgb(255, 208, 239)"];

    onMount(() => {
		$cueData.forEach((cue) => {
			const activeNode = transcriptContent.childNodes[cue.id - 1];
			cue.onenter = () => {
				currentCue = cue.id - 1;
				const middleOffset = transcriptBox.getBoundingClientRect().height / 2;
				transcriptBox.scrollTo({
					left: 0,
					top: activeNode.offsetTop - middleOffset,
					behavior: 'smooth'
				});
			};
		});
	});
	
	function change_highlightarea(){
		// do highlight
	}

	$: start, end, change_highlightarea();

	const downloadTranscript = async () => {
		// console.log(transcriptContent.childNodes[0]);
		let content = 'WEBVTT\n';
		$cueData.forEach((cue) => {
			const activeNode = transcriptContent.childNodes[cue.id - 1];
			content += `\n${cue.id}\n${new Date(cue.startTime * 1000)
				.toISOString()
				.slice(11, -1)} --> ${new Date(cue.endTime * 1000).toISOString().slice(11, -1)}\n${
				activeNode.querySelector('span:nth-child(2)').textContent
			}\n`;
		});
		saveFile(new Blob([content]), 'transcript.vtt');
	};

    const mouseDown = (e) => {
        mDown = true;
        // e.preventDefault()
        const target = e.target.closest('p');
		// highlight.style.visibility='hidden';
		if(target){
			// set the highlight area : [start, end]
			start = parseInt(target.id.replace("trans",""));
			end = start;
		}
    }

    const mouseMove = (e) => {
        if(mDown){
            const target = e.target.closest('p')
			if(target){
				end = parseInt(target.id.replace("trans",""));
			}
        }
    }

    const mouseUp = (e) => {
        console.log('up')
        if(mDown){
            mDown = false;
			const endElement = document.getElementById("trans"+String(end));
			// highlight.style.visibility = "visible";
			// console.log(highlight);
			// show tooltip
			createPopper(endElement, highlight, {
				placement: 'bottom-end',
			});
        }
    }
</script>

<div class="transcript-container" bind:this={transcriptBox}>
	<div class="settings">
		<Toggle small label="Edit transcript" bind:toggled={editable} />
		<button on:click={downloadTranscript} style="margin-bottom: 0em;">Download</button>
	</div>
	<div bind:this={highlight} id="tooltip" data-popper-reference-hidden data-popper-arrow >
		{#each colors as c}
			<span class="liner-circle" style="background-color:{c}" on:click={()=>{color=c}}>
			</span>
		{/each}
	</div>
	<div bind:this={transcriptContent} on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={mouseMove}>
		{#each $cueData as cue, index}
			<p
				class:activeLine={index === currentCue}
				style={(index >= start && index <= end) ? "background-color:" + color + ";" : ""}
				on:click ={()=>{if(!editable)$currentTime = cue.startTime}}
				data-startTime={cue.startTime}
				data-endTime={cue.endTime}
				data-idx={index}
				id={"trans"+index}
			>
				<span class="bold"
					>{new Date(cue.startTime * 1000).toISOString().substring(11, 19)}-{new Date(
						cue.endTime * 1000
					)
						.toISOString()
						.substring(11, 19)}</span
				>:
				<span
					class={editable ? 'edit-mode' : 'read-mode'}
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
    :global(.bound){
        height: 1em;
        width: 100%;
        background-color: red;
    }
	#tooltip {
		background-color: #fff;
		color: white;
		padding: 5px 10px;
		border-radius: 25px;
		font-size: 13px;
	}
	/* Hide the popper when the reference is hidden */
	#tooltip[data-popper-reference-hidden] {
	visibility: hidden;
	pointer-events: none;
	}

	.liner-circle {
		height: 18px;
		width: 18px;
		margin: 0 5px;
		border-radius: 50%;
		display: inline-block;
		cursor: pointer;
	}

</style>
