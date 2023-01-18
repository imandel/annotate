<script lang="ts">
    import { paused, timer, zoom } from "./stores";
    let time = "0";
    requestAnimationFrame(function updateUI() {
        const { position } = $timer.query();
        time = position.toFixed(2);
        requestAnimationFrame(updateUI);
    });

    const onClick = () => {
        if ($paused) {
            timer.play();
        } else {
            timer.pause();
        }
    };
</script>

<button on:click={onClick}>{$paused ? "play" : "pause"}</button>
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
