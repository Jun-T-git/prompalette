import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);
    
    const heading = screen.getByRole('heading', { name: 'PromPalette', level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render the Japanese tagline', () => {
    render(<HomePage />);
    
    const tagline = screen.getByText(/でどこからでも瞬時に呼び出し/);
    expect(tagline).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    render(<HomePage />);
    
    const webAppButtons = screen.getAllByText('Webアプリを開始');
    const desktopButton = screen.getByText('デスクトップ版をダウンロード');
    
    expect(webAppButtons).toHaveLength(2); // One in product section, one in CTA section
    expect(desktopButton).toBeInTheDocument();
  });

  it('should render key benefits section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('グローバルホットキー')).toBeInTheDocument();
    expect(screen.getByText('即時検索')).toBeInTheDocument();
    expect(screen.getByText('即時ペースト')).toBeInTheDocument();
  });

  it('should render problem section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('作業を中断していませんか？')).toBeInTheDocument();
    expect(screen.getByText('アプリ切り替えの時間')).toBeInTheDocument();
    expect(screen.getByText('検索の手間')).toBeInTheDocument();
    expect(screen.getByText('思考の中断')).toBeInTheDocument();
  });

  it('should render product options', () => {
    render(<HomePage />);
    
    expect(screen.getByText('PromPalette Web')).toBeInTheDocument();
    expect(screen.getByText('PromPalette Desktop')).toBeInTheDocument();
    expect(screen.getByText('バックグラウンドから1秒でアクセス')).toBeInTheDocument();
  });

  it('should render features section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('なぜ PromPalette なのか？')).toBeInTheDocument();
    expect(screen.getByText('バックグラウンド起動')).toBeInTheDocument();
    expect(screen.getByText('リアルタイム検索')).toBeInTheDocument();
    expect(screen.getByText('プライバシー重視')).toBeInTheDocument();
  });
});