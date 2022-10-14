<script>
  import Dragbar from "./Dragbar.svelte";
  import { duration, currentTime, tags } from "./stores";
  import Ruler from "svelte-ruler";
  let ruler;
  let zoom = 15;
  let scrollX = 0;
  $: console.log($currentTime)

</script>



<h3>Timeline</h3>
<div class="container">
    
    <div class="timeline">
        <Ruler
        bind:this={ruler}
        type="horizontal"
        height="30"
        backgroundColor="#8884"
        textColor="#222a"
        class="row"
      />
      {#each Object.entries($tags) as [label, tag]}
        <svg viewBox="{$currentTime} 0 1000 40" overflow="scroll" preserveAspectRatio="xMidYMid meet" class="row">
          {#each [...tag["annotations"].keys()] as id}
            <Dragbar {label} {id} />
          {/each}
        </svg>
      {/each}
    </div>
</div>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
  }
  .row {
    width: 100%;
    height: 40px;
    border-bottom: solid 1px #ccc;
  }
  .timeline :global(:first-child) {
    border-top: solid 1px #ccc;
  }
</style>
