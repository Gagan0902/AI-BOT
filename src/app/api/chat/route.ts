import { hf, DEFAULT_MODEL, SYSTEM_PROMPT } from '@/lib/huggingface';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // Format messages for Hugging Face
        const formattedMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        // Direct fetch to Hugging Face OpenAI-compatible endpoint
        const hfResponse = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: formattedMessages,
                max_tokens: 1000,
                temperature: 0.7,
                stream: true,
            }),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error('HF API Error Response:', errorText);
            throw new Error(`Hugging Face API error: ${hfResponse.status} ${hfResponse.statusText}. ${errorText}`);
        }

        if (!hfResponse.body) {
            throw new Error('No response body from Hugging Face');
        }

        const reader = hfResponse.body.getReader();
        const decoder = new TextDecoder();
        
        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        // Hugging Face sends data in 'data: ' format
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') continue;
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.choices && parsed.choices[0].delta.content) {
                                        const content = parsed.choices[0].delta.content;
                                        controller.enqueue(new TextEncoder().encode(content));
                                    }
                                } catch (e) {
                                    // Skip malformed JSON lines
                                }
                            }
                        }
                    }
                    controller.close();
                } catch (err: any) {
                    console.error('Stream processing error:', err);
                    controller.error(err);
                }
            },
        });

        return new Response(customStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error: any) {
        console.error('Hugging Face API Error:', error);

        let errorMessage = error.message || 'An error occurred during chat completion';
        
        // Log more details if available
        if (error.httpResponse) {
            try {
                const errorBody = await error.httpResponse.text();
                console.error('HF Error Body:', errorBody);
                try {
                    const parsed = JSON.parse(errorBody);
                    if (parsed.error) errorMessage = parsed.error;
                } catch (e) {
                    errorMessage = errorBody || errorMessage;
                }
            } catch (e) {
                console.error('Could not read error body');
            }
        }

        // Improve error message for specific Hugging Face issues
        if (errorMessage.includes('Cannot select auto-router') || errorMessage.includes('Unauthorized') || errorMessage.includes('Model not found')) {
            errorMessage = 'Invalid model or Hugging Face API key. Please check your .env.local file. Error: ' + errorMessage;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
