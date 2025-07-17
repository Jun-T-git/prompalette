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
  const showGuide = searchParams.get('guide') === 'true';
  const checkOnly = searchParams.get('check') === 'true';
  
  // Basic input validation for platform parameter
  const validPlatforms = ['macos', 'windows', 'linux'];
  if (platform !== 'macos' && !validPlatforms.includes(platform)) {
    logWarn('Invalid platform parameter', { platform, validPlatforms });
    return NextResponse.json(
      { error: 'Invalid platform parameter', supported_platforms: validPlatforms },
      { 
        status: 400,
        headers: createCorsHeaders(origin),
      }
    );
  }
  
  // ダウンロードリクエストをログ記録
  logInfo('Download request received', {
    platform,
    origin,
    showGuide,
    checkOnly,
    userAgent: request.headers.get('user-agent'),
  });

  // ガイドページ表示が要求された場合
  if (showGuide) {
    const baseUrl = origin || 'https://prompalette.com';
    return NextResponse.redirect(`${baseUrl}/download-guide`, 302);
  }

  // 健全性チェックのみが要求された場合（CORSエラー対策）
  if (checkOnly) {
    if (platform !== 'macos') {
      const errorResponse: ErrorResponse = {
        error: `現在、${platform}版は開発中です。GitHubのReleasesページでmacOS版をご利用ください。`,
        supported_platforms: ['macos']
      };
      return NextResponse.json(errorResponse, { 
        status: 400,
        headers: createCorsHeaders(origin)
      });
    }
    
    // GitHub API の状態確認
    const githubApiUrl = 'https://api.github.com/repos/Jun-T-git/prompalette/releases/latest';
    try {
      const githubResponse = await fetch(githubApiUrl, {
        headers: {
          'User-Agent': 'PromPalette-Download-Service/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!githubResponse.ok) {
        const fallbackResponse: DownloadResponse = {
          message: 'ダウンロードファイルを準備中です。GitHubのReleasesページで最新版（Latest）の.dmgファイルをダウンロードしてください。',
          github_url: 'https://github.com/Jun-T-git/prompalette/releases',
          platform: platform
        };
        return NextResponse.json(fallbackResponse, { 
          status: 202,
          headers: createCorsHeaders(origin)
        });
      }
      
      const release: GitHubRelease = await githubResponse.json();
      const dmgAsset = release.assets?.find((asset: GitHubAsset) => 
        asset.name.endsWith('.dmg') || asset.name.toLowerCase().includes('macos')
      );
      
      if (!dmgAsset) {
        const fallbackResponse: DownloadResponse = {
          message: 'ダウンロードファイルを準備中です。GitHubのReleasesページで最新版（Latest）の.dmgファイルをダウンロードしてください。',
          github_url: 'https://github.com/Jun-T-git/prompalette/releases',
          platform: platform
        };
        return NextResponse.json(fallbackResponse, { 
          status: 202,
          headers: createCorsHeaders(origin)
        });
      }
      
      return NextResponse.json({ status: 'ok' }, { 
        status: 200,
        headers: createCorsHeaders(origin)
      });
    } catch (error) {
      const fallbackResponse: DownloadResponse = {
        message: 'ダウンロードファイルを準備中です。GitHubのReleasesページで最新版（Latest）の.dmgファイルをダウンロードしてください。',
        github_url: 'https://github.com/Jun-T-git/prompalette/releases',
        platform: platform
      };
      return NextResponse.json(fallbackResponse, { 
        status: 202,
        headers: createCorsHeaders(origin)
      });
    }
  }
  
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
      message: 'ダウンロードファイルを準備中です。GitHubのReleasesページで最新版（Latest）の.dmgファイルをダウンロードしてください。',
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
    error: `現在、${platform}版は開発中です。GitHubのReleasesページでmacOS版をご利用ください。`,
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