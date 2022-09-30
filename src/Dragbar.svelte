<script>
	// This is a dragbar for one rectangle
    // Arguments:
    // start: starting point
    // width: time length of the bar
    // height: change height while scrolling 
	export let grabberWidth = 10
	export let start = 20
	export let width = 60
    export let height = 40
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
			const delta = start-event.pageX
			start = initial.x - delta
			width = initial.width + delta
			return
		}
		
		if (expanding == 'right') {
			const delta = event.pageX-start
			width = initial.width + delta
			return
		}
	}

    function drag(event) {
		// console.log(node)
		let moving = false;
		// console.log(node)
		event.addEventListener('mousedown', () => {
			moving = true;
		});
		window.addEventListener('mousemove', (e) => {
			if (moving) {
				// console.log(e)
				start += e.movementX;
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
		<rect x={start} y=2 {width} height={height-4} class="step" use:drag />
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