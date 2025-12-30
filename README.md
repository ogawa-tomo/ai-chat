# AIチャットボット

Claude APIを使用した対話型AIチャットボットアプリケーション。リアルタイムストリーミング応答と会話履歴の永続化機能を提供します。

## 技術スタック

### フロントエンド
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

### バックエンド
- **Node.js 18+**
- **Express.js**
- **TypeScript**
- **Prisma ORM**

### データベース
- **PostgreSQL 14+**

### AI API
- **Anthropic Claude API** (Claude 3.5 Sonnet)

## 主要機能

- Claude APIを使用したAIとの対話
- リアルタイムストリーミング応答
- 会話履歴の永続化
- 過去の会話の閲覧・管理
- レスポンシブデザイン

## プロジェクト構成

```
ai-chat/
├── frontend/          # Next.jsアプリケーション
├── backend/           # Express APIサーバー
├── docs/              # ドキュメント
├── package.json       # ワークスペース設定
├── docker-compose.yml # PostgreSQL
└── .env.example       # 環境変数テンプレート
```

## セットアップ

### 前提条件

- Node.js 18以上
- npm 9以上
- Docker & Docker Compose（推奨）
- Claude APIキー

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd ai-chat
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
```

`.env.local`を編集して、以下の値を設定してください：
- `ANTHROPIC_API_KEY`: Claude APIキー
- `DATABASE_URL`: PostgreSQLの接続URL

4. **PostgreSQLの起動**
```bash
docker-compose up -d
```

5. **データベースのマイグレーション**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
cd ..
```

6. **フロントエンドの依存関係インストール**
```bash
cd frontend
npm install
cd ..
```

7. **開発サーバーの起動**
```bash
# 両方のサーバーを同時に起動
npm run dev

# または個別に起動
npm run dev:backend  # バックエンド (http://localhost:3001)
npm run dev:frontend # フロントエンド (http://localhost:3000)
```

8. **アクセス**
ブラウザで http://localhost:3000 にアクセス

## 開発

### 利用可能なスクリプト

```bash
npm run dev          # 全サーバーを開発モードで起動
npm run build        # 全プロジェクトをビルド
npm run test         # 全テストを実行
npm run lint         # 全プロジェクトのリント
npm run format       # コードフォーマット
```

### ディレクトリ構造

詳細なプロジェクト構造は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ドキュメント

- [プロジェクト仕様書](./CLAUDE.md)
- [実装計画](./TODO.md)
- [APIドキュメント](./docs/api.md) (準備中)
- [セットアップガイド](./docs/setup.md) (準備中)

## テスト

```bash
# バックエンドのテスト
cd backend
npm test

# フロントエンドのテスト
cd frontend
npm test

# カバレッジ付きテスト
npm test -- --coverage
```

## ライセンス

MIT

## 参考リンク

- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
