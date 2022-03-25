<script context="module">
    let player;
    export function play() {
        if (player && player.readyState) {
            player.play();
        }
    }

    export function pause() {
        if (player && player.readyState) {
            player.pause();
        }
    }
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { cueData, duration, currentTime, paused } from "./stores";
    let files: FileList;
    export let videoFile = undefined;
    export let captionsFile = undefined;

    let track: HTMLTrackElement;
    let height;

    const setupCues = () => {
        console.log("cues loaded");
        player.textTracks[0].mode = "hidden";
        $cueData = [...track.track.cues];
    };
</script>

{#if videoFile}
    <div id="vid-div">
        <div id="vid-container" bind:clientHeight={height}>
            <video
                bind:this={player}
                controls
                bind:currentTime={$currentTime}
                bind:duration={$duration}
                bind:paused={$paused}
            >
                <source src={videoFile} type="video/mp4" />
                <track
                    default
                    bind:this={track}
                    on:load={setupCues}
                    kind="captions"
                    src={captionsFile}
                    type="text/vtt"
                    srclang="En"
                />
            </video>
        </div>
    </div>
{/if}

<style>
    #vid-div {
        flex: 1 1 37%;
    }

    #vid-container {
        height: 100%;
        display: flex;
    }
</style>
