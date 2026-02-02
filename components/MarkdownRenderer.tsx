'use client';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, CircularProgress, IconButton, Link as MuiLink, Paper, Tooltip, Typography } from '@mui/material';
import mermaid from 'mermaid';
import 'prism-themes/themes/prism-one-dark.css';
import React, { memo, useCallback, useEffect, useState } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    markdown: string;
    className?: string;
    onAnalyzeVerse?: (verse: string) => void;
}

// Calming & Focused Styling (learning platform optimized)
const neuBrutalColors = {
    primary: '#1e40af',
    secondary: '#0891b2',
    accent: '#f59e0b',
    text: '#1f2937',
    background: '#ffffff',
    border: '#1f2937',
    codeBg: '#374151',
    codeText: '#e5e7eb',
    inlineCodeBg: '#f3f4f6',
    inlineCodeBorder: '#9ca3af',
    blockquoteBorder: '#1e40af',
    blockquoteBg: '#eff6ff',
    tableHeaderBg: '#f59e0b',
    tableCellBorder: '#1f2937',
    link: '#7c3aed',
    linkHover: '#0891b2',
    errorText: '#ef4444',
    verseBg: '#fffbeb', // Warm amber paper-like background
    verseBorder: '#fde68a',
    verseText: '#78350f',
};

const neuBrutalBorder = `3px solid ${neuBrutalColors.border}`;
const neuBrutalShadow = `4px 4px 0px ${neuBrutalColors.border}`;
const neuBrutalRadius = '0px';

mermaid.initialize({
    startOnLoad: false, // We will call render explicitly
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: '"Courier New", monospace',
});

// --- NEW: Helper to extract raw text from complex children ---
const extractText = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
        return children;
    }
    if (Array.isArray(children)) {
        return children.map((child) => extractText(child)).join('');
    }
    // Check for valid React element and its props
    if (
        React.isValidElement(children) &&
        typeof children.props === 'object' &&
        children.props !== null &&
        'children' in children.props
    ) {
        return extractText((children.props as { children?: React.ReactNode }).children);
    }
    return '';
};

// Check if text is likely Sanskrit/Hindi Shloka (contains Devanagari)
const isDevanagari = (text: string): boolean => {
    // Range for Devanagari: \u0900-\u097F
    const devanagariRegex = /[\u0900-\u097F]/;
    return devanagariRegex.test(text);
};

// Split verse blocks on verse markers
const splitVerses = (text: string): string[] => {
    // Look for verse endings with EITHER:
    // - Arabic numerals: ॥ 1 ॥, ॥ 2 ॥, etc.
    // - Devanagari numerals: ॥ १ ॥, ॥ २ ॥, etc.
    // Devanagari numerals range: \u0966-\u096F (०-९)
    const versePattern = /॥\s*[\d\u0966-\u096F]+\s*॥/g;
    const matches = [...text.matchAll(versePattern)];

    if (matches.length === 0) {
        return [text]; // No verses found, return as-is
    }

    const verses: string[] = [];
    let lastIndex = 0;

    matches.forEach((match, idx) => {
        if (match.index !== undefined) {
            const endOfMatch = match.index + match[0].length;
            // Include from last split point to end of this match
            const verseText = text.slice(lastIndex, endOfMatch).trim();
            if (verseText) {
                verses.push(verseText);
            }
            lastIndex = endOfMatch;
        }
    });

    // Capture any remaining text after last verse marker
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
        verses.push(remaining);
    }

    return verses;
};


// --- CodeBlock Component ---
interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
}

