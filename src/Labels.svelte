<script lang="ts">
    import { tags } from "./stores";
    import { randomColor } from "./util"

    let selected = [];
    let newLabel;
    let tagChecks;

    // TODO replace randomColor() with nice colorpallete chromajs
    const addLabel = () => {
        if (newLabel) {
            $tags = [...$tags, {label: newLabel, color: randomColor()}];
            newLabel = "";
        }
    };
</script>
<div style="display:inline-block">
    <input
        type="text"
        placeholder="add label"
        bind:value={newLabel}
        style="width:5em"
        on:keypress={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addLabel();
            }
        }}
    /><button on:click={addLabel}>+</button>
</div>
    <div class="tagChecks" bind:this={tagChecks}>
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

    .tagChecks {
        display: inline-flex;
        flex-flow: row wrap;
    }
</style>
