'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1e40af',
        },
        secondary: {
            main: '#0891b2',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
