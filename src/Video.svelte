<script context="module" lang="ts">
    let player: HTMLVideoElement;
    export function play() {
        if (player && player.readyState) {
            player.play();
        }
    }

    export async function playUntil(timestamp: Number) {
        return new Promise((resolve) => {
            if (player && player.readyState) {
                player.play();
                // pause at end timestamp
                player.ontimeupdate = () => {
                    // TODO cancel if user interacts with video otherwise?
                    // player.onseeking = () => {
                    //     player.ontimeupdate = () => {};
                    //     player.onseeking = () => {};
                    // };
                    if (player.currentTime > timestamp) {
                        player.pause();
                        // remove this event handler
                        player.ontimeupdate = () => {};
                        resolve(1);
                    }
                };
            }
        });
    }

    export function pause() {
        if (player && player.readyState) {
            player.pause();
        }
    }
</script>

<script lang="ts">
    import {
        cueData,
        duration,
        currentTime,
        paused,
        videoFile,
    } from "./stores";
    // let files: FileList;
    // export let $videoFile = undefined;
    export let captionsFile = undefined;

    let track: HTMLTrackElement;

    const setupCues = () => {
        console.log("cues loaded");
        player.textTracks[0].mode = "hidden";
        $cueData = [...track.track.cues];
    };
</script>

{#if $videoFile}
    <div
        id="vid-div"
        on:wheel={(e) => {
            e.preventDefault();
            $currentTime -= e.deltaY / 10;
        }}
    >
        <div id="vid-container">
            <video
                bind:this={player}
                controls
                bind:currentTime={$currentTime}
                bind:duration={$duration}
                bind:paused={$paused}
            >
                <source src={$videoFile} type="video/mp4" />
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
