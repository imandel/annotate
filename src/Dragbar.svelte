<script>
	import { tags, duration, zoom } from "./stores";
	// This is a dragbar for one rectangle
	export let label = "";
	export let id = "";
	export let index = 0;
	let grabberWidth = 4;
	$: minimum_width = 10 / $zoom;
	$: length = Object.keys($tags).length;

	// READ: everything can be accessed by label and id
	// start, end change with store.ts
	let start = null,
		end = null,
		line = null,
		color = "#8884";
	$: color = $tags[label].color;
	$: annotation = $tags[label].annotations.get(id);
	$: start = annotation["start"];
	$: end = annotation["end"];
	$: line = annotation["line"];
	$: note = annotation["note"];
	$: createTime = annotation["createTime"];
	// $:console.log(start)

	// READ
	// tmp_start, tmp_end dynamically assigned when start, end change
	let tmp_start = null,
		tmp_end = null;
	$: start, end, assign_annotation();
	function assign_annotation() {
		tmp_start = start;
		tmp_end = end;
	}
	$: width = tmp_end - tmp_start;

	// WRITE
	// write tmp to store, then will READ again
	// only called when changes stop
	function update_annotation() {
		$tags[label].annotations.set(id, {
			start: tmp_start,
			end: tmp_end,
			line: line,
			note: note,
			createTime: createTime,
		});
		$tags = $tags;
	}

	// EXPAND
	// for expanding blocks
	let expanding = null;
	function expand(event) {
		window.addEventListener("mousemove", (e) => {
			if (expanding == "left") {
				const nextStart = tmp_start + e.movementX / ($zoom * 2);
				if (tmp_end - nextStart >= minimum_width && nextStart >= 0) {
					tmp_start = nextStart;
				}
			} else if (expanding == "right") {
				const nextEnd = tmp_end + e.movementX / ($zoom * 2);
				if (
					nextEnd - tmp_start >= minimum_width &&
					nextEnd <= $duration
				) {
					tmp_end = nextEnd;
				}
			}
		});
		window.addEventListener("mouseup", () => {
			if (expanding) {
				expanding = null;
				update_annotation();
			}
		});
	}

	// DRAG
	function drag(event) {
		let moving = false;
		event.addEventListener("mousedown", () => {
			moving = true;
		});
		window.addEventListener("mousemove", (e) => {
			if (moving) {
				const nextStart = tmp_start + e.movementX / $zoom;
				const nextEnd = tmp_end + e.movementX / $zoom;
				if (nextStart >= 0 && nextEnd <= $duration) {
					tmp_start = nextStart;
					tmp_end = nextEnd;
				}
			}
		});

		window.addEventListener("mouseup", () => {
			if (moving) {
				// console.log("stop drag")
				moving = false;
				update_annotation();
			}
		});
	}
</script>

<g>
	<svg
		viewBox="0 {(index) * 40} {$duration * $zoom} 40"
		preserveAspectRatio="xMinYMax meet"
	>
		<rect
			x={tmp_start * $zoom}
			y="2"
			fill={color}
			width={width * $zoom}
			class="step"
			use:drag
		/>
		<rect
			x={tmp_start * $zoom}
			y="2"
			width={grabberWidth}
			fill={color}
			class="grip"
			on:mousedown={() => (expanding = "left")}
			use:expand
			class:active={expanding == "left"}
		/>
		<rect
			x={tmp_end * $zoom - grabberWidth}
			y="2"
			width={grabberWidth}
			fill={color}
			class="grip"
			on:mousedown={() => (expanding = "right")}
			use:expand
			class:active={expanding == "right"}
		/>
	</svg>
</g>

<style>
	.step {
		stroke: #222a;
		rx: 2;
		cursor: pointer;
		transition: fill 0.2s linear;
		height: 90%;
	}
	.step:hover {
		fill: rgba(239, 239, 239, 0.085);
	}
	.grip {
		cursor: col-resize;
		fill: #fff0;
		transition: fill 0.2s linear;
		height: 90%;
	}
	.grip.active,
	.grip:hover {
		fill: #222a;
	}
</style>
