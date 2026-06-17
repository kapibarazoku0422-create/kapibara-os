# kapibara OS — Exec Server

kapibara OSのターミナルで `node -e` / `python3 -c` を本当に実行するRenderバックエンドです。

## Renderにデプロイ

1. このフォルダをGitHubにpush
2. https://dashboard.render.com で「New Web Service」
3. リポジトリを選択 → 自動検出でOK
4. Deploy → URLをコピー
5. kapibara OS の設定画面 → ターミナル → サーバーURLに貼り付け

## エンドポイント

| メソッド | パス | 説明 |
|--------|------|------|
| GET | /ping | 接続確認 |
| POST | /exec | コード実行 |
| GET | /processes | 実行中プロセス一覧 |
| DELETE | /processes/:pid | プロセス停止 |

## POST /exec リクエスト例

```json
{
  "lang": "node",
  "code": "console.log('Hello from kapibara OS!')"
}
```

対応言語: `node`, `python3`, `bash`

## 注意

- 実行タイムアウト: 15秒
- 出力バッファ: 512KB
- 個人利用専用 (tkhr)
