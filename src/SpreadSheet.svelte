<script>
  import { tags } from "./stores";
  import { label_colors } from "./stores";
  import { onMount } from "svelte";

  // TODO: resume after refreshing the page
  onMount(() => {
    // console.log("onMount");
    // console.log($tags);
    // console.log($label_colors);
    // Get tag_info from localStorage and parse it to JSON
    console.log("loading tag_info from localStorage...")
    const savedTagInfo = JSON.parse(localStorage.getItem('tag_info'));
    console.log(savedTagInfo)
    if (savedTagInfo) {
      tag_info = savedTagInfo;
    }
  });

  // id, label, color, start, end, note, createTime
  let tag_info = [];
  let cols = ["label", "startTime", "endTime", "note"];
  let selected_label, startTime, endTime, newline, createTime;
  $: labels = Object.keys($tags);
  // TODO:use createTime to sort the annotations
  

  // Download the tag_info as a JSON file
  function download() {;
    const json = JSON.stringify(tag_info);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tags.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Upload a JSON file and update the tag_info
  function upload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result.toString();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            tag_info = data;
          } else {
            throw new Error("Invalid JSON file");
          }
        } catch (e) {
          console.error(e);
          alert("Failed to load file");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  // Update the tag_info with the new label information
  function addLabel() {
    // update tag_info with the new label information
    if (selected_label && startTime && endTime && endTime > startTime) {
      const id = Date.now();
      const color = $label_colors[selected_label];
      tag_info = [
        {
          id,
          label: selected_label,
          color,
          start: startTime,
          end: endTime,
          note: newline,
          createTime: Date.now(),
        },
        ...tag_info,
      ];
    }
    startTime = null;
    endTime = null;
    newline = null;
    createTime = null;
  }

  // Update the tag_info with the new tag information
  function update_from_tags() {
    const new_tag_info = [];
    // id, label, start, end, note, createTime
    for (let [label, tag] of Object.entries($tags)) {
      for (let [id, annotation] of tag["annotations"]) {
        new_tag_info.push({
          id,
          label,
          color: $label_colors[label],
          start: annotation["start"],
          end: annotation["end"],
          note: annotation["note"],
          createTime: annotation["createTime"],
        });
      }
    }
    // sort by createTime
    new_tag_info.sort((a, b) => b.createTime - a.createTime);
    tag_info = new_tag_info;
    console.log(tag_info)
  }

  // Update the $tags with the new tag_info
  function update_to_tags() {
    // id, label, start, end, note, createTime
    for(let [label, tag] of Object.entries($tags)) {
      $tags[label].annotations = new Map();
    }
    if(!tag_info) {
      $tags = $tags;
      return;
    }
    for (let item of tag_info) {
      // console.log(item);
      if (!$tags[item.label]) {
        $tags[item.label] = {
          label: item.label,
          color: $label_colors[item.label],
          annotations: new Map(),
        };
      }
      // console.log("item", item);
      $tags[item.label].annotations.set(item.id, {
        start: item.start,
        end: item.end,
        note: item.note,
        createTime: item.createTime,
      });
    }
    $tags = $tags;
  }

  // change the tag_info when the user changes the input
  function handleStartTimeInput(event, i) {
    tag_info[i]["start"] = parseInt(event.target.value);
    tag_info = tag_info;
  }

  function handleEndTimeInput(event, i) {
    tag_info[i]["end"] = parseInt(event.target.value);
    tag_info = tag_info;
  }

  function handleNoteInput(event, i) {
    tag_info[i]["note"] = event.target.value.toString();
    tag_info = tag_info;
  }

  $: $tags, update_from_tags();
  $: tag_info, update_to_tags();

  // Save tag_info to localStorage
  // $: tag_info, localStorage.setItem('tag_info', JSON.stringify(tag_info));
  // $: console.log(tag_info);
</script>

<div style="height: 200px; width: 80%;
 overflow: scroll; border: 1px solid gray; background-color: white; padding: 10px;
  border-radius: 5px;
">
  <table>
    <tr>
      {#each cols as col}
        <th>{col}</th>
      {/each}
      <th><button on:click={download}>Download</button></th>
      <th><button on:click={upload}>Upload</button></th>
    </tr>
    <tr>
      <td>
        <select bind:value={selected_label} style="background-color:{$label_colors[selected_label]}; width:70px; border:0px;">
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
    
    <!--id, label, color, start, end, note, createTime-->
      {#each Object.entries(tag_info) as [i, _] }
          <tr>
            <td>
              <select
                value={tag_info[i].label}
                style="background-color:{$label_colors[tag_info[i].label]}; width:70px; border:0px;"
                on:change={(event) => {
                  tag_info[i].label = event.target.value.toString();
                  tag_info = tag_info;
                }}>
              >
                {#each labels as label_choice}
                  <option value={label_choice}>
                    {label_choice}
                  </option>
                {/each}
              </select>
            </td>
            <td>
              <input
                type="number"
                style="width:120px"
                value={tag_info[i]["start"]} on:input={(e) => handleStartTimeInput(e, i)} />
            </td>
            <td>
              <input
                type="number"
                style="width:120px"
                value={tag_info[i]["end"]} on:input={(e) => handleEndTimeInput(e, i)} />
            </td>
            <td>
              <input
                type="text"
                style="width:600px"
                value={tag_info[i]["note"]} on:input={(e) => handleNoteInput(e, i)} />
            </td>
            <td>
              <button
                on:click={() => {
                  tag_info.splice(parseInt(i), 1);
                  tag_info = tag_info;
                }}>-</button
              >
            </td>
          </tr>
        {/each}
    {/if}
  </table>
</div>

<style>
</style>
