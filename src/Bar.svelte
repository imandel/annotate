<script>
	const grabberWidth = 10
    // Arguments:
    // x: starting point
    // width: time length of the bar
    // height: change height while scrolling 
	export let tags
	export let width = 60
	export let x = 20
    export let height = 40
    // for expanding blocks
	let expanding = null, start = null, initial = null
	let x1 = 

	function startExpand(type, event) {
		expanding = type
		start = event.pageX
		initial = { x, width }
	}
	
	function stopExpand() {
		expanding = null
		start = null
		initial = null
	}
	
	function expand(event) {
		if (!expanding) return
		
		if (expanding == 'left') {
			const delta = start-event.pageX
			x = initial.x - delta
			width = initial.width + delta
			return
		}
		
		if (expanding == 'right') {
			const delta = event.pageX-start
			width = initial.width + delta
			return
		}
	}

    function dragMe(node) {
		let moving = false;

		node.addEventListener('mousedown', () => {
			moving = true;
		});
		
		window.addEventListener('mousemove', (e) => {
			if (moving) {
				x += e.movementX;
			}
		});
		
		window.addEventListener('mouseup', () => {
			moving = false;
		});
    }
</script>

<svelte:window on:mouseup={stopExpand} />

<svg {height} >
    <g on:mousemove={expand} class:expanding>
        <rect {x} y=2 {width} height={height-4} class="step" use:dragMe />
        <rect {x} y=2 width={grabberWidth} height={height-4} fill=red class="grip" on:mousedown={startExpand.bind(this, 'left')}  class:active={expanding=='left'}/>
        <rect x={x+width-grabberWidth} y=2 width={grabberWidth} height={height-4} fill=blue class="grip" on:mousedown={startExpand.bind(this, 'right')} class:active={expanding=='right'}/>
    </g>
    
    <g on:mousemove={expand} class:expanding>
        <rect {x1} y=2 {width} height={height-4} class="step" use:dragMe />
        <rect {x} y=2 width={grabberWidth} height={height-4} fill=red class="grip" on:mousedown={startExpand.bind(this, 'left')}  class:active={expanding=='left'}/>
        <rect x={x+width-grabberWidth} y=2 width={grabberWidth} height={height-4} fill=blue class="grip" on:mousedown={startExpand.bind(this, 'right')} class:active={expanding=='right'}/>
    </g>
	<rect x={x+2 *width} y=2 {width} height={height-4} class="step"></rect>
</svg>


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