'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

interface PdfViewerProps {
    url: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
    if (!url) return <Typography>No PDF selected</Typography>;

    // Convert github.com blob URL to raw.githubusercontent.com if needed or use download_url
    // Usually the API gives us a download_url which is raw.
    // Google Docs viewer is a fallback for some browsers if iframe pdf support is flaky,
    // but standard iframe works in most modern browsers.

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', border: 'none' }}>
            <iframe
                src={url}
                width="100%"
                height="100%"
                style={{ border: 'none', height: '100vh' }}
                title="PDF Viewer"
            />
        </Box>
    );
};

export default PdfViewer;
