<script lang="ts">
    import { tags , colors} from "./stores";

    let selected = [];
    let newLabel;
    let tagChecks;
    $: tag_colors = $colors.slice(1, 1 + $tags.length);

    const addLabel = () => {
        if (newLabel) {
            $tags = [...$tags, newLabel];
            newLabel = "";
        }
    };
</script>

<div style="display:inline-block">
    <div class="tagChecks" bind:this={tagChecks}>
        <div>
            <input
                type="text"
                placeholder="add label"
                bind:value={newLabel}
                style="width:5em"
            /><button on:click={addLabel}>+</button>
        </div>
        {#if $tags.length}
            {#each $tags as tag, index}
                <div class="check-container" style="background-color: {tag_colors[index]};">
                    <input
                        type="checkbox"
                        bind:group={selected}
                        value={tag}
                        id={tag}
                    />
                    <span>
                        <label for={tag}>{tag}</label>
                    </span>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .check-container {
        padding: 0.5em;
    }
    label {
        display: inline-block;
        /* width: 200px; */
    }

    /* label input {
        float: left;
    }

    label span {
        display: block;
        overflow: auto;
    } */
    .tagChecks {
        display: flex;
        flex-flow: row wrap;
        /* justify-content: space-evenly; */
    }
</style>