const CodeBlockRaw: React.FC<CodeBlockProps> = ({
    inline,
    className,
    children,
    ...props
}) => {
    const [copied, setCopied] = useState(false);
    const codeContent = extractText(children).replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    const lang = match?.[1];
    const isMermaid = lang === 'mermaid';
    const mermaidIdRef = React.useRef(`mermaid-graph-${Math.random().toString(36).substr(2, 9)}`);
    const [mermaidSvg, setMermaidSvg] = useState<string>('');
    const [mermaidLoading, setMermaidLoading] = useState<boolean>(isMermaid);
    const [mermaidError, setMermaidError] = useState<string | null>(null);

    useEffect(() => {
        if (isMermaid && codeContent) {
            setMermaidLoading(true);
            setMermaidError(null);
            mermaid.render(mermaidIdRef.current, codeContent)
                .then(({ svg }) => setMermaidSvg(svg))
                .catch((error) => {
                    console.error('Mermaid rendering error:', error);
                    setMermaidError('Failed to render diagram. Check syntax.');
                })
                .finally(() => setMermaidLoading(false));
        }
    }, [isMermaid, codeContent]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [codeContent]);

    if (inline) {
        return (
            <Box component="code" sx={{ bgcolor: neuBrutalColors.inlineCodeBg, border: `2px solid ${neuBrutalColors.inlineCodeBorder}`, color: neuBrutalColors.text, px: 0.75, py: 0.25, borderRadius: neuBrutalRadius, fontFamily: '"Courier New", monospace', fontSize: '0.9em', boxShadow: `1px 1px 0px ${neuBrutalColors.inlineCodeBorder}` }} className={className} {...props}>
                {children}
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ position: 'relative', mb: 2.5, border: neuBrutalBorder, borderRadius: neuBrutalRadius, boxShadow: neuBrutalShadow, overflow: 'hidden', bgcolor: isMermaid ? neuBrutalColors.background : neuBrutalColors.codeBg }}>
            {!isMermaid && (
                <Tooltip title={copied ? "COPIED!" : "COPY CODE"}>
                    <IconButton size="small" onClick={handleCopy} sx={{ position: 'absolute', top: 8, right: 8, color: neuBrutalColors.codeText, bgcolor: 'rgba(255,255,255,0.1)', border: `2px solid ${neuBrutalColors.codeText}`, borderRadius: neuBrutalRadius, boxShadow: `2px 2px 0px ${neuBrutalColors.codeText}`, zIndex: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translate(1px,1px)', boxShadow: `1px 1px 0px ${neuBrutalColors.codeText}` } }} aria-label="Copy code">
                        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            )}
            {isMermaid ? (
                <Box sx={{ p: 2, minHeight: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: neuBrutalColors.background }}>
                    {mermaidLoading ? <CircularProgress size={30} sx={{ color: neuBrutalColors.primary }} />
                        : mermaidError ? <Typography sx={{ color: neuBrutalColors.errorText, fontWeight: 'bold', fontFamily: '"Courier New", monospace' }}>{mermaidError}</Typography>
                            : <Box dangerouslySetInnerHTML={{ __html: mermaidSvg }} sx={{ width: '100%', '& svg': { maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' } }} />}
                </Box>
            ) : (
                <Box component="pre" className={className} sx={{ color: neuBrutalColors.codeText, p: 2, pt: lang ? 5 : 2, overflowX: 'auto', fontFamily: '"Fira Code", "Courier New", monospace', fontSize: '0.9rem', lineHeight: 1.6, borderRadius: `0 !important`, '&::-webkit-scrollbar': { height: '8px', backgroundColor: neuBrutalColors.codeBg }, '&::-webkit-scrollbar-thumb': { backgroundColor: neuBrutalColors.primary, border: `2px solid ${neuBrutalColors.codeBg}` }, '& code': { fontFamily: 'inherit !important', fontSize: 'inherit !important', textShadow: 'none !important' } }} {...props}>
                    {children}
                </Box>
            )}
        </Paper>
    );
};
const CodeBlock = memo(CodeBlockRaw);
CodeBlock.displayName = 'MarkdownCodeBlock';

// --- Helper for creating styled components with displayName ---
const createStyledComponent = <T extends React.ElementType>(
    ComponentNode: T,
    defaultSx: object,
    name: string
): React.FC<React.ComponentProps<T>> => {
    const Styled = (props: React.ComponentProps<T>) => (
        React.createElement(ComponentNode, { ...props, sx: defaultSx })
    );
    Styled.displayName = name;
    return memo(Styled) as React.FC<React.ComponentProps<T>>; // Cast to ensure memo works with generics
};


// --- Verse Card Component with Decode Button ---
interface VerseCardProps {
    verse: string;
    onAnalyze?: (verse: string) => void;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, onAnalyze }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Paper
            elevation={0}
            component="div"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                position: 'relative',
                my: 5,
                px: 5,
                py: 4,
                bgcolor: neuBrutalColors.verseBg,
                border: `2px solid ${neuBrutalColors.verseBorder}`,
                borderRadius: '12px',
                color: neuBrutalColors.verseText,
                textAlign: 'center',
                fontFamily: '"Noto Serif Devanagari", "Noto Serif", "Siddhanta", serif',
                fontSize: '1.4rem',
                lineHeight: 2.2,
                fontWeight: 500,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                wordBreak: 'keep-all',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-line',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
            }}
        >
            {verse}

            {/* Decode Button - Appears on Hover */}
            {onAnalyze && (
                <Tooltip title="Decode with AI - Vedantic Analysis">
                    <IconButton
                        onClick={() => onAnalyze(verse)}
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#7c3aed',
                            color: '#ffffff',
                            opacity: isHovered ? 1 : 0,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: '#6d28d9',
                                transform: 'scale(1.1)',
                            },
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        size="medium"
                        aria-label="Decode verse"
                    >
                        <AutoAwesomeIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Paper>
    );
};

// --- Custom components for ReactMarkdown ---

const MarkdownH1 = createStyledComponent(Typography, { variant: "h3", component: "h1", gutterBottom: true, fontWeight: 900, color: neuBrutalColors.text, mt: 5, mb: 3, fontFamily: '"Bangers", "Arial Black", sans-serif', textTransform: 'uppercase', borderBottom: `4px solid ${neuBrutalColors.primary}`, pb: 1, display: 'inline-block', boxShadow: neuBrutalShadow }, 'MarkdownH1');
const MarkdownH2 = createStyledComponent(Typography, { variant: "h4", component: "h2", gutterBottom: true, fontWeight: 800, color: neuBrutalColors.text, mt: 4, mb: 2, fontFamily: '"Bangers", "Arial Black", sans-serif', textTransform: 'uppercase' }, 'MarkdownH2');
const MarkdownH3 = createStyledComponent(Typography, { variant: "h5", component: "h3", gutterBottom: true, fontWeight: 700, color: neuBrutalColors.text, mt: 3.5, mb: 1.5, fontFamily: '"Arial Black", sans-serif', textTransform: 'uppercase' }, 'MarkdownH3');
const MarkdownH4 = createStyledComponent(Typography, { variant: "h6", component: "h4", gutterBottom: true, fontWeight: 700, color: neuBrutalColors.text, mt: 3, mb: 1, fontFamily: '"Arial Black", sans-serif' }, 'MarkdownH4');

const MarkdownA = memo(({ href, children, ...props }: React.ComponentProps<typeof MuiLink>) => (
    <MuiLink href={href ?? ''} target="_blank" rel="noopener noreferrer" sx={{ color: neuBrutalColors.link, fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: neuBrutalColors.linkHover, '&:hover': { color: neuBrutalColors.linkHover, backgroundColor: neuBrutalColors.accent, textDecorationColor: neuBrutalColors.link } }} {...props}>
        {children}
    </MuiLink>
));
MarkdownA.displayName = 'MarkdownA';

const MarkdownUl = memo((props: React.ComponentProps<'ul'>) => (
    <Box component="ul" sx={{ pl: 3, mb: 2, listStyleType: '"⚡ "', '& li': { pl: 0.5 } }} {...props} />
));
MarkdownUl.displayName = 'MarkdownUl';

const MarkdownOl = memo((props: React.ComponentProps<'ol'>) => (
    <Box component="ol" sx={{ pl: 3, mb: 2, listStyleType: 'decimal', '& li': { pl: 0.5 } }} {...props} />
));
MarkdownOl.displayName = 'MarkdownOl';

const MarkdownLi = memo((props: React.ComponentProps<'li'>) => (
    <Box component="li" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 500, color: neuBrutalColors.text }} {...props} />
));
MarkdownLi.displayName = 'MarkdownLi';

