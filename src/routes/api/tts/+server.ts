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
        const audioBuffers: Buffer[] = [];
        const encoder = new TextEncoder();

        // Create a transform stream to handle both progress events and audio data
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        // Process chunks and send progress updates
        (async () => {
            try {
                // Send initial progress
                await writer.write(
                    encoder.encode(`data: ${JSON.stringify({
                        type: 'progress',
                        current: 0,
                        total: textChunks.length
                    })}\n\n`)
                );

                for (let i = 0; i < textChunks.length; i++) {
                    const buffer = await streamToBuffer(
                        await client.textToSpeech.convertAsStream(
                            voiceId,
                            {
                                output_format: "mp3_44100_128",
                                text: textChunks[i],
                                previous_text: i > 0 ? getLastNWords(textChunks[i-1], 10) : '',
                                next_text: i < textChunks.length - 1 ? getFirstNWords(textChunks[i+1], 10) : '',
                                model_id: "eleven_multilingual_v2",
                            }
                        )
                    );
                    
                    audioBuffers.push(buffer);

                    // Send progress update
                    await writer.write(
                        encoder.encode(`data: ${JSON.stringify({
                            type: 'progress',
                            current: i + 1,
                            total: textChunks.length
                        })}\n\n`)
                    );
                }

                // Send the final audio data
                const finalBuffer = Buffer.concat(audioBuffers);
                await writer.write(
                    encoder.encode(`data: ${JSON.stringify({
                        type: 'audio',
                        data: Array.from(finalBuffer)
                    })}\n\n`)
                );
            } finally {
                await writer.close();
            }
        })();

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to generate speech', { status: 500 });
    }
};