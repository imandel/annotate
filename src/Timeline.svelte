<script>
	import Dragbar from "./Dragbar.svelte";
	
</script>

<div class="container">
    <h3>Timeline</h3>
	<div class="timeline">
		<Dragbar x={40} width={100}/>
		<Dragbar x={60} width={400}/>
        <Dragbar x={360} width={600}/>
        <Dragbar x={100} width={500}/>
        <Dragbar x={20} width={200}/>
	</div>
</div>
	
<style>
	.timeline {
		display: flex;
		flex-direction: column;
	}
	.timeline :global(svg) {
		border-bottom: solid 1px #ccc;
	}
	.timeline :global(:first-child) {
		border-top: solid 1px #ccc;
	}
</style>