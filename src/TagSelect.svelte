<script lang="ts">
    import { slide } from "svelte/transition";
    import { tags, label_colors} from "./stores";
    import LabelInput from "./LabelInput.svelte";
    export let callback = (_label:string, _color:string) => {}
    let addTag = false;

    // labels are not stored in $tags, but in $label_colors

    // TODO clearHighlight
    const selected = (label:string, color: string) => {
        callback(label,color)
    }

</script>

{#each Object.keys($label_colors) as label}
    <span
        class="liner-circle"
        style="background-color:{$label_colors[label]}"
        on:mousedown={()=>selected(label, $label_colors[label])}
    />
{/each}
{#if addTag}
    <span transition:slide>
        <LabelInput>
            <button
                class="new-tag"
                on:click={() => (addTag = !addTag)}
                slot="add">+</button
            >
            <button
                class="new-tag"
                on:click={() => (addTag = !addTag)}
                slot="cancel">x</button
            >
        </LabelInput>
    </span>
{:else}
    <button class="new-tag" on:click={() => (addTag = !addTag)}>+</button>
{/if}

<style>
    .liner-circle {
        height: 18px;
        width: 18px;
        margin: 0 5px;
        border-radius: 50%;
        display: inline-block;
        cursor: pointer;
    }
    .new-tag {
		margin: 0px 0px 0px  5px;
		border-radius: 58%;
		line-height: 0.75em;
        height: 22px;
        width: 22px;
	}
</style>
