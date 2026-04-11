import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

@Injectable()
export class GitHubOAuthClient {
  async exchangeCode(code: string, clientId: string, clientSecret: string): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange GitHub authorization code.');
    }

    const data = (await response.json()) as GitHubTokenResponse & { error?: string };
    if (data.error) {
      throw new UnauthorizedException(`GitHub token exchange failed: ${data.error}`);
    }

    return data;
  }

  async getUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub user profile.');
    }

    return response.json() as Promise<GitHubUser>;
  }

  async getUserEmails(accessToken: string): Promise<GitHubEmail[]> {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub user emails.');
    }

    return response.json() as Promise<GitHubEmail[]>;
  }
}
