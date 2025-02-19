<script lang="ts">
    import { voices } from '$lib/voices';
    
    let text = '';
    let isLoading = false;
    let audioUrl: string | null = null;
    let selectedVoice = voices[0].id;
    let progress = { current: 0, total: 0 };

    async function handleSubmit() {
        isLoading = true;
        progress = { current: 0, total: 0 };
        audioUrl = null;
        
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceId: selectedVoice })
            });
            
            if (!response.ok) throw new Error('Failed to generate speech');
            
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Failed to read response');

            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split('\n\n');
                
                // Keep the last potentially incomplete event in the buffer
                buffer = events.pop() || '';

                for (const event of events) {
                    if (!event.trim() || !event.startsWith('data: ')) continue;
                    
                    try {
                        const data = JSON.parse(event.replace('data: ', ''));
                        
                        if (data.type === 'progress') {
                            progress = {
                                current: data.current,
                                total: data.total
                            };
                        } else if (data.type === 'audio') {
                            const audioData = new Uint8Array(data.data);
                            const blob = new Blob([audioData], { type: 'audio/mpeg' });
                            audioUrl = URL.createObjectURL(blob);
                        }
                    } catch (e) {
                        console.error('Failed to parse event:', e);
                        console.log('Problematic event:', event);
                    }
                }
            }

            // Handle any remaining complete events in the buffer
            if (buffer.trim() && buffer.startsWith('data: ')) {
                try {
                    const data = JSON.parse(buffer.replace('data: ', ''));
                    if (data.type === 'audio') {
                        const audioData = new Uint8Array(data.data);
                        const blob = new Blob([audioData], { type: 'audio/mpeg' });
                        audioUrl = URL.createObjectURL(blob);
                    }
                } catch (e) {
                    console.error('Failed to parse final event:', e);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate speech');
        } finally {
            isLoading = false;
        }
    }

    function downloadAudio() {
        if (!audioUrl) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'generated-speech.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                class="w-full h-32 p-2 border rounded bg-gray-800 text-white"
                disabled={isLoading}
            ></textarea>
        </div>
        
        <button
            type="submit"
            class="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || !text.trim()}
        >
            {#if isLoading}
                {#if progress.total > 0}
                    Converting... ({progress.current}/{progress.total} chunks)
                {:else}
                    Converting...
                {/if}
            {:else}
                Convert to Speech
            {/if}
        </button>
    </form>

    {#if progress.total > 0}
        <div class="mt-4">
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style="width: {(progress.current / progress.total) * 100}%"
                ></div>
            </div>
            <p class="text-sm text-gray-400 mt-1 text-center">
                Processing chunk {progress.current} of {progress.total}
            </p>
        </div>
    {/if}
    
    {#if audioUrl}
        <div class="mt-8 space-y-2">
            <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Generated Audio</h2>
                <button
                    on:click={downloadAudio}
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Download MP3
                </button>
            </div>
            <audio controls src={audioUrl} class="w-full mt-4">
                Your browser does not support the audio element.
            </audio>
        </div>
    {/if}
</main>
