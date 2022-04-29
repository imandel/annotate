<script lang="ts">
	// 	 on:mousedown={(e)=>{if(e.shiftKey){selecting=true; $curKeypoint.id = getId('transcript_')}}}
	//  on:mousemove={selection}
	//  on:mouseup={(e)=>{if(selecting){selection(e);selecting=false; window.getSelection().empty()}}}
	import { cueData, currentTime, tags, colors, write_now, range} from './stores';
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
	$write_now = false;
	// $: $range = [start, end];

	// TODO: tags with colors
	$: show_colors = $colors.slice(0 , 1 + $tags.length);
	let highlights = Array($cueData.length).fill(0);
	$: shows = highlights;

	// divider
	let dividerStart;
	let dividerEnd;
	let hovering;

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
		// set the bounding box of the highlighted area
		const startElement = document.getElementById("trans" + String(start));
		const endElement = document.getElementById("trans" + String(end));
		startElement.before(dividerStart);
		endElement.after(dividerEnd);
	}

	function change_range(){
		const startTime = new Date($cueData[start].startTime * 1000).toISOString().substring(11, 19);
		const endTime = new Date($cueData[end].endTime * 1000).toISOString().substring(11, 19);
		$range = [startTime, endTime];
		// console.log($range);
	}
	$: start, end, start && end && change_range();

	function highlight_with_color(color){
		// change [ start,  end ] to color index
		for(var i = start; i <= end; i++){
			highlights[i] = color;
		}
	}


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
			// if only one section is selected, set end to start;
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
			// show tooltip
			createPopper(endElement, highlight, {
				placement: 'bottom-end',
			});
			change_highlightarea();
			change_range();
        }
    }


	// divider drag
	const dragstart = (e) => {
		const target = e.target.closest('p');
		let now;
		if(target){
			now = parseInt(target.id.replace("trans",""));
		}
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData('text/plain', now);
		change_highlightarea();
	}

	const drop = (e) => {
		console.log("dropping");
		e.dataTransfer.dropEffect = 'move'; 
		const target = e.target.closest('p');
		if(target){
			start = parseInt(target.id.replace("trans",""));
		}
		change_highlightarea();

  	}

</script>

<div class="transcript-container" bind:this={transcriptBox}>
	<div class="settings">
		<Toggle small label="Edit transcript" bind:toggled={editable} />
		<button on:click={downloadTranscript} style="margin-bottom: 0em;">Download</button>
	</div>

	<div bind:this={dividerStart} draggable={true} on:dragstart={dragstart}  class="divider">
	</div>
	<div bind:this={dividerEnd} class="divider">
	</div>

		<div bind:this={highlight} id="tooltip" data-popper-reference-hidden data-popper-arrow >
			<span class="liner-circle" style="background-color:#000" on:click={() => change_range()}>
			</span>
			{#each show_colors as c, index}
				<span class="liner-circle" style="background-color:{c}" on:click={() => highlight_with_color(index)}>
				</span>
			{/each}
			
		</div>
	<div bind:this={transcriptContent} on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={mouseMove}>
		{#each $cueData as cue, index}
			<p
				class:activeLine={index === currentCue}
				style={"background-color:" + show_colors[shows[index]] + ";"}
				on:click ={()=>{if(!editable)$currentTime = cue.startTime}}
				on:drop|preventDefault={drop}
				on:dragenter={() => {hovering = index}}
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
		background-color: rgb(216, 216, 216);
		color: white;
		padding: 5px 10px;
		border-radius: 25px;
		font-size: 13px;
		display: inline-block;
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

	.divider{
		height: 6px;
		width: 100%;
		border-radius: 25%;
		background-color:rgb(219, 255, 134);
		display:inline-block;
		cursor:pointer;
	}

</style>
