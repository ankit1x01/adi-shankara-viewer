import { analyzeStanza } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { verse, promptType = 'full' } = await request.json();

        if (!verse || typeof verse !== 'string') {
            return NextResponse.json(
                { error: 'Invalid verse provided' },
                { status: 400 }
            );
        }

        const result = await analyzeStanza(verse, promptType);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ analysis: result.analysis });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze verse' },
            { status: 500 }
        );
    }
}
