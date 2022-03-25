<script lang="ts">
    import { onMount } from "svelte";
    import { duration, currentTime, tags, paused } from "./stores";
    let main: HTMLDivElement;
    let shadow: HTMLDivElement;
    let cursor: HTMLDivElement;
    let m = { x: 0, y: 0 };
    let x = 0 ;
    let right = 0;
    let hidden= true;


    $: if(main) ({ x, right } = main.getBoundingClientRect()) //cursor.style.left = `${timeToPosition($currentTime)}px`
    $: if(cursor) cursor.style.left = `${timeToPosition($currentTime)}px`
    const timeToPosition = (time: number) => {
      return ( time ) * (right - x) / ($duration + x);
    }

    const positionToTime = (position: number) => {
      return position * ($duration + x) / (right - x);
    }

    onMount(() => {
        ({ x, right } = main.getBoundingClientRect())
    })
    

    $: console.log(m);

    const moveShadow = (e: MouseEvent) => {
        hidden=false;
        shadow.style.left = (`${Math.max(x, Math.min(right, e.clientX-x))}px`);
    }
    const mouseOut = (e: MouseEvent) => {
        hidden=true;
        // shadow.style.left = cursor.style.left;
    }
    const timelineClick = (e: MouseEvent) => {
        $currentTime = positionToTime(parseFloat(shadow.style.left, 10))
        // cursor.style.left = shadow.style.left;
        hidden=true;
    }

</script>
<div class='main' 
    bind:this={main}
    on:mousemove={moveShadow}
    on:mouseleave={mouseOut}
    on:click={timelineClick}
    >
    <div bind:this={cursor} class='play-cursor'></div>
    <div bind:this={shadow} class='play-cursor shadow' class:hidden></div>

</div>
    
<style>
    .main{
        width: 100%;
        background-color: blanchedalmond;
        height: 40px;
        position: relative;
        
    }
    .play-cursor{
        height: 100%;
        width: 3px;
        background-color: rgb(255, 110, 110);
        
        /* transform:translate3d(0,0,0); */
  /* transition:transform 0.2s cubic-bezier(.02,1.23,.79,1.08); */
        left: 50%;
        display: inline-block;
        position: absolute;
    }
    .shadow{
        background-color: aqua;
        /* left: 0; */
        /* left: 25%; */
        /* left: 0px; */
        margin: 0 auto;
        display: inline-block;
        user-select: none;
    }
    .hidden{
        display: none;
    }
</style>