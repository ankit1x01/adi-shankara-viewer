'use server';

import { getFileContent, getRepoContent } from '@/lib/github';

export async function fetchRepoContents(owner: string, repo: string, path?: string) {
    return await getRepoContent(owner, repo, path);
}

export async function fetchFileContent(owner: string, repo: string, path: string) {
    return await getFileContent(owner, repo, path);
}
