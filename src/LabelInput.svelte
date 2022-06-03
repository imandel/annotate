<script lang="ts">
    import { tags } from "./stores";
    import { randomColor } from "./util";
    let newLabel: string;

    // TODO replace randomColor() with nice colorpallete chromajs
    const addLabel = () => {
        if (newLabel) {
            $tags = [...$tags, { label: newLabel, color: randomColor() }];
            newLabel = "";
        }
    };
</script>

<div style="display:inline-block">
    <input
        type="text"
        placeholder="add label"
        bind:value={newLabel}
        style="width:6em"
        on:keypress={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addLabel();
            }
        }}
    />
    <span on:click={addLabel}><slot name="add"><button>+</button></slot></span>
    <span on:click={addLabel}><slot name="cancel"></slot></span>

    <!-- <slot name="remove"></slot>
    <button on:click={addLabel}>+</button> -->
</div>
<style>
    input[type=text]{
        margin:0;
    }
</style>