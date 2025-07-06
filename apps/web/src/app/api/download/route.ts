import { NextRequest, NextResponse } from 'next/server';

import { createCorsHeaders } from '../../../config/cors';
import { logError, logInfo, logWarn, extractErrorInfo } from '../../../lib/logger';

interface GitHubRelease {
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface DownloadResponse {
  message: string;
  github_url: string;
  platform: string;
}

interface ErrorResponse {
  error: string;
  supported_platforms: string[];
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'macos';
  
  // ダウンロードリクエストをログ記録
  logInfo('Download request received', {
    platform,
    origin,
    userAgent: request.headers.get('user-agent'),
  });
  
  if (platform === 'macos') {
    const githubApiUrl = 'https://api.github.com/repos/Jun-T-git/prompalette/releases/latest';
    
    try {
      const githubResponse = await fetch(githubApiUrl, {
        headers: {
          'User-Agent': 'PromPalette-Download-Service/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (githubResponse.ok) {
        const release: GitHubRelease = await githubResponse.json();
        const dmgAsset: GitHubAsset | undefined = release.assets?.find((asset: GitHubAsset) => 
          asset.name.endsWith('.dmg') || asset.name.toLowerCase().includes('macos')
        );
        
        if (dmgAsset) {
          logInfo('Successful download redirect', {
            platform,
            assetName: dmgAsset.name,
            downloadUrl: dmgAsset.browser_download_url,
          });
          
          // 直接リダイレクトでGitHubのCDNを活用（メモリ効率が良い）
          const redirectResponse = NextResponse.redirect(dmgAsset.browser_download_url, 302);
          
          // CORS ヘッダーを設定
          Object.entries(createCorsHeaders(origin)).forEach(([key, value]) => {
            redirectResponse.headers.set(key, value);
          });
          
          return redirectResponse;
        } else {
          logWarn('No DMG asset found in GitHub release', {
            platform,
            availableAssets: release.assets?.map(a => a.name) || [],
          });
        }
      } else {
        logError('GitHub API returned non-OK status', {
          url: githubApiUrl,
          statusCode: githubResponse.status,
          statusText: githubResponse.statusText,
        });
      }
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      logError('GitHub API request failed', {
        url: githubApiUrl,
        error: errorInfo.message,
        stack: errorInfo.stack,
      });
    }
    
    // GitHub Releasesが利用できない場合は、適切なフォールバックレスポンスを返す
    const fallbackResponse: DownloadResponse = {
      message: 'ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。',
      github_url: 'https://github.com/Jun-T-git/prompalette/releases',
      platform: platform
    };
    
    logInfo('Returning fallback response', {
      platform,
      reason: 'GitHub API unavailable or no assets found',
    });
    
    return NextResponse.json(fallbackResponse, { 
      status: 202,
      headers: createCorsHeaders(origin)
    });
  }
  
  // プラットフォームが対応していない場合
  logWarn('Unsupported platform requested', {
    platform,
    supportedPlatforms: ['macos'],
  });
  
  const errorResponse: ErrorResponse = {
    error: 'Platform not supported',
    supported_platforms: ['macos']
  };
  
  return NextResponse.json(errorResponse, { 
    status: 400,
    headers: createCorsHeaders(origin)
  });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  logInfo('CORS preflight request received', {
    origin,
    method: 'OPTIONS',
  });
  
  return new NextResponse(null, {
    status: 200,
    headers: createCorsHeaders(origin),
  });
}