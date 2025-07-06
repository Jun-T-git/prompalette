'use client';

import { Button } from '@prompalette/ui';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface DownloadButtonProps {
  platform?: 'macos' | 'windows' | 'linux';
  className?: string;
  size?: 'sm' | 'lg';
  children?: React.ReactNode;
  showPlatformWarning?: boolean;
}

export function DownloadButton({ 
  platform = 'macos', 
  className = '', 
  size = 'lg',
  children,
  showPlatformWarning = true
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    // macOS以外の場合は警告を表示
    if (platform !== 'macos' && showPlatformWarning) {
      const confirmed = window.confirm(
        `現在、${platform === 'windows' ? 'Windows' : 'Linux'}版は開発中です。\n` +
        'GitHubのReleasesページでmacOS版をダウンロードしますか？'
      );
      if (!confirmed) return;
    }

    setIsDownloading(true);
    
    try {
      const downloadUrl = `/api/download?platform=${platform}`;
      
      // 新しいタブで開く（CORSエラー回避）
      const newWindow = window.open(downloadUrl, '_blank');
      
      // ポップアップブロッカーのチェック
      if (!newWindow || newWindow.closed) {
        alert('ポップアップブロッカーが有効です。ダウンロードを許可してください。');
        setIsDownloading(false);
        return;
      }
      
      // API の健全性チェック（実際のファイルは取得せず）
      const healthCheck = await fetch(`/api/download?platform=${platform}&check=true`);
      if (!healthCheck.ok) {
        const data = await healthCheck.json();
        if (data.message) {
          alert(data.message);
        } else if (data.error) {
          alert(data.error);
        }
      }
      
    } catch (error) {
      console.error('Download error:', error);
      alert('ダウンロードに問題が発生しました。しばらくしてから再度お試しください。');
    } finally {
      // ダウンロード開始後、少し待ってからローディング状態を解除
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
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