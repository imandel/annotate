<script>
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import Timeline from "./Timeline.svelte";
  import SpreadSheet from "./SpreadSheet.svelte"; 
//   import Spreedsheet from "./Spreedsheet.svelte";

  const id = () => "_" + Math.random().toString(36).substr(2, 9);

  let components = [Timeline, SpreadSheet];

  let items = [
  {
    6: gridHelp.item({
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    }),
    id: id(),
    component: components[0],
  },

  {
    6: gridHelp.item({
      x: 2,
      y: 0,
      w: 2,
      h: 2,
    }),
    id: id(),
    component: components[1],
  },
];

const cols = [
  [ 1100, 6 ],
];
</script>

<Grid bind:items={items} rowHeight={100} let:item let:dataItem {cols}>
    <div>
        <svelte:component this={dataItem.component}>
        </svelte:component>
    </div>
</Grid>

  <style>
    :global(.svlt-grid-shadow) {
      /* Back shadow */
      background: rgb(237, 237, 237);
    }
    :global(.svlt-grid-container) {
      /* Container color */
      background: #eee;
    }
    :global(.svlt-grid-resizer::after) {
      /* Resizer color */
      border-color: rgb(181, 181, 181) !important;
    }
  </style>
