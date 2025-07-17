'use client';

import { Card, CardContent, Button } from '@prompalette/ui';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

export default function DownloadGuidePage() {
  const handleGitHubRedirect = () => {
    window.open('https://github.com/Jun-T-git/prompalette/releases', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
            <Github className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            GitHubからダウンロード
          </h1>
          <p className="text-lg text-slate-600">
            以下の手順でPromPalette macOS版をダウンロードしてください
          </p>
        </div>

        {/* Simple Guide */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <p className="text-slate-700">「<strong>Latest</strong>」タグの付いた最新リリースを見つける</p>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <p className="text-slate-700">「<strong>Assets</strong>」セクションを展開</p>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <p className="text-slate-700">「<strong>.dmg</strong>」ファイルをクリックしてダウンロード</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center space-y-4">
          <Button 
            size="lg" 
            onClick={handleGitHubRedirect}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            GitHubでダウンロード
          </Button>
          
          <div className="text-sm text-slate-600">
            <Link href="/docs/desktop" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              ← デスクトップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}