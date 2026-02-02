'use client';

import { fetchRepoContents } from '@/app/actions';
import { GitHubFile } from '@/lib/github';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { CircularProgress, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React, { useState } from 'react';

interface FileTreeProps {
    files: GitHubFile[]; // Initial files (root)
    owner: string;
    repo: string;
    onSelectFile: (file: GitHubFile) => void;
    selectedPath?: string;
    level?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ files, owner, repo, onSelectFile, selectedPath, level = 0 }) => {
    return (
        <List component="div" disablePadding>
            {files
                .sort((a, b) => {
                    // Folders first
                    if (a.type === 'dir' && b.type !== 'dir') return -1;
                    if (a.type !== 'dir' && b.type === 'dir') return 1;
                    return a.name.localeCompare(b.name);
                })
                .map((file) => (
                    <FileTreeItem
                        key={file.path}
                        file={file}
                        owner={owner}
                        repo={repo}
                        onSelectFile={onSelectFile}
                        selectedPath={selectedPath}
                        level={level}
                    />
                ))}
        </List>
    );
};

interface FileTreeItemProps {
    file: GitHubFile;
    owner: string;
    repo: string;
    onSelectFile: (file: GitHubFile) => void;
    selectedPath?: string;
    level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, owner, repo, onSelectFile, selectedPath, level }) => {
    const [open, setOpen] = useState(false);
    const [children, setChildren] = useState<GitHubFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const isFolder = file.type === 'dir';
    const isSelected = selectedPath === file.path;

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
            setOpen(!open);
            if (!loaded && !loading) {
                setLoading(true);
                try {
                    const data = await fetchRepoContents(owner, repo, file.path);
                    setChildren(data);
                    setLoaded(true);
                } catch (err) {
                    console.error("Failed to load folder", err);
                } finally {
                    setLoading(false);
                }
            }
        } else {
            onSelectFile(file);
        }
    };

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                selected={isSelected}
                sx={{
                    pl: 2 + level * 2,
                    py: 0.5,
                    borderLeft: isSelected ? '4px solid #1e40af' : '4px solid transparent',
                    '&.Mui-selected': { bgcolor: 'rgba(30, 64, 175, 0.1)' }
                }}
            >
                <ListItemIcon sx={{ minWidth: 32, color: isFolder ? '#f59e0b' : '#64748b' }}>
                    {isFolder ? (open ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />) : <InsertDriveFileIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                    primary={file.name}
                    primaryTypographyProps={{
                        variant: 'body2',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: isSelected ? 600 : 400,
                        noWrap: true
                    }}
                />
                {isFolder && (loading ? <CircularProgress size={16} /> : (open ? <ExpandLess /> : <ExpandMore />))}
            </ListItemButton>
            {isFolder && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <FileTree
                        files={children}
                        owner={owner}
                        repo={repo}
                        onSelectFile={onSelectFile}
                        selectedPath={selectedPath}
                        level={level + 1}
                    />
                </Collapse>
            )}
        </>
    );
};

export default FileTree;
