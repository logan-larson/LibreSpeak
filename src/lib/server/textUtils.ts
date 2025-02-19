const MAX_CHUNK_SIZE = 1000;

export function splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split text into sentences (looking for '. ' or '\n')
    const sentences = text.split(/(?<=\. |\n)/);

    for (const sentence of sentences) {
        // If adding this sentence would exceed chunk size, save current chunk
        if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        
        // If a single sentence is longer than MAX_CHUNK_SIZE, split it by words
        if (sentence.length > MAX_CHUNK_SIZE) {
            const words = sentence.split(' ');
            let wordChunk = '';
            
            for (const word of words) {
                if (wordChunk.length + word.length + 1 > MAX_CHUNK_SIZE) {
                    chunks.push(wordChunk.trim());
                    wordChunk = '';
                }
                wordChunk += word + ' ';
            }
            
            if (wordChunk.length > 0) {
                currentChunk += wordChunk;
            }
        } else {
            currentChunk += sentence;
        }
    }

    // Add any remaining text
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
} 