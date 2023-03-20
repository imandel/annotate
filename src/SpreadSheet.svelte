<script>
  import { tags } from "./stores";
  import { label_colors } from "./stores";
  // import { onMount } from "svelte";

  // id, label, color, start, end, note, createTime
  let tag_info = [];
  let cols = ["label", "startTime", "endTime", "note"];
  let all_cols = ["label", "start", "end", "note", "createTime"];
  let selected_label, startTime, endTime, newline, createTime;
  let ifAutoSave = true;
  // labels are dynamaically generated from the $tags
  $: labels = Object.keys($tags);
  // $: console.log("labels changed", labels);
  // TODO use different methods to sort the annotations
  let sortMethod = "createTime";
  let inverse = false;

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
            // update label_colors
            const new_label_colors = {};
            for (let tag of tag_info) {
              new_label_colors[tag.label] = tag.color;
            }
            $label_colors = new_label_colors;
            update_to_tags();
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
    if (!all_cols.includes(sortMethod)){
      sortMethod = "createTime";
    }
    // sort by createTime default
    if (sortMethod === "createTime") {
      if (inverse) {
        new_tag_info.sort((a, b) => b[sortMethod] - a[sortMethod]);
      }
      else{
        new_tag_info.sort((a, b) => a[sortMethod] - b[sortMethod]);
      }
      // new_tag_info.sort((a, b) => b[sortMethod] - a[sortMethod]);
    }
    else{
      if (inverse) {
        new_tag_info.sort((a, b) => a[sortMethod] - b[sortMethod]);
      }
      else{
        new_tag_info.sort((a, b) => b[sortMethod] - a[sortMethod]);
      }
      // new_tag_info.sort((a, b) => a[sortMethod] - b[sortMethod]);
    }
    tag_info = new_tag_info;
  }

  // Update the $tags with the new tag_info
  function update_to_tags() {
    // delete all the annotations in the $tags
    // delete all labels in the $tags
    $tags = {};
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

  // if sortMethod is changed, update the tag_info
  $: if (sortMethod || inverse) {
    update_from_tags();
  }

  // auto save the tag_info to localStorage
  function autoSave() {
    if(!ifAutoSave) {
      return;
    }
    localStorage.setItem('tag_info', JSON.stringify(tag_info));
    console.log("auto save tag_info to localStorage")
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
  // TODO: autosave
  // $: tag_info, autoSave();

  // Save tag_info to localStorage
  // $: tag_info, localStorage.setItem('tag_info', JSON.stringify(tag_info));
  // $: console.log(tag_info);
</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css" />

<div class="spreadsheet">
  <table>
    <tr>
      {#each cols as col}
        <th>{col}</th>
      {/each}
      <th><button on:click={download}><i class="fas fa-download"></i></button></th>
      <th><button on:click={upload}><i class="fas fa-upload"></i></button></th>
      <th><button on:click={()=>{inverse=!inverse}}><i class="fas fa-sort-amount-down"></i></button></th>
      <th>
        <select bind:value={sortMethod} style="">
          {#each all_cols as col}
            <option value={col}>{col}</option> 
          {/each}
        </select>
      </th>
    </tr>
    <tr>
      <td>
        <select bind:value={selected_label} style="background-color:{$label_colors[selected_label]};">
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
        <button on:click={addLabel}><i class="fas fa-plus"></i></button>
      </td>
    </tr>

    {#if tag_info}
    
    <!--id, label, color, start, end, note, createTime-->
      {#each Object.entries(tag_info) as [i, _] }
          <tr>
            <td>
              <select
                value={tag_info[i].label}
                style="background-color:{$label_colors[tag_info[i].label]};"
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
                value={tag_info[i]["start"]} on:input={(e) => handleStartTimeInput(e, i)} />
            </td>
            <td>
              <input
                type="number"
                value={tag_info[i]["end"]} on:input={(e) => handleEndTimeInput(e, i)} />
            </td>
            <td>
              <input
                type="text"
                value={tag_info[i]["note"]} on:input={(e) => handleNoteInput(e, i)} />
            </td>
            <td>
              <button
                on:click={() => {
                  tag_info.splice(parseInt(i), 1);
                  tag_info = tag_info;
                }}><i class="fas fa-trash"></i></button
              >
            </td>
          </tr>
        {/each}
    {/if}
  </table>
</div>

<style>
  input[type=number] {
    width: 120px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  input[type=text] {
    width: 600px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  button {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
  select {
    width: 100px;
    height: 30px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 14px;
  }

  .spreadsheet {
    width: 100%;
    height: 200px;
    overflow: scroll;
    border: 1px solid #ccc;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
  }

</style>
