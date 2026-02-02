import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnalysisPrompt, type PromptType } from './prompts';

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface AnalysisResult {
    analysis: string;
    error?: string;
}

/**
 * Analyze a Sanskrit verse using Gemini AI with Vedantic perspective
 */
export async function analyzeStanza(
    verse: string,
    promptType: PromptType = 'full'
): Promise<AnalysisResult> {
    try {
        // Use Gemini 1.5 Pro for best quality
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro-latest',
            generationConfig: {
                temperature: 0.7, // Balanced creativity and consistency
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192, // Allow long, detailed responses
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_NONE',
                },
            ],
        });

        const systemPrompt = getAnalysisPrompt(promptType);
        const fullPrompt = `${systemPrompt}\n\n---\n\n**Verse to analyze:**\n\n${verse}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const analysis = response.text();

        return {
            analysis,
        };
    } catch (error) {
        console.error('Error analyzing stanza:', error);
        return {
            analysis: '',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Stream analysis for real-time feedback
 */
export async function* analyzeStanzaStream(
    verse: string,
    promptType: PromptType = 'full'
): AsyncGenerator<string, void, unknown> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro-latest',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        const systemPrompt = getAnalysisPrompt(promptType);
        const fullPrompt = `${systemPrompt}\n\n---\n\n**Verse to analyze:**\n\n${verse}`;

        const result = await model.generateContentStream(fullPrompt);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            yield chunkText;
        }
    } catch (error) {
        console.error('Error in streaming analysis:', error);
        throw error;
    }
}
