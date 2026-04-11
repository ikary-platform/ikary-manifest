import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  picture: string | null;
}

@Injectable()
export class GoogleOAuthClient {
  async exchangeCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<GoogleTokenResponse> {
    const body: Record<string, string> = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    if (codeVerifier) {
      body.code_verifier = codeVerifier;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange Google authorization code.');
    }

    const data = (await response.json()) as GoogleTokenResponse & { error?: string };
    if (data.error) {
      throw new UnauthorizedException(`Google token exchange failed: ${data.error}`);
    }

    return data;
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch Google user info.');
    }

    return response.json() as Promise<GoogleUserInfo>;
  }
}
