<script>
  import Dragbar from "./Dragbar.svelte";
  import { duration, tags, timer } from "./stores";
  import Ruler from "svelte-ruler";

  let ruler;
  let zoom = 1;
  let SvgTimeline;
  let scrollPosition = 0;
  $: console.log($timer.query().position)

  $: length = Object.keys($tags).length;
  $: ranges = [0, $duration];

  // make sure ruler scrolls with the timeline
  $: if (ruler) {
    ruler.scroll(scrollPosition);
  }

  // DRAG current time
  function cursor_drag(event) {
    let moving = false;
    event.addEventListener("mousedown", () => {
      moving = true;
    });
    window.addEventListener("mousemove", (e) => {
      if (moving) {
        console.log('moving')
        const nextTime = $timer.query().position + e.movementX / zoom;
        if (nextTime >= 0 && nextTime <= $duration) {
          $timer.update({position: nextTime})
          // $timer = $timer
        }
      }
    });
    window.addEventListener("mouseup", () => {
      if (moving) {
        moving = false;
      }
    });
  }

  // Change current time in ruler
  function change_current_time(event) {
    let changeTime = false;
    event.addEventListener("mousedown", (e) => {
      changeTime = true;
      $timer.update( {position: e.offsetX / zoom + scrollPosition});
    });
    event.addEventListener("mousemove", (e) => {
      if (changeTime) {
        $timer.update( {position: e.offsetX / zoom + scrollPosition});
      }
    });
    event.addEventListener("mouseup", () => {
      changeTime = false;
    });
  }

  // Util: Seconds to Time
  function time_convert(num) {
    let minutes = Math.floor(num / 60);
    let seconds = num % 60;
    if (seconds == 0) {
      return minutes + ":00";
    } else {
      return minutes + ":" + seconds;
    }
  }
</script>

{#if $duration != 0}
  <button on:click={() => {zoom *= 2;}}> + </button>
  <button on:click={() => {zoom = 1;}}>{zoom}</button>
  <button on:click={() => {zoom /= 2;}}> - </button>
  <div class="container">
    <div use:change_current_time>
      <Ruler
        bind:this={ruler}
        type="horizontal"
        height="30"
        range={ranges}
        backgroundColor="#ccc"
        textColor="#222a"
        {zoom}
        unit="60"
        textFormat={time_convert}
      />
    </div>
    <div
      class="timeline"
      bind:this={SvgTimeline}
      on:scroll={() => (scrollPosition = SvgTimeline.scrollLeft / zoom)}
    >
      <svg
        width={$duration * zoom}
        height={length * 40}
        viewBox="0 0 {$duration * zoom} {length * 40}"
        preserveAspectRatio="xMinYMin meet"
      >
        {#each Object.entries($tags) as [label, tag], index (label)}
          {#each [...tag["annotations"].keys()] as id}
            <Dragbar {label} {id} {index} {zoom} />
          {/each}
          <line
            x1="0"
            y1="{(index + 1) * 40} "
            x2={$duration * zoom}
            y2={(index + 1) * 40}
            style="stroke:gray;stroke-width:0.4"
          />
        {/each}
        <line
          x1={$timer.query().position * zoom}
          y1="-100"
          x2={$timer.query().position * zoom}
          y2={length * 40}
          use:cursor_drag
          class="current"
        />
      </svg>
    </div>
  </div>
{/if}

<style>
  .timeline {
    width: 100%;
    overflow: scroll;
  }
  .timeline::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
  .current {
    stroke: #ccc;
    stroke-width: 1.5;
    cursor: pointer;
  }
  .current:hover {
    stroke: #222a;
    stroke-width: 5;
    transition: 0.2s linear;
  }
</style>
