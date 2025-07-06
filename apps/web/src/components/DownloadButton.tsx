'use client';

import { Button } from '@prompalette/ui';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface DownloadButtonProps {
  platform?: 'macos' | 'windows' | 'linux';
  className?: string;
  size?: 'sm' | 'lg';
  children?: React.ReactNode;
}

export function DownloadButton({ 
  platform = 'macos', 
  className = '', 
  size = 'lg',
  children 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const response = await fetch(`/api/download?platform=${platform}`);
      
      if (response.status === 302 || response.redirected) {
        // リダイレクト先のURLを取得してダウンロード開始
        window.open(response.url, '_blank');
      } else if (response.status === 202) {
        // ダウンロードファイルが準備中の場合
        const data = await response.json();
        alert(data.message);
        if (data.github_url) {
          window.open(data.github_url, '_blank');
        }
      } else if (response.ok) {
        // 直接ファイルをダウンロード
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `PromPalette-${platform}.dmg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error('ダウンロードに失敗しました:', errorData);
        alert('ダウンロードに失敗しました。後でもう一度お試しください。');
      }
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <Download className="w-5 h-5 mr-2" />
      {isDownloading ? 'ダウンロード中...' : (children || 'ダウンロード')}
    </Button>
  );
}