<script lang="ts">
    import { tags, selectedTags } from "./stores";
    import LabelInput from "./LabelInput.svelte" 
    $: console.log($selectedTags)
    // let selected = [];

</script>
<span style="margin:0 0 0.5em 0;"><LabelInput><button slot='add'>+</button></LabelInput></span>
    <div class="tagChecks">
        {#if Object.keys($tags).length}
            {#each Object.values($tags) as tag}
                <div class="check-container" style="background-color: {tag.color};">
                    <input
                        type="checkbox"
                        bind:group={$selectedTags}
                        value={tag}
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
