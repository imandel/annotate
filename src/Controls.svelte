<script lang="ts">
    import {paused, timer } from './stores';
    // import { play, pause, playUntil } from "./Video.svelte";


    const onClick =() =>{
        if($paused){
            console.log('shows paused')
            timer.play()
        } else{
            console.log('shows playing')
            timer.pause()
        }
    }
</script>

<button on:click={onClick}>{$paused ? 'play' : 'pause'}</button>

