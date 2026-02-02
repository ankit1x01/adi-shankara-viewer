'use server';

import { getLocalFileContent, getLocalRepoContent } from '@/lib/local-content';

export async function fetchRepoContents(owner: string, repo: string, path?: string) {
    return await getLocalRepoContent(owner, repo, path);
}

export async function fetchFileContent(owner: string, repo: string, path: string) {
    return await getLocalFileContent(owner, repo, path);
}
