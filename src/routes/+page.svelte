<script lang="ts">
    import { voices } from '$lib/voices';
    
    let text = '';
    let isLoading = false;
    let audioUrl: string | null = null;
    let selectedVoice = voices[0].id;

    async function handleSubmit() {
        isLoading = true;
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceId: selectedVoice })
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

<main class="container mx-auto p-4 bg-gray-900">
    <h1 class="text-2xl font-bold mb-4 text-center">LibreSpeak</h1>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4 flex flex-col gap-2">
        <div>
            <label for="voice" class="block text-sm font-medium mb-2">Select Voice</label>
            <select
                id="voice"
                bind:value={selectedVoice}
                class="w-full p-2 border rounded bg-gray-800 text-white"
            >
                {#each voices as voice}
                    <option value={voice.id}>
                        {voice.name}
                    </option>
                {/each}
            </select>
            <p class="text-sm text-gray-400 mt-1">
                {voices.find(v => v.id === selectedVoice)?.description}
            </p>
        </div>

        <div>
            <textarea
                bind:value={text}
                placeholder="Enter text to convert to speech..."
                class="w-full p-2 border rounded bg-gray-800 text-white"
                rows="4"
            />
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
            <audio controls src={audioUrl} class="w-full">
                Your browser does not support the audio element.
            </audio>
        </div>
    {/if}
</main>