const MarkdownBlockquote = memo((props: React.ComponentProps<'blockquote'>) => (
    <Box
        component="blockquote"
        sx={{
            borderLeft: `8px solid ${neuBrutalColors.primary}`,
            borderTop: neuBrutalBorder,
            borderRight: neuBrutalBorder,
            borderBottom: neuBrutalBorder,
            bgcolor: neuBrutalColors.blockquoteBg,
            px: 3,
            py: 2.5,
            my: 3,
            color: neuBrutalColors.text,
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: '1.15rem',
            lineHeight: 1.8,
            boxShadow: neuBrutalShadow,
            '& p': { mb: '0.5em !important', fontSize: '1.15rem !important', fontFamily: '"Inter", sans-serif !important' }
        }}
        {...props}
    />
));
MarkdownBlockquote.displayName = 'MarkdownBlockquote';

const MarkdownImg = memo((props: React.ComponentProps<'img'>) => (
    <Box component="img" sx={{ maxWidth: '100%', height: 'auto', borderRadius: neuBrutalRadius, my: 2.5, border: neuBrutalBorder, boxShadow: neuBrutalShadow, display: 'block', mx: 'auto' }} loading="lazy" {...props} />
));
MarkdownImg.displayName = 'MarkdownImg';

const MarkdownTableWrapper = memo((props: React.ComponentProps<typeof Paper>) => (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'auto', mb: 2.5, border: neuBrutalBorder, borderRadius: neuBrutalRadius, boxShadow: neuBrutalShadow }} {...props} />
));
MarkdownTableWrapper.displayName = 'MarkdownTableWrapper';

