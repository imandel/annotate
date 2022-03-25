<script lang="ts">
    import { play } from "./Video.svelte";
    import { duration, currentTime, tags } from "./stores";
    import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt';
    import { onMount } from 'svelte';

    let start = 18000000;
    
    let ganttDiv;
    $tags = ['cat', 'dog']
    let rows = $tags.map((tag: string, idx) => {
        return {id: idx+1, label: tag, height: 30}
    })
    $: if(gantt) {
        rows = $tags.map((tag: string, idx) => {
        return {id: idx+1, label: tag, height: 30}
    })
    gantt.$set({ rows })
    }

    $: if($duration) gantt.$set({ to: start + $duration*1000 })

    let task = {
        id: 1,
        from:start,
        to: start + (30*60*1000),
        label: 'cat',
        resourceId: 1,
        html: 'test'
    }

    let options = {
        // dateAdapter: new MomentSvelteGanttDateAdapter(moment),
        rows,
        tasks: [task],
        columnOffset: 1,
        magnetOffset: 0.1,
        rowHeight: 30,
        rowPadding: 6,
        headers: [ { unit: 'hour', format: 'hh:mm:ss' }],
        fitWidth: true,
        minWidth: 800,
        from: start,
        to: start+36000,
        tableHeaders: [{ title: 'Label', property: 'label', width: 140, type: 'tree' }],
        tableWidth: 100,
        ganttTableModules: [SvelteGanttTable]
    }



    let gantt
    onMount(() => {
        window.gantt = gantt = new SvelteGantt({ target: ganttDiv, props: options });
    })
   
</script>

<div class="container">
    <div bind:this={ganttDiv} id='ganttDiv' ></div>
</div>


<style>
     #ganttDiv {
        flex-grow: 1;
        overflow: auto;
    }
    .container {
        display: flex;
        overflow: auto;
        flex: 1;
    }

</style>
