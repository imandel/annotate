<script>
  import WaveSurfer from "wavesurfer.js";
  import { duration, currentTime, tags } from "./stores";
  import { onMount } from "svelte";
  import { videoFile } from "./stores";
  import TimelinePlugin from "wavesurfer.js/src/plugin/timeline/index.js";
  import RegionsPlugin from "wavesurfer.js/src/plugin/regions/index.js";

  let wave = undefined;
  let wavesurfer = undefined;
  let timeline = undefined;

  let regions_from_tags = [];
  function change()
  {
    regions_from_tags = [];
    for (const [label, annot] of Object.entries($tags)) {
        console.log(annot)
        Object.keys(annot["annotations"]).forEach(function(key, index) {
            console.log(key)
            console.log(annot["annotations"][key])
            const region = {
                start: annot["annotations"][key]["start"],
                end: annot["annotations"][key]["end"],
                loop: false,
                color: annot["color"],
            };
            console.log(region)
            regions_from_tags.push(region);
        });
    }
  }
  $: $tags, change()

  onMount(() => {
    wavesurfer = WaveSurfer.create({
      container: wave,
      waveColor: "#A8DBA8",
      progressColor: "#3B8686",
      scrollParent: true,
      plugins: [
        TimelinePlugin.create({
          container: timeline,
        }),
        RegionsPlugin.create({
          regionsMinLength: 2,
          regions: regions_from_tags,
          dragSelection: {
            slop: 5,
          },
        }),
      ],
    });
  });
  $: if (wavesurfer && $videoFile) {
    wavesurfer.load($videoFile);
  }
//   $: if(regions_from_tags) {
//     wavesurfer.clearRegions()
//     let arrayLength = regions_from_tags.length;
//     console.log(regions_from_tags)
//     for(let i = 0; i < arrayLength; i++){
//         wavesurfer.addRegion(regions_from_tags[i])
//     }
//   }
</script>

<h3>Audioline</h3>
<div bind:this={wave} />
<div bind:this={timeline} />
