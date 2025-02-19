<svelte:head>
	<title>LibreSpeak</title>
</svelte:head>

<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}
