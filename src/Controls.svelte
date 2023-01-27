<script lang="ts">
    import { paused, timer, zoom } from "./stores";
    let time = "0";
    let speeds = [0.5, 1, 1.25, 1.5, 1.75, 2, 3]
    let selected = 1
    requestAnimationFrame(function updateUI() {
        const { position } = $timer.query();
        time = position.toFixed(2);
        requestAnimationFrame(updateUI);
    });

    const onClick = () => {
        if ($timer.query().velocity===0) {
            timer.play();
        } else {
            timer.pause();
        }
    };
</script>
<button on:click ={()=>$timer.update({position: $timer.query().position -10})}> &lt;&lt; </button>
<button on:click ={()=>$timer.update({position: $timer.query().position -1})}> &lt; </button>
<button on:click={onClick}>{$paused ? "play" : "pause"}</button>
<button on:click ={()=>$timer.update({position: $timer.query().position + 1})}> &gt;&gt; </button>
<button on:click ={()=>$timer.update({position: $timer.query().position +10})}> &gt; </button>
<label style="display: inline-block;">speed: <select bind:value={selected} on:change={() => $timer.update({velocity:selected})}>
    {#each speeds as speed}
    <option value={speed}>{speed}</option>
    {/each}
</select></label>
<button
    on:click={() => {
        $zoom /= 2;
    }}
>
    -
</button>
<button
    on:click={() => {
        $zoom = 1;
    }}>{$zoom}</button
>
<button
    on:click={() => {
        $zoom *= 2;
    }}
>
    +
</button>

<span>{time}</span>
