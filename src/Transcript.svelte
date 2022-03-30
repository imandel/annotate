<script lang="ts">
	// 	 on:mousedown={(e)=>{if(e.shiftKey){selecting=true; $curKeypoint.id = getId('transcript_')}}}
	//  on:mousemove={selection}
	//  on:mouseup={(e)=>{if(selecting){selection(e);selecting=false; window.getSelection().empty()}}}
	import { cueData, currentTime } from './stores';
	import { onMount } from 'svelte';
	import Toggle from 'svelte-toggle';
	import { saveFile } from './util.js'
	let transcriptBox;
	let transcriptContent;
	let currentCue;
	let highlights = [];
	let editable = false;
    let start;
    let end;
    let selectionRange = document.createRange();
    let mDown = false;

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

	const downloadTranscript = async () => {
		console.log(transcriptContent.childNodes[0]);
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
        const target = e.target.closest('p')
        // target.before(start);
        // console.log(start)
        selectionRange.setStartBefore(target);
    }

    const mouseMove = (e) => {
        if(mDown){
            const target = e.target.closest('p')
            // console.log(target)
            selectionRange.setEndAfter(target);
        }

    }

    const mouseUp = (e) => {
        console.log('up',e)
        if(mDown){
            mDown = false
            console.log(selectionRange.cloneContents())
            // selectionRange.detach()
        }
    }
</script>

<div class="transcript-container" bind:this={transcriptBox}>
	<div class="settings">
		<Toggle small label="Edit transcript" bind:toggled={editable} />
		<button on:click={downloadTranscript} style="margin-bottom: 0em;">Download</button>
	</div>
	<div bind:this={transcriptContent} on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={mouseMove}>
		{#each $cueData as cue, index}
			<p
				class:activeLine={index === currentCue}
				class:highlighted={highlights.includes(index)}
				on:click ={()=>{if(!editable)$currentTime = cue.startTime}}
				data-startTime={cue.startTime}
				data-endTime={cue.endTime}
				data-idx={index}
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
	.highlighted {
		background-color: yellow;	
	}
    :global(.bound){
        height: 1em;
        width: 100%;
        background-color: red;
    }
</style>
