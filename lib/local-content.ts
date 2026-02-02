import fs from 'fs';
import path from 'path';
import { GitHubFile } from './github';

const BASE_DIR = path.join(process.cwd(), 'public', 'adi-shankaracharya');

export async function getLocalRepoContent(owner: string, repo: string, dirPath: string = ''): Promise<GitHubFile[]> {
    // We ignore owner and repo for local content, using BASE_DIR instead.

    // Normalize path (remove leading slashes, etc.)
    const cleanPath = dirPath.replace(/^\/+/, '');
    const fullPath = path.join(BASE_DIR, cleanPath);

    // Security check to prevent directory traversal
    if (!fullPath.startsWith(BASE_DIR)) {
        console.error(`Access denied: ${fullPath} is outside ${BASE_DIR}`);
        throw new Error('Invalid path');
    }

    try {
        const stats = await fs.promises.stat(fullPath);

        if (!stats.isDirectory()) {
            // If it's a file, we treat it as a single-item array to match the behavior
            // expected by the consumer if they accidentally asked for a file as a dir
            const fileInfo = await getFileInfo(cleanPath);
            return [fileInfo];
        }

        const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });

        const files: GitHubFile[] = await Promise.all(entries.map(async (entry) => {
            const relativePath = path.join(cleanPath, entry.name).replace(/\\/g, '/');
            return getFileInfo(relativePath);
        }));

        return files;

    } catch (error) {
        console.error(`Error reading ${fullPath}`, error);
        // If file not found, return empty or throw?
        // GitHub API usually throws 404.
        throw error;
    }
}

async function getFileInfo(relativePath: string): Promise<GitHubFile> {
    const fullPath = path.join(BASE_DIR, relativePath);
    const stats = await fs.promises.stat(fullPath);
    const isDir = stats.isDirectory();
    const name = path.basename(relativePath);

    // Construct URLs for public access
    // relativePath likely looks like "folder/file.md"
    // The public URL should be /adi-shankaracharya/folder/file.md
    const pubUrl = `/adi-shankaracharya/${relativePath}`;

    return {
        name,
        path: relativePath,
        sha: 'local', // Dummy
        size: stats.size,
        url: pubUrl,
        html_url: pubUrl,
        git_url: '',
        download_url: pubUrl, // Important for PDF viewer and others
        type: isDir ? 'dir' : 'file',
        _links: {
            self: pubUrl,
            git: '',
            html: pubUrl
        }
    };
}

export async function getLocalFileContent(owner: string, repo: string, filePath: string): Promise<string> {
    const cleanPath = filePath.replace(/^\/+/, '');
    const fullPath = path.join(BASE_DIR, cleanPath);

    if (!fullPath.startsWith(BASE_DIR)) {
        throw new Error('Invalid path');
    }

    return await fs.promises.readFile(fullPath, 'utf-8');
}