const MarkdownTable = memo((props: React.ComponentProps<'table'>) => (
    <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%' }} {...props} />
));
MarkdownTable.displayName = 'MarkdownTable';


const MarkdownTh = memo((props: React.ComponentProps<'th'>) => (
    <Box component="th" sx={{ p: '12px 16px', textAlign: 'left', bgcolor: neuBrutalColors.tableHeaderBg, color: neuBrutalColors.text, border: `2px solid ${neuBrutalColors.tableCellBorder}`, fontWeight: 900, textTransform: 'uppercase', fontFamily: '"Arial Black", sans-serif' }} {...props} />
));
MarkdownTh.displayName = 'MarkdownTh';

const MarkdownTd = memo((props: React.ComponentProps<'td'>) => (
    <Box component="td" sx={{ p: '10px 16px', border: `2px solid ${neuBrutalColors.tableCellBorder}`, bgcolor: neuBrutalColors.background, color: neuBrutalColors.text, fontWeight: 600, 'tr:nth-of-type(even) &': { bgcolor: neuBrutalColors.inlineCodeBg } }} {...props} />
));
MarkdownTd.displayName = 'MarkdownTd';

const MarkdownHr = memo((props: React.ComponentProps<'hr'>) => (
    <Box component="hr" sx={{ my: 3, border: 'none', height: '4px', bgcolor: neuBrutalColors.border, boxShadow: neuBrutalShadow }} {...props} />
));
MarkdownHr.displayName = 'MarkdownHr';


const MarkdownRendererFunction: React.FC<MarkdownRendererProps> = ({ markdown, className, onAnalyzeVerse }) => {
    // Memoize components to avoid recreation on every render
    const components: Options['components'] = React.useMemo(() => ({
        h1: MarkdownH1,
        h2: MarkdownH2,
        h3: MarkdownH3,
        h4: MarkdownH4,
        p: ({ children, ...props }: React.ComponentProps<'p'>) => {
            const textContent = extractText(children);
            const isVerse = isDevanagari(textContent);

            if (isVerse) {
                // Split into multiple verses if verse markers are present
                const verses = splitVerses(textContent);

                if (verses.length > 1) {
                    // Render each verse separately
                    return (
                        <>
                            {verses.map((verse, idx) => (
                                <VerseCard
                                    key={idx}
                                    verse={verse}
                                    onAnalyze={onAnalyzeVerse}
                                />
                            ))}
                        </>
                    );
                }

                // Single verse
                return (
                    <VerseCard
                        verse={textContent}
                        onAnalyze={onAnalyzeVerse}
                    />
                );
            }

            return (
                <Typography
                    paragraph
                    sx={{
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        color: neuBrutalColors.text,
                        fontWeight: 500,
                        mb: 2.5,
                        textAlign: 'justify'
                    }}
                    {...props}
                >
                    {children}
                </Typography>
            );
        },
        a: MarkdownA,
        ul: MarkdownUl,
        ol: MarkdownOl,
        li: MarkdownLi,
        code: CodeBlock,
        blockquote: MarkdownBlockquote,
        img: MarkdownImg,
        table: (props) => <MarkdownTableWrapper><MarkdownTable {...props} /></MarkdownTableWrapper>,
        th: MarkdownTh,
        td: MarkdownTd,
        hr: MarkdownHr,
    }), [onAnalyzeVerse]);

    return (
        <Box sx={{ typography: 'body1', wordBreak: 'break-word', '& .break-words': { wordBreak: 'break-word' } }} className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, rehypePrism]}
                components={components}
            >
                {markdown}
            </ReactMarkdown>
        </Box>
    );
};

const MarkdownRenderer = memo(MarkdownRendererFunction);
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
