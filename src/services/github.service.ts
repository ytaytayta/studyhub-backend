import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

interface GithubApiRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

export class GithubService {
  async getRepos(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.githubUsername) {
      throw new ApiError(400, 'GitHub username not set on profile');
    }

    const cached = await prisma.githubRepo.findMany({
      where: { userId },
      orderBy: { stars: 'desc' },
    });

    if (cached.length > 0) {
      return cached;
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'StudyHub-AI',
    };

    if (config.githubToken) {
      headers.Authorization = `Bearer ${config.githubToken}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${user.githubUsername}/repos?sort=stars&per_page=30`,
      { headers }
    );

    if (!response.ok) {
      throw new ApiError(502, `GitHub API error: ${response.statusText}`);
    }

    const repos = (await response.json()) as GithubApiRepo[];

    await prisma.githubRepo.deleteMany({ where: { userId } });

    const saved = await Promise.all(
      repos.map((repo) =>
        prisma.githubRepo.create({
          data: {
            userId,
            repoName: repo.name,
            stars: repo.stargazers_count,
            language: repo.language,
            url: repo.html_url,
          },
        })
      )
    );

    return saved;
  }
}

export const githubService = new GithubService();
