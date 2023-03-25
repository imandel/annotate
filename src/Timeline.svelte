<script>
  import Dragbar from "./Dragbar.svelte";
  import { duration, tags, timer, zoom, label_colors } from "./stores";
  // @ts-ignore
  import Ruler from "svelte-ruler";

  let ruler;
  let timePosition;
  let nextTime = 0;
  let lastTime = 0;
  let lastVelocity = 0;
  let moving = false;
  let SvgTimeline;
  let scrollPosition = 0;

  $: length = Object.keys($label_colors).length;
  $: ranges = [0, $duration];
  $: if (moving) {
    timePosition = nextTime;
  }
  requestAnimationFrame(function updateUI() {
    const { position } = $timer.query();
    if (!moving) {
      timePosition = position;
    }
    requestAnimationFrame(updateUI);
  });

  // make sure ruler scrolls with the timeline
  $: if (ruler) {
    ruler.scroll(scrollPosition);
  }

  // DRAG current time
  function cursor_drag(event) {
    event.addEventListener("mousedown", () => {
      ({ position: lastTime, velocity: lastVelocity } = $timer.query());
      nextTime = lastTime;
      moving = true;
      $timer.update({ velocity: 0 });
    });
    window.addEventListener("mousemove", (e) => {
      if (moving) {
        nextTime = Math.min(
          $duration,
          Math.max(0, nextTime + e.movementX / $zoom)
        );
        if (Math.abs(nextTime - lastTime) > 2) {
          $timer.update({ position: nextTime });
          lastTime = nextTime;
        }
      }
    });
    window.addEventListener("mouseup", () => {
      if (moving) {
        moving = false;
        $timer.update({ velocity: lastVelocity });
      }
    });
  }

  // Change current time in ruler
  function change_current_time(event) {
    let changeTime = false;
    event.addEventListener("mousedown", (e) => {
      changeTime = true;
      $timer.update({ position: e.offsetX / $zoom + scrollPosition });
    });
    event.addEventListener("mousemove", (e) => {
      if (changeTime) {
        $timer.update({ position: e.offsetX / $zoom + scrollPosition });
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
  <div class="container">
    <div use:change_current_time>
      <Ruler
        bind:this={ruler}
        type="horizontal"
        height="30"
        range={ranges}
        backgroundColor="#ccc"
        textColor="#222a"
        zoom={$zoom}
        unit="60"
        textFormat={time_convert}
      />
    </div>
    <div
      class="timeline"
      bind:this={SvgTimeline}
      on:scroll={() => (scrollPosition = SvgTimeline.scrollLeft / $zoom)}
    >
      <svg
        width={$duration * $zoom}
        height={length * 40}
        viewBox="0 0 {$duration * $zoom} {length * 40}"
        preserveAspectRatio="xMinYMin meet"
      >

      {#each Object.entries($label_colors).reverse() as [label, color], index (label)}
        {#if $tags[label]}
          {#each [...$tags[label]["annotations"].keys()] as id}
            <Dragbar {label} {id} {index} />
          {/each}
        {/if}
        <line
            x1="0"
            y1="{(index + 1) * 40} "
            x2={$duration * $zoom}
            y2={(index + 1) * 40}
            style="stroke:gray;stroke-width:0.4"
          />
      {/each}


        <line
          x1={timePosition * $zoom}
          y1="-100"
          x2={timePosition * $zoom}
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
