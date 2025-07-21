-- Development environment seed data for PromPalette
-- This file should ONLY be run in local development environments
-- WARNING: Do not run in production!

-- Verify we're in development mode
DO $$
BEGIN
  -- This will throw an error if not in local development
  -- In production, CURRENT_DATABASE() should not be 'postgres' (Supabase's default local name)
  IF CURRENT_DATABASE() != 'postgres' THEN
    RAISE EXCEPTION 'This seed script should only be run in local development environment!';
  END IF;
END $$;

-- Clear existing data (development only)
TRUNCATE TABLE public.prompts CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Insert development users
INSERT INTO public.users (id, email, name, avatar_url, username, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'stub@example.com', 'スタブユーザー', 'https://github.com/github.png', 'stub-user', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'dev@example.com', '開発エキスパート', 'https://github.com/octocat.png', 'dev-expert', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'ai@example.com', 'AI研究者', 'https://github.com/mona.png', 'ai-researcher', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'ux@example.com', 'UXデザイナー', 'https://github.com/hubot.png', 'ux-designer', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'data@example.com', 'データサイエンティスト', 'https://github.com/defunkt.png', 'data-scientist', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'pm@example.com', 'プロダクトマネージャー', 'https://github.com/mojombo.png', 'product-manager', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'tech@example.com', 'テクニカルライター', 'https://github.com/pjhyett.png', 'technical-writer', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'frontend@example.com', 'フロントエンド開発者', 'https://github.com/wycats.png', 'frontend-dev', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'backend@example.com', 'バックエンド開発者', 'https://github.com/ezmobius.png', 'backend-dev', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'devops@example.com', 'DevOpsエンジニア', 'https://github.com/ivey.png', 'devops-eng', true, NOW(), NOW());

-- Insert development prompts (100 items)
-- Generate prompts with variety
INSERT INTO public.prompts (id, user_id, title, content, tags, quick_access_key, is_public, view_count, copy_count, created_at, updated_at) 
SELECT 
  ('660e8400-e29b-41d4-a716-' || LPAD((446655440000 + generate_series)::text, 12, '0'))::uuid,
  CASE (generate_series % 10)
    WHEN 0 THEN '550e8400-e29b-41d4-a716-446655440000'::uuid
    WHEN 1 THEN '550e8400-e29b-41d4-a716-446655440001'::uuid
    WHEN 2 THEN '550e8400-e29b-41d4-a716-446655440002'::uuid
    WHEN 3 THEN '550e8400-e29b-41d4-a716-446655440003'::uuid
    WHEN 4 THEN '550e8400-e29b-41d4-a716-446655440004'::uuid
    WHEN 5 THEN '550e8400-e29b-41d4-a716-446655440005'::uuid
    WHEN 6 THEN '550e8400-e29b-41d4-a716-446655440006'::uuid
    WHEN 7 THEN '550e8400-e29b-41d4-a716-446655440007'::uuid
    WHEN 8 THEN '550e8400-e29b-41d4-a716-446655440008'::uuid
    ELSE '550e8400-e29b-41d4-a716-446655440009'::uuid
  END,
  CASE (generate_series % 15)
    WHEN 0 THEN 'コードレビュー用プロンプト' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 1 THEN 'バグ修正プロンプト' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 2 THEN 'API設計レビュー' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 3 THEN 'データベース最適化' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 4 THEN 'UI/UX改善提案' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 5 THEN 'セキュリティ監査' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 6 THEN 'テスト戦略設計' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 7 THEN 'ドキュメント作成支援' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 8 THEN '要件分析プロンプト' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 9 THEN 'リファクタリング提案' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 10 THEN 'パフォーマンス分析' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 11 THEN 'アーキテクチャレビュー' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 12 THEN '翻訳・多言語対応' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 13 THEN 'データ分析レポート' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
    ELSE 'DevOps改善提案' || CASE WHEN generate_series > 15 THEN ' v' || ((generate_series / 15) + 1)::text ELSE '' END
  END,
  CASE (generate_series % 15)
    WHEN 0 THEN 'このコードをレビューして、改善点を教えてください。特に以下の点を重視してください：\n\n1. 可読性\n2. パフォーマンス\n3. セキュリティ\n4. ベストプラクティス'
    WHEN 1 THEN '以下のエラーを修正してください。可能な限り効率的で保守性の高い解決策を提案してください。'
    WHEN 2 THEN 'この API 設計を評価し、RESTful 設計原則、セキュリティ、パフォーマンスの観点から改善提案をお願いします。'
    WHEN 3 THEN 'このクエリとスキーマを最適化してください。インデックス、正規化、パフォーマンスを考慮してください。'
    WHEN 4 THEN 'このUI/UXデザインを評価して、改善提案をお願いします：\n\n- ユーザビリティ\n- アクセシビリティ\n- 視覚的デザイン\n- ユーザー体験'
    WHEN 5 THEN 'このコード/システムのセキュリティ脆弱性を分析し、対策を提案してください。OWASP Top 10を参考にしてください。'
    WHEN 6 THEN 'この機能のテスト戦略を設計してください。単体テスト、統合テスト、E2Eテストを含めてください。'
    WHEN 7 THEN '以下の機能についてのドキュメントを作成してください：\n\n- 機能概要\n- 使用方法\n- 注意事項\n- サンプルコード'
    WHEN 8 THEN 'この要求仕様を分析し、機能要件と非機能要件に分けて整理してください。曖昧な部分の質問も含めてください。'
    WHEN 9 THEN 'このコードをリファクタリングしてください。可読性、保守性、拡張性を向上させる方法を提案してください。'
    WHEN 10 THEN 'このシステム/コードのパフォーマンスボトルネックを特定し、最適化方法を提案してください。'
    WHEN 11 THEN 'このシステムアーキテクチャを評価し、スケーラビリティ、保守性、技術的負債の観点から改善提案をしてください。'
    WHEN 12 THEN '以下のテキストを自然な日本語に翻訳してください。技術的な内容については、適切な専門用語を使用してください。'
    WHEN 13 THEN 'このデータを分析し、以下の観点からレポートを作成してください：\n\n- 主要な傾向\n- 異常値の検出\n- ビジネスインサイト\n- 推奨アクション'
    ELSE 'このCI/CDパイプラインとインフラ構成を評価し、自動化、信頼性、運用効率の観点から改善提案をしてください。'
  END,
  CASE (generate_series % 15)
    WHEN 0 THEN ARRAY['コードレビュー', 'プログラミング', '品質管理']
    WHEN 1 THEN ARRAY['バグ修正', 'デバッグ', 'トラブルシューティング']
    WHEN 2 THEN ARRAY['API', '設計', 'REST', 'セキュリティ']
    WHEN 3 THEN ARRAY['データベース', 'SQL', '最適化', 'パフォーマンス']
    WHEN 4 THEN ARRAY['UI/UX', 'デザイン', 'ユーザビリティ', 'アクセシビリティ']
    WHEN 5 THEN ARRAY['セキュリティ', '脆弱性', 'OWASP', '監査']
    WHEN 6 THEN ARRAY['テスト', '品質保証', 'TDD', '自動化']
    WHEN 7 THEN ARRAY['ドキュメント', 'テクニカルライティング', 'API文書']
    WHEN 8 THEN ARRAY['要件分析', '仕様', '設計', 'プロダクト']
    WHEN 9 THEN ARRAY['リファクタリング', 'クリーンコード', '保守性']
    WHEN 10 THEN ARRAY['パフォーマンス', '最適化', 'プロファイリング']
    WHEN 11 THEN ARRAY['アーキテクチャ', '設計', 'スケーラビリティ']
    WHEN 12 THEN ARRAY['翻訳', '多言語', '国際化', 'i18n']
    WHEN 13 THEN ARRAY['データ分析', 'レポート', 'BI', '統計']
    ELSE ARRAY['DevOps', 'CI/CD', 'インフラ', '自動化']
  END,
  CASE (generate_series % 15)
    WHEN 0 THEN 'review' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 1 THEN 'bugfix' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 2 THEN 'api' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 3 THEN 'db' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 4 THEN 'ux' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 5 THEN 'security' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 6 THEN 'test' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 7 THEN 'docs' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 8 THEN 'requirements' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 9 THEN 'refactor' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 10 THEN 'perf' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 11 THEN 'arch' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 12 THEN 'translate' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    WHEN 13 THEN 'analysis' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
    ELSE 'devops' || CASE WHEN generate_series > 15 THEN ((generate_series / 15) + 1)::text ELSE '' END
  END,
  CASE WHEN random() > 0.3 THEN true ELSE false END, -- 70% public
  floor(random() * 100)::int, -- view_count
  floor(random() * 30)::int,  -- copy_count
  NOW() - (random() * interval '30 days'), -- created_at (within last 30 days)
  NOW() - (random() * interval '1 day')    -- updated_at (within last day)
FROM generate_series(1, 100);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Development seed data loaded successfully!';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM public.users);
  RAISE NOTICE 'Prompts: %', (SELECT COUNT(*) FROM public.prompts);
END $$;