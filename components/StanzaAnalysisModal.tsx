'use client';

import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Paper, Typography } from '@mui/material';
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StanzaAnalysisModalProps {
    open: boolean;
    onClose: () => void;
    verse: string | null;
    analysis: string | null;
    loading: boolean;
    error: string | null;
}

const StanzaAnalysisModal: React.FC<StanzaAnalysisModalProps> = ({
    open,
    onClose,
    verse,
    analysis,
    loading,
    error,
}) => {
    const handleCopy = () => {
        if (analysis) {
            navigator.clipboard.writeText(analysis);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#f59e0b',
                    color: '#1f2937',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    fontFamily: '"Arial Black", sans-serif',
                    py: 2,
                }}
            >
                <Box>Vedantic Analysis</Box>
                <Box>
                    {analysis && (
                        <IconButton
                            onClick={handleCopy}
                            size="small"
                            sx={{
                                mr: 1,
                                color: '#1f2937',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                            }}
                            aria-label="Copy analysis"
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    )}
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: '#1f2937',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        }}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
                {/* Original Verse */}
                {verse && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            bgcolor: '#fffbeb',
                            border: '2px solid #fde68a',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: '"Noto Serif Devanagari", serif',
                                fontSize: '1.2rem',
                                lineHeight: 2,
                                color: '#78350f',
                                whiteSpace: 'pre-line',
                            }}
                        >
                            {verse}
                        </Typography>
                    </Paper>
                )}

                {/* Loading State */}
                {loading && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8,
                        }}
                    >
                        <CircularProgress size={48} sx={{ color: '#1e40af', mb: 2 }} />
                        <Typography sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                            Decoding the verse through Vedantic lens...
                        </Typography>
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            bgcolor: '#fee2e2',
                            border: '2px solid #f87171',
                            borderRadius: '8px',
                        }}
                    >
                        <Typography sx={{ color: '#b91c1c', fontWeight: 600 }}>
                            Error: {error}
                        </Typography>
                    </Paper>
                )}

                {/* Analysis Result */}
                {analysis && !loading && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            bgcolor: '#ffffff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                        }}
                    >
                        <Box
                            sx={{
                                '& h2': {
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: '#1e40af',
                                    mt: 4,
                                    mb: 2,
                                    pb: 1,
                                    borderBottom: '3px solid #1e40af',
                                    '&:first-of-type': { mt: 0 },
                                },
                                '& h3': {
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    color: '#0891b2',
                                    mt: 3,
                                    mb: 1.5,
                                },
                                '& p': {
                                    fontSize: '1.05rem',
                                    lineHeight: 1.8,
                                    color: '#1f2937',
                                    mb: 2,
                                    textAlign: 'justify',
                                },
                                '& ul, & ol': {
                                    pl: 3,
                                    mb: 2,
                                },
                                '& li': {
                                    mb: 1,
                                    fontSize: '1.05rem',
                                    lineHeight: 1.7,
                                    color: '#374151',
                                },
                                '& strong': {
                                    color: '#1e40af',
                                    fontWeight: 700,
                                },
                                '& em': {
                                    color: '#0891b2',
                                    fontStyle: 'italic',
                                },
                                '& blockquote': {
                                    borderLeft: '4px solid #f59e0b',
                                    bgcolor: '#fffbeb',
                                    p: 2,
                                    my: 2,
                                    fontStyle: 'italic',
                                    color: '#78350f',
                                },
                                '& code': {
                                    bgcolor: '#f3f4f6',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Courier New", monospace',
                                },
                            }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {analysis}
                            </ReactMarkdown>
                        </Box>
                    </Paper>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default memo(StanzaAnalysisModal);
