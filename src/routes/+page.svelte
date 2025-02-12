<script lang="ts">
    let text = '';
    let isLoading = false;
    let audioUrl: string | null = null;

    async function handleSubmit() {
        isLoading = true;
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok) throw new Error('Failed to generate speech');
            
            const blob = await response.blob();
            audioUrl = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate speech');
        } finally {
            isLoading = false;
        }
    }
</script>

<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">LibreSpeak</h1>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4 flex flex-col gap-2">
        <div>
            <textarea
                bind:value={text}
                placeholder="Enter text to convert to speech..."
                class="w-full p-2 border rounded"
                rows="4"
            >
            </textarea>
        </div>
        
        <button
            type="submit"
            disabled={isLoading}
            class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
            {isLoading ? 'Generating...' : 'Generate Speech'}
        </button>
    </form>
    
    {#if audioUrl}
        <div class="mt-4">
            <audio controls src={audioUrl}>
                Your browser does not support the audio element.
            </audio>
        </div>
    {/if}
</main>
