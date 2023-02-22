<script>
  import { tags } from "./stores";

  // label, id -> annotation
  let tag_info = {};
  let cols = ["label", "start", "end", "notes"];
  let label, startTime, endTime, newline, createTime;
  // use createTime to sort the annotations
  let labels = [];

  function getSortedTagInfo(obj) {
    const entries = Object.entries(obj);
    const sortedEntries = entries.map(([label, items]) => {
      const itemEntries = Object.entries(items);
      const sortedItemEntries = itemEntries.sort((a, b) => a[1][4] - b[1][4]);
      const sortedItems = Object.fromEntries(sortedItemEntries);
      return [label, sortedItems];
    });
    const sortedObj = Object.fromEntries(sortedEntries);
    return sortedObj;
  }

  $: sortedTagInfo = getSortedTagInfo(tag_info);

  function addLabel() {
    // update tag_info with the new label information
    if (!tag_info[label]) {
      tag_info[label] = {};
    }
    const id = Date.now();
    if (label && startTime && endTime) {
      tag_info[label][id] = [$tags[label].color, startTime, endTime, newline, createTime];
    }
    startTime = null;
    endTime = null;
    newline = null;
    createTime = null;
  }

  function update_from_tags() {
    const new_tag_info = {};
    for (let [label, tag] of Object.entries($tags)) {
      new_tag_info[label] = {};
      labels.push(label);
      const color = $tags[label].color;
      for (let [id, annotation] of tag["annotations"]) {
        new_tag_info[label][id] = [
          color,
          annotation["start"],
          annotation["end"],
          annotation["note"],
          annotation["createTime"],
        ];
      }
    }
    tag_info = new_tag_info;
  }

  function update_to_tags() {
    for (let [label, i] of Object.entries(tag_info)) {
      $tags[label].annotations = new Map();
      for (let [id, _] of Object.entries(tag_info[label])) {
        $tags[label].annotations.set(id, {
          start: tag_info[label][id][1],
          end: tag_info[label][id][2],
          note: tag_info[label][id][3],
        });
      }
    }
    $tags = $tags;
    // console.log($tags);
  }

  $: $tags, update_from_tags();
  $: tag_info, update_to_tags();
</script>

<div style="height: 200px; overflow: scroll;">
  <table>
    <tr>
      {#each cols as col}
        <th>{col}</th>
      {/each}
    </tr>
    <tr>
      <td>
        <select bind:value={label}>
          {#each labels as label}
            <option value={label}>{label}</option>
          {/each}
        </select>
      </td>
      <td>
        <input
          type="number"
          style="width:120px"
          bind:value={startTime}
          placeholder="Start Time"
        />
      </td>
      <td>
        <input
          type="number"
          style="width:120px"
          bind:value={endTime}
          placeholder="End Time"
        />
      </td>
      <td>
        <input
          type="text"
          style="width:600px"
          bind:value={newline}
          placeholder="Notes"
        />
      </td>
      <td>
        <button on:click={addLabel}>Add</button>
      </td>
    </tr>
    {#if tag_info}
      {#each Object.entries(sortedTagInfo) as [label, i]}
        {#each Object.entries(sortedTagInfo[label]) as [id, _]}
          <tr>
            <td>
              <select
                bind:value={label}
                style="background-color:{tag_info[label][
                  id
                ][0]}; width:70px; border:0px;"
              >
                {#each Object.keys(tag_info) as label_choice}
                  <option value={label_choice} selected={true}>
                    {label_choice}
                  </option>
                {/each}
              </select>
            </td>
            <td>
              <input
                type="number"
                style="width:120px"
                bind:value={tag_info[label][id][1]}
              />
            </td>
            <td>
              <input
                type="number"
                style="width:120px"
                bind:value={tag_info[label][id][2]}
              />
            </td>
            <td>
              <input
                type="text"
                style="width:600px"
                bind:value={tag_info[label][id][3]}
              />
            </td>
            <td>
              <button
                on:click={() => {
                  delete tag_info[label][id];
                  tag_info = tag_info;
                }}>-</button
              >
            </td>
          </tr>
        {/each}
      {/each}
    {/if}
  </table>
</div>

<style>
</style>
