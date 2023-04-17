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
    export let captionsFile = undefined;
    let track: HTMLTrackElement;
    $: console.log($videoFile)
    const scrollTime = (e) => {
        // e.preventDefault();
        // const {position} = $timer.query()
        // $timer.update({position: position - e.deltaY / 10});
    };

    const setupVideo = (fileName: string) => {
        const { element, offset } = $videoFiles[fileName];
        console.log('setupVideo', fileName, element, offset)
        timer.setTimingsrc(element, offset);
    };

    const setupTrack = (fileName: string) => {
        console.log('setupTrack')
        const { element } = $videoFiles[fileName];
        console.log("cues loaded");
        element.textTracks[0].mode = "hidden";
        $cueData = [...track.track.cues];
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
                    style="transform: rotate({$videoFiles[name].rotation}deg);"
                    class:visible={$videoFiles[name].visible}
                    muted={$audio !== name}
                    on:loadedmetadata={() => setupVideo(name)}
                >
                    <source src={value.src} type="video/mp4" />
                    {#if captionsFile}
                        <track
                            default
                            bind:this={track}
                            on:load={() => setupTrack(name)}
                            kind="captions"
                            src={captionsFile}
                            srclang="En"
                        />
                    {/if}
                </video>
            {:else}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video
                    src={value.src}
                    muted={$audio !== name}
                    bind:this={$videoFiles[name].element}
                    class="vid"
                    style="transform: rotate({$videoFiles[name].rotation}deg);"
                    class:visible={$videoFiles[name].visible}
                    on:loadedmetadata={() => setupVideo(name)}
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
