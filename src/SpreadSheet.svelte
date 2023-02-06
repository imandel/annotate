<script>
  import { tags } from "./stores";

  // label, id -> annotation
  let tag_info = {};
  let cols = ["label", "start", "end", "notes"];
  import { createPopper, end } from "@popperjs/core";
  let label, startTime, endTime;
  let labels = [];
  let button;
  let tooltip;

  function addLabel() {
    // update tag_info with the new label information
    if (!tag_info[label]) {
      tag_info[label] = {};
    }
    const id = Date.now();
    if(label && startTime && endTime) {
        tag_info[label][id] = [$tags[label].color, startTime, endTime, ""];
    }
    startTime = null;
    endTime = null;
    tooltip.style.display = "none";
  }

  function createPop(){
    if(tooltip.style.display === "none"){
        createPopper(button, tooltip, {
            placement: "right-start",
        });
        tooltip.style.display = "";
    }
    else{
        tooltip.style.display = "none";
    }
  }

  function update_from_tags() {
    const new_tag_info = {};
    for (let [label, tag] of Object.entries($tags)) {
        new_tag_info[label] = {};
        labels.push(label);
        const color = $tags[label].color;
        for (let [id, annotation] of tag["annotations"]) {
            new_tag_info[label][id] = [color, annotation["start"], annotation["end"], annotation["line"]];
        }
    }
    tag_info = new_tag_info;
  }


  function update_to_tags() {
    for(let [label, i] of Object.entries(tag_info)) {
        $tags[label].annotations = new Map();
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

  $: $tags, update_from_tags();
  $: tag_info, update_to_tags();

</script>

<div style="height: 200px; overflow: scroll;">
    <table>
        <tr>
          {#each cols as col}
            <th>{col}</th>
          {/each}
          <th>
            <button id="button" bind:this={button} on:click={createPop}>+</button>
            <div id="tooltip" bind:this={tooltip} role="tooltip" style="display: none;">
            <select bind:value={label}>
                {#each labels as label}
                    <option value={label}>{label}</option>
                {/each}
            </select>
            <input type="text" bind:value={startTime} placeholder="Start Time" />
            <input type="text" bind:value={endTime} placeholder="End Time" />
            <button on:click={addLabel}>Add</button>
            </div>
            </th>
        </tr>
        {#if tag_info}
          {#each Object.entries(tag_info) as [label, i]}
            {#each Object.entries(tag_info[label]) as [id, _]}
              <tr>
                <td>
                    <select bind:value={label} style="background-color:{tag_info[label][id][0]}; width:70px; border:0px;">
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
                <td>
                    <button on:click={()=>{delete tag_info[label][id]; tag_info = tag_info;}}>-</button>
                </td>
              </tr>
            {/each}
          {/each}
        {/if}
      </table>
</div>



<style>

#tooltip {
		background-color: rgb(216, 216, 216);
		color: white;
		padding: 5px 10px;
		border-radius: 5px;
		font-size: 13px;
		display: flex;
		align-items: center;
	}

</style>
