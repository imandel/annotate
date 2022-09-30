<script>
  import Dragbar from "./Dragbar.svelte";
  import { duration, currentTime, tags } from "./stores";
  import Ruler from "svelte-ruler";
  let ruler;
  let zoom = 1.5;
  let scrollX = 0;
  $: console.log($tags)


  function onMouseMove(event) {
    scrollX += event.deltaX;
    console.log("what");
    ruler.scroll(scrollX);
  }
  function onMouseDown(event) {
    console.log("Down");
    addEventListener("mousemove", onMouseMove);
    addEventListener("mouseup", onMouseUp);
  }
  function onMouseUp() {
    removeEventListener("mousemove", onMouseMove);
    removeEventListener("mouseup", onMouseUp);
  }

</script>

<div class="container">
  <h3>Timeline</h3>
    <Ruler
      bind:this={ruler}
      type="horizontal"
      height="30"
      backgroundColor="#8884"
      textColor="#222a"
      unit="100"
      {zoom}
      on:mousedown={onMouseDown}
    />
	<div class="timeline">
		{#each Object.entries($tags) as [label, tag]}
			<svg height="40">
				{#each [...tag["annotations"].keys()] as key}
					<Dragbar {label} {key} />
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
  .timeline :global(svg) {
    border-bottom: solid 1px #ccc;
  }
  .timeline :global(:first-child) {
    border-top: solid 1px #ccc;
  }
</style>
