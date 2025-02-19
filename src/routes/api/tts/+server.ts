import type { RequestHandler } from './$types';
import { ElevenLabsClient } from 'elevenlabs';
import { env } from '$env/dynamic/private';
import { splitTextIntoChunks } from '$lib/server/textUtils';
import { type Readable } from 'node:stream';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

function getLastNWords(text: string, n: number): string {
    return text.split(/\s+/).slice(-n).join(' ');
}

function getFirstNWords(text: string, n: number): string {
    return text.split(/\s+/).slice(0, n).join(' ');
}

export const POST: RequestHandler = async ({ request }) => {
    const { text, voiceId } = await request.json();
    
    if (!text) {
        return new Response('Text is required', { status: 400 });
    }

    try {
        const client = new ElevenLabsClient({
            apiKey: env.ELEVENLABS_API_KEY
        });

        const textChunks = splitTextIntoChunks(text);
        console.log(`Processing ${textChunks.length} chunks`);

        const audioBuffers: Buffer[] = [];

        for (let i = 0; i < textChunks.length; i++) {
            console.log(`Converting chunk ${i + 1}/${textChunks.length}`);
            
            const previousText = i > 0 
                ? getLastNWords(textChunks.slice(0, i).join(' '), 10)
                : '';
            
            const nextText = i < textChunks.length - 1 
                ? getFirstNWords(textChunks.slice(i + 1).join(' '), 10)
                : '';

            const audioStream = await client.textToSpeech.convertAsStream(
                voiceId,
                {
                    output_format: "mp3_44100_128",
                    text: textChunks[i],
                    previous_text: previousText,
                    next_text: nextText,
                    model_id: "eleven_multilingual_v2",
                }
            );
            
            const buffer = await streamToBuffer(audioStream);
            console.log(`Chunk ${i + 1} size: ${buffer.length} bytes`);
            console.log(`Context - Previous: "${previousText}", Next: "${nextText}"`);
            audioBuffers.push(buffer);
        }

        const finalBuffer = Buffer.concat(audioBuffers);
        console.log(`Final audio size: ${finalBuffer.length} bytes`);

        return new Response(finalBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to generate speech', { status: 500 });
    }
};