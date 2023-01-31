<script>
  import { tags } from "./stores";

  // label, id -> annotation
  let tag_info = {};
  let cols = ["label", "start", "end", "notes"];

  function update_from_tags() {
    const new_tag_info = {};
    for (let [label, tag] of Object.entries($tags)) {
        new_tag_info[label] = {};
        const color = $tags[label].color;
        for (let [id, annotation] of tag["annotations"]) {
            new_tag_info[label][id] = [color, annotation["start"], annotation["end"], ""];
        }
    }
    tag_info = new_tag_info;
  }


  function update_to_tags() {
    for(let [label, i] of Object.entries(tag_info)) {
        for (let [id, _] of Object.entries(tag_info[label])) {
            $tags[label].annotations.set(id, {
                start: tag_info[label][id][1],
                end: tag_info[label][id][2],
                line: tag_info[label][id][3],
            });
            // TODO: line is not filled here.
        }
    }
    $tags = $tags;
    // console.log($tags);
  }

  $: if($tags){
    update_from_tags();
  }
  $: if(tag_info){
    update_to_tags();
  }
</script>

<table>
  <tr>
    {#each cols as col}
      <th>{col}</th>
    {/each}
  </tr>
  {#if tag_info}
    {#each Object.entries(tag_info) as [label, i]}
      {#each Object.entries(tag_info[label]) as [id, _]}
        <tr>
          <td>
            <input
              type="text"
              style="background-color:{tag_info[label][
                id
              ][0]}; width:70px; border:0px; pointer-events: none;"
              value={label}
              readonly
            />
          </td>
          <td>
            <input
              type="number"
              style="width:100px"
              bind:value={tag_info[label][id][1]}
            />
          </td>
          <td>
            <input
              type="number"
              style="width:100px"
              bind:value={tag_info[label][id][2]}
            />
          </td>
          <td>
            <input
              type="text"
              style="width:500px"
              bind:value={tag_info[label][id][3]}
            />
          </td>
        </tr>
      {/each}
    {/each}
  {/if}
</table>

<style>
</style>
