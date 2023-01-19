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
        audio,
    } from "./stores";
    $: console.log($audio)
    export let captionsFile = undefined;
    console.log($videoFile);
    let track: HTMLTrackElement;

    const scrollTime = (e) => {
        // e.preventDefault();
        // const {position} = $timer.query()
        // $timer.update({position: position - e.deltaY / 10});
    };

    const setupVideo = (fileName: string) => {
        const videoData = $videoFiles[fileName];
        console.log("loading", fileName, videoData.offset);
        if (fileName == $videoFile) {
            console.log("cues loaded");
            videoData.element.textTracks[0].mode = "hidden";
            $cueData = [...track.track.cues];
        }
        timer.setTimingsrc(videoData.element, videoData.offset);
    };
</script>

<div id="vid-div" on:wheel={scrollTime}>
    <div id="vid-container">
        {#each Object.entries($videoFiles) as [name, value]}
            {#if name == $videoFile}
                <video
                    bind:this={$videoFiles[name].element}
                    bind:duration={$duration}
                    bind:paused={$paused}
                    class="vid"
                    class:visible={$videoFiles[name].visible}
                    muted={$audio !== name}
                >
                    <source src={value.src} type="video/mp4" />
                    <track
                        default
                        bind:this={track}
                        on:load={() => setupVideo(name)}
                        kind="captions"
                        src={captionsFile}
                        srclang="En"
                    />
                </video>
            {:else}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video
                    src={value.src}
                    muted={$audio !== name}
                    bind:this={$videoFiles[name].element}
                    class="vid"
                    class:visible={$videoFiles[name].visible}
                    on:canplay={() => setupVideo(name)}
                />
            {/if}
        {/each}
    </div>
</div>

<style>
    #vid-div {
        flex: 1 1 37%;
    }
    .vid {
        display: none;
    }
    .visible {
        display: inline;
    }

    #vid-container {
        height: 100%;
        display: flex;
    }
</style>
