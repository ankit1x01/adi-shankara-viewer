import { Octokit } from 'octokit';

// Initialize Octokit (can add auth token from env if needed)
const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

export interface GitHubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: 'file' | 'dir';
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export const getRepoContent = async (owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> => {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        if (Array.isArray(response.data)) {
            // It's a directory
            return response.data as GitHubFile[];
        } else {
            // It's a single file (shouldn't happen with this call if we expect a dir list, but handling just in case)
            return [response.data as unknown as GitHubFile];
        }
    } catch (error) {
        console.error('Error fetching repo content:', error);
        throw error;
    }
};

export const getFileContent = async (owner: string, repo: string, path: string) => {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        // Response data for file content usually has 'content' (base64) and 'encoding'
        if ('content' in response.data) {
            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            return content;
        }
        return '';
    } catch (error) {
        console.error("Error getting file content", error);
        throw error;
    }
}
