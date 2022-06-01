<script lang="ts">
    import { tags } from "./stores";
    import { randomColor } from "./util"

    let selected = [];
    let newLabel;
    let tagChecks;
    // $: console.log($tags);

    // TODO replace randomColor() with nice colorpallete chromajs

    const addLabel = () => {
        if (newLabel) {
            $tags = [...$tags, {label: newLabel, color: randomColor()}];
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
                <div class="check-container" style="background-color: {tag.color};">
                    <input
                        type="checkbox"
                        bind:group={selected}
                        value={tag.label}
                        id={tag.label}
                    />
                    <span><label for={tag.label}>{tag.label}</label></span>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .check-container {
        padding: 0.5em;
        border-radius: 15px;
        margin: 0 7px;
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
