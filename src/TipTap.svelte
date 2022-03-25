<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { createEditor, EditorContent } from 'svelte-tiptap';

  let editor: Readable<Editor>;

  onMount(() => {
    editor = createEditor({
      content: `Hello world!`,
    });
  });
</script>

<EditorContent editor={$editor} />