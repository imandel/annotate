<script>
	import {tags} from "./stores"
	// This is a dragbar for one rectangle
	export let label = ""
	export let key = ""
	export let zoom = 10
	export let grabberWidth = 10
    export let height = 40

	// everything can be accessed by label and key
	$: annotation = $tags[label]["annotations"].get(key)
	$: start = annotation["start"] * zoom
	$: end = annotation["end"] * zoom
	$: width = (annotation["end"] - annotation["start"] ) * zoom
    // for expanding blocks
	let expanding = null, startPoint = null, initial = null
	function startExpand(type, event ) {
		expanding = type
		startPoint = event.pageX
		initial = { start, width }
	}
	
	function stopExpand() {
		expanding = null
		startPoint = null
		initial = null
	}
	
	function expand(event) {
		if (!expanding) return
		
		if (expanding == 'left') {
			const delta = startPoint - event.pageX
			start = initial.start - delta
			width = initial.width + delta
			return
		}
		
		if (expanding == 'right') {
			const delta = event.pageX - startPoint
			width = initial.width + delta
			return
		}
	}

    function drag(event) {
		let moving = false;
		event.addEventListener('mousedown', () => {
			moving = true;
		});
		window.addEventListener('mousemove', (e) => {
			if (moving) {
				// console.log(e)
				start += e.movementX;
				end += e.movementX;
				annotation["start"] = start / zoom;
				annotation["end"] = end / zoom;
			}
		});
		
		window.addEventListener('mouseup', () => {
			moving = false;
		});
    }
</script>

<svelte:window on:mouseup={stopExpand} />

<g>
	<svg {height} on:mousemove={expand} class:expanding>
		<rect x={start} y=2 width={width} height={height-4} class="step" use:drag />
		<rect x={start} y=2 width={grabberWidth} height={height-4} fill=red class="grip" on:mousedown={startExpand.bind(this, 'left')}  class:active={expanding=='left'}/>
		<rect x={start+width-grabberWidth} y=2 width={grabberWidth} height={height-4} fill=blue class="grip" on:mousedown={startExpand.bind(this, 'right')} class:active={expanding=='right'}/>
	</svg>
</g>



<style>
	.step {
		fill: #8884;
		stroke: #222a;
		rx: 2;
        cursor: pointer;
        transition: fill .2s linear;
	}
    .step:hover {
        fill: rgba(239, 239, 239, 0.085);
    }
	.expanding .step{
		stroke: #222a;
	}
	.grip {
		cursor: col-resize;
		fill: #fff0;
        transition: fill .2s linear;
	}
	.grip.active, .grip:hover {
		fill: #222a;
	}
</style>