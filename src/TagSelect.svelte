<script lang="ts">
    import { slide } from "svelte/transition";
    import { tags } from "./stores";
    import LabelInput from "./LabelInput.svelte";
    export let callback = (_label:string, _color:string) => {}
    let addTag = false;
    
    // TODO clearHighlight
    const selected = (label:string, color: string) => {
        callback(label,color)
    }

</script>

{#each Object.values($tags) as tag}
    <span
        class="liner-circle"
        style="background-color:{tag.color}"
        on:mousedown={()=>selected(tag.label, tag.color)}
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
    .circle {
        position: absolute;
        /* top: 50%; */
        /* left: 50%; */
        /* transform: translate(-50%, -50%); */
        width: 18px;
        height: 18px;
        background-color: whitesmoke;
        border-radius: 100%;
    }
    .line {
        position: absolute;
        transform: rotate(-45deg) translate(-7px, 4px);
        width: 22px;
        height: 2.5px;
        background-color: grey;
        z-index: 100;
    }
    .liner-circle {
        height: 18px;
        width: 18px;
        margin: 0 5px;
        border-radius: 50%;
        display: inline-block;
        cursor: pointer;
    }
    .container {
        display: relative;
        width: 18px;
        height: 18px;
        margin: 0 5px;
    }
    .new-tag {
		margin: 0px 0px 0px  5px;
		border-radius: 58%;
		line-height: 0.75em;
        height: 22px;
        width: 22px;
	}
</style>
