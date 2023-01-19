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
        paused,
        videoFile,
        videoFiles,
        timer,
        audio
    } from "./stores";

    export let captionsFile = undefined;
    console.log($videoFile);
    let track: HTMLTrackElement;

    const scrollTime = (e) => {
        // e.preventDefault();
        // const {position} = $timer.query()
        // $timer.update({position: position - e.deltaY / 10});
    };

    const setupCues = () => {
        console.log("cues loaded");
        player.textTracks[0].mode = "hidden";
        $cueData = [...track.track.cues];
        timer.setTimingsrc(player, 0);
    };
</script>

<div id="vid-div" on:wheel={scrollTime}>
    <div id="vid-container">
        {#each Object.entries($videoFiles) as [name, value]}
            {#if name == $videoFile}
                <video
                    bind:this={player}
                    bind:duration={$duration}
                    bind:paused={$paused}
                    muted={$audio !== name}
                >
                    <source
                        src={value.src}
                        type="video/mp4"
                    />
                    <track
                        default
                        bind:this={track}
                        on:load={setupCues}
                        kind="captions"
                        src={captionsFile}
                        srclang="En"
                    />
                </video>
                {:else}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video src={value.src} muted={$audio !== name}></video>
            {/if}
        {/each}
    </div>
</div>

<style>
    #vid-div {
        flex: 1 1 37%;
    }

    #vid-container {
        height: 100%;
        display: flex;
    }
</style>
