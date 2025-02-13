import type { RequestHandler } from './$types';
import { ElevenLabsClient } from 'elevenlabs';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
    const { text, voiceId } = await request.json();
    
    if (!text) {
        return new Response('Text is required', { status: 400 });
    }

    try {
        const client = new ElevenLabsClient({
            apiKey: env.ELEVENLABS_API_KEY
        });

        const audioStream = await client.textToSpeech.convertAsStream(
            voiceId,
            {
                output_format: "mp3_44100_128",
                text,
                model_id: "eleven_multilingual_v2",
            }
        );
        
        return new Response(audioStream, {
            headers: {
                'Content-Type': 'audio/mpeg'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to generate speech', { status: 500 });
    }
}; 
