'use client';

import { fetchFileContent, fetchRepoContents } from '@/app/actions';
import FileTree from '@/components/FileTree';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import PdfViewer from '@/components/PdfViewer';
import StanzaAnalysisModal from '@/components/StanzaAnalysisModal';
import { GitHubFile } from '@/lib/github';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, CircularProgress, Drawer, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const DRAWER_WIDTH = 300;

// Default Repo Config
const DEFAULT_OWNER = 'ankit1x01';
const DEFAULT_REPO = 'adishankaracharya-work';

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [repoConfig, setRepoConfig] = useState({ owner: DEFAULT_OWNER, repo: DEFAULT_REPO });
  const [rootFiles, setRootFiles] = useState<GitHubFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [contentType, setContentType] = useState<'markdown' | 'pdf' | 'other' | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load root files
  useEffect(() => {
    loadRoot();
  }, [repoConfig]);

  const loadRoot = async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await fetchRepoContents(repoConfig.owner, repoConfig.repo, '');
      setRootFiles(files);
    } catch (err) {
      console.error(err);
      setError('Failed to load repository. Check owner/repo name or rate limits.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSelectFile = async (file: GitHubFile) => {
    setSelectedFile(file);
    setMobileOpen(false); // Close drawer on mobile
    setLoadingContent(true);

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'md' || extension === 'markdown') {
        setContentType('markdown');
        const content = await fetchFileContent(repoConfig.owner, repoConfig.repo, file.path);
        setFileContent(content);
      } else if (extension === 'pdf') {
        setContentType('pdf');
        // We use the download_url for PDF
        setFileContent(file.download_url || '');
      } else {
        setContentType('other');
        setFileContent('Preview not available for this file type.');
      }
    } catch (err) {
      console.error(err);
      setFileContent('Error loading file content.');
    } finally {
      setLoadingContent(false);
    }
  };

  // Handle verse analysis
  const handleAnalyzeVerse = async (verse: string) => {
    setSelectedVerse(verse);
    setAnalysisModalOpen(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verse, promptType: 'full' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze verse');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze verse');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', bgcolor: '#f8fafc' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e40af', mb: 1 }}>
          VEDANTA VIEWER
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Local Library: adi-shankaracharya
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2, fontSize: '0.875rem' }}>{error}</Typography>
        ) : (
          <FileTree
            files={rootFiles}
            owner={repoConfig.owner}
            repo={repoConfig.repo}
            onSelectFile={handleSelectFile}
            selectedPath={selectedFile?.path}
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* App Bar for Mobile */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { sm: `${DRAWER_WIDTH}px` }, display: { sm: 'none' } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {selectedFile ? selectedFile.name : 'Files'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #e2e8f0' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, height: '100vh', overflowY: 'auto', bgcolor: '#ffffff' }}>
        <Toolbar sx={{ display: { sm: 'none' } }} /> {/* Spacer for mobile appbar */}

        {loadingContent ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : selectedFile ? (
          <Box sx={{ maxWidth: '900px', mx: 'auto', height: '100%' }}>
            {contentType === 'markdown' && (
              <MarkdownRenderer
                markdown={fileContent}
                onAnalyzeVerse={handleAnalyzeVerse}
              />
            )}
            {contentType === 'pdf' && (
              <PdfViewer url={fileContent} />
            )}
            {contentType === 'other' && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography>{fileContent}</Typography>
              </Paper>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#94a3b8' }}>ADI SHANKARA</Typography>
            <Typography>Select a file to begin reading</Typography>
          </Box>
        )}
      </Box>

      {/* AI Analysis Modal */}
      <StanzaAnalysisModal
        open={analysisModalOpen}
        onClose={handleCloseAnalysisModal}
        verse={selectedVerse}
        analysis={analysis}
        loading={analysisLoading}
        error={analysisError}
      />
    </Box>
  );
}
