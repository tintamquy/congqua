const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export async function onRequestPost({ request, env }) {
    try {
        if (!env.GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'Gemini API key is not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { prompt } = await request.json();
        if (!prompt || typeof prompt !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Missing prompt payload' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            return new Response(errorText, {
                status: geminiResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await geminiResponse.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Gemini proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Gemini proxy internal error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

