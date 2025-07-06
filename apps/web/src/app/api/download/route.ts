import { NextRequest, NextResponse } from 'next/server';

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
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'macos';
  
  // ダウンロード統計やログを記録する場合はここで処理
  console.log(`Download requested for platform: ${platform}`);
  
  if (platform === 'macos') {
    // GitHub Releasesの最新リリースをチェック
    try {
      const githubResponse = await fetch('https://api.github.com/repos/Jun-T-git/prompalette/releases/latest');
      
      if (githubResponse.ok) {
        const release: GitHubRelease = await githubResponse.json();
        const dmgAsset: GitHubAsset | undefined = release.assets?.find((asset: GitHubAsset) => 
          asset.name.endsWith('.dmg') || asset.name.toLowerCase().includes('macos')
        );
        
        if (dmgAsset) {
          return NextResponse.redirect(dmgAsset.browser_download_url);
        }
      }
    } catch (error) {
      console.error('GitHub API error:', error);
    }
    
    // GitHub Releasesが利用できない場合は、ダウンロードページにリダイレクト
    const response: DownloadResponse = {
      message: 'ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。',
      github_url: 'https://github.com/Jun-T-git/prompalette/releases',
      platform: platform
    };
    
    return NextResponse.json(response, { status: 202 });
  }
  
  // プラットフォームが対応していない場合
  const errorResponse: ErrorResponse = {
    error: 'Platform not supported',
    supported_platforms: ['macos']
  };
  
  return NextResponse.json(errorResponse, { status: 404 });
}