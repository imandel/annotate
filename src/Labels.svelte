<script lang="ts">
    import { tags, label_colors } from "./stores";
    import LabelInput from "./LabelInput.svelte" 
    // let selected = [];

</script>
<span style="margin:0 0 0.5em 0;"><LabelInput><button slot='add'>+</button></LabelInput></span>
    <div class="tagChecks">
        {#if Object.keys($label_colors).length}
            {#each Object.keys($label_colors) as tag}
                <div class="check-container" style="background-color: {$label_colors[tag]};">
                    <span><label for={tag}>{tag}</label></span>
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
