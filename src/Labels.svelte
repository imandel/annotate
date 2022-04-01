<script lang="ts">
    import { tags } from "./stores";

    let selected = [];
    let newLabel;
    let tagChecks;
    // $: console.log($tags);

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
                <div class="check-container">
                    <input
                        type="checkbox"
                        bind:group={selected}
                        value={tag}
                        id={tag}
                    />
                    <span><label for={tag}>{tag}</label></span>
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
