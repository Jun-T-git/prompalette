# PromPalette API使用例

## 公開プロンプト取得

```bash
# 基本的な取得
curl "https://prompalette.com/api/v1/prompts"

# ページネーション
curl "https://prompalette.com/api/v1/prompts?page=2&limit=10"

# タグフィルタリング
curl "https://prompalette.com/api/v1/prompts?tag=プログラミング"
```

## JavaScript/TypeScript

```typescript
// 公開プロンプト取得
const response = await fetch('https://prompalette.com/api/v1/prompts');
const { data: prompts } = await response.json();

// 新しいプロンプト作成（要APIキー）
const response = await fetch('https://prompalette.com/api/v1/prompts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    title: 'コードレビュー用プロンプト',
    content: 'このコードをレビューしてください...',
    tags: ['コードレビュー', 'プログラミング']
  })
});
```

## Python

```python
import requests

# 公開プロンプト取得
response = requests.get('https://prompalette.com/api/v1/prompts')
prompts = response.json()['data']

# 新しいプロンプト作成
response = requests.post(
    'https://prompalette.com/api/v1/prompts',
    headers={'x-api-key': 'your-api-key'},
    json={
        'title': 'コードレビュー用プロンプト',
        'content': 'このコードをレビューしてください...',
        'tags': ['コードレビュー', 'プログラミング']
    }
)
```

## レスポンス例

```json
{
  "data": [
    {
      "id": "prompt-123",
      "title": "コードレビュー用プロンプト",
      "content": "このコードをレビューして、改善点を教えてください...",
      "tags": ["コードレビュー", "プログラミング"],
      "created_at": "2025-01-15T12:00:00Z",
      "updated_at": "2025-01-15T12:00:00Z",
      "users": {
        "username": "example-user"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```