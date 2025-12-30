# AIチャットボット プロジェクト仕様書

## プロジェクト概要

### 目的
汎用的な対話型AIチャットボットを構築する。ユーザーが様々な質問や会話をAIと行い、その履歴を保存して後から参照できるWebアプリケーション。

### 対象ユーザー
単一ユーザー（個人利用）

### 主要機能
- Claude APIを使用したAIとの対話
- リアルタイムストリーミング応答
- 会話履歴の永続化
- 過去の会話の閲覧・検索

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS（推奨）
- **状態管理**: React Hooks / Context API
- **HTTPクライアント**: fetch API / axios

### バックエンド
- **ランタイム**: Node.js 18+
- **フレームワーク**: Express.js
- **言語**: TypeScript
- **ORM**: Prisma（推奨）
- **バリデーション**: zod

### データベース
- **RDBMS**: PostgreSQL 14+
- **マイグレーション**: Prisma Migrate

### AI API
- **プロバイダー**: Anthropic Claude API
- **モデル**: Claude 3.5 Sonnet（推奨）または最新のモデル
- **機能**: ストリーミングレスポンス対応

### 開発ツール
- **パッケージマネージャー**: npm / yarn / pnpm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **テストフレームワーク**: Jest + React Testing Library
- **型チェック**: TypeScript strict mode

## プロジェクト構成（モノレポ）

```
ai-chat/
├── README.md
├── CLAUDE.md                    # このファイル
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
├── .env.local                   # 環境変数（gitignore）
├── docker-compose.yml           # PostgreSQL用
│
├── frontend/                    # Next.jsアプリケーション
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── components/          # Reactコンポーネント
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── StreamingMessage.tsx
│   │   │   └── history/
│   │   │       ├── ConversationList.tsx
│   │   │       └── ConversationDetail.tsx
│   │   ├── lib/                 # ユーティリティ
│   │   │   ├── api.ts          # APIクライアント
│   │   │   └── types.ts        # 型定義
│   │   └── hooks/              # カスタムフック
│   │       └── useChat.ts
│   └── public/
│
├── backend/                     # Express API
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts            # エントリーポイント
│   │   ├── app.ts              # Expressアプリ設定
│   │   ├── config/
│   │   │   ├── database.ts     # DB接続設定
│   │   │   └── claude.ts       # Claude API設定
│   │   ├── routes/
│   │   │   ├── chat.routes.ts
│   │   │   └── conversation.routes.ts
│   │   ├── controllers/
│   │   │   ├── chat.controller.ts
│   │   │   └── conversation.controller.ts
│   │   ├── services/
│   │   │   ├── claude.service.ts      # Claude API連携
│   │   │   └── conversation.service.ts # 会話履歴管理
│   │   ├── models/             # Prismaスキーマ
│   │   └── middleware/
│   │       ├── errorHandler.ts
│   │       └── logger.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── tests/
│       └── unit/
│
└── docs/                        # ドキュメント
    ├── api.md                   # API仕様書
    └── setup.md                 # セットアップガイド
```

## 機能要件

### 1. チャット機能

#### 1.1 メッセージ送信
- ユーザーがテキストメッセージを入力してClaude APIに送信
- 送信時にローディング状態を表示
- 送信したメッセージはすぐにUI上に表示

#### 1.2 ストリーミング応答
- Claude APIからの応答をリアルタイムでストリーミング表示
- Server-Sent Events (SSE) を使用
- 応答の途中経過を逐次表示し、UXを向上

#### 1.3 会話コンテキスト
- 同一会話内の過去のメッセージをコンテキストとして維持
- 新しい会話を開始する機能
- 会話の途中からでもコンテキストを引き継ぐ

### 2. 会話履歴機能

#### 2.1 履歴の保存
- すべての会話をデータベースに自動保存
- 会話のメタデータ（タイトル、作成日時、更新日時）を記録
- 各メッセージ（ユーザー/アシスタント）をタイムスタンプ付きで保存

#### 2.2 履歴の閲覧
- 過去の会話一覧を時系列で表示
- 各会話の最初のメッセージや要約をプレビュー表示
- 特定の会話を選択して全メッセージを表示

#### 2.3 履歴の検索（オプション）
- キーワードで会話を検索する機能（将来的に実装可能）

### 3. UI/UX要件

#### 3.1 レスポンシブデザイン
- モバイル、タブレット、デスクトップに対応
- 読みやすいフォントサイズとレイアウト

#### 3.2 操作性
- 直感的なインターフェース
- Enterキーでメッセージ送信（Shift+Enterで改行）
- メッセージのコピー機能
- スクロール位置の自動調整

#### 3.3 視覚的フィードバック
- ローディングインジケーター
- エラーメッセージの明確な表示
- ストリーミング中の視覚的効果

## API設計

### エンドポイント一覧

#### チャット関連

```
POST /api/chat/message
説明: メッセージを送信し、Claude APIからの応答をストリーミングで返す
リクエスト:
{
  "conversationId": "string | null",  // null の場合は新規会話
  "message": "string",
  "model": "string"  // 例: "claude-3-5-sonnet-20241022"
}
レスポンス: Server-Sent Events (text/event-stream)
```

```
POST /api/chat/conversations
説明: 新しい会話を作成
リクエスト:
{
  "title": "string | null"  // オプション、nullの場合は自動生成
}
レスポンス:
{
  "id": "string",
  "title": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### 会話履歴関連

```
GET /api/conversations
説明: すべての会話一覧を取得
クエリパラメータ:
  - limit: number (デフォルト: 50)
  - offset: number (デフォルト: 0)
レスポンス:
{
  "conversations": [
    {
      "id": "string",
      "title": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "messageCount": number,
      "preview": "string"  // 最初のメッセージの抜粋
    }
  ],
  "total": number
}
```

```
GET /api/conversations/:id
説明: 特定の会話の詳細とすべてのメッセージを取得
レスポンス:
{
  "id": "string",
  "title": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "messages": [
    {
      "id": "string",
      "role": "user" | "assistant",
      "content": "string",
      "createdAt": "datetime"
    }
  ]
}
```

```
DELETE /api/conversations/:id
説明: 会話を削除
レスポンス:
{
  "success": boolean,
  "message": "string"
}
```

```
PATCH /api/conversations/:id
説明: 会話のタイトルを更新
リクエスト:
{
  "title": "string"
}
レスポンス:
{
  "id": "string",
  "title": "string",
  "updatedAt": "datetime"
}
```

### エラーレスポンス形式

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "any | null"
  }
}
```

### HTTPステータスコード
- 200: 成功
- 201: 作成成功
- 400: リクエストが不正
- 404: リソースが見つからない
- 500: サーバーエラー
- 503: 外部API（Claude）が利用不可

## データベース設計

### Prismaスキーマ

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Conversation {
  id        String    @id @default(cuid())
  title     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]

  @@index([createdAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           Role
  content        String       @db.Text
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}

enum Role {
  USER
  ASSISTANT
}
```

### マイグレーション戦略
- Prisma Migrateを使用
- 開発環境: `prisma migrate dev`
- 本番環境（将来的に）: `prisma migrate deploy`

## 開発ガイドライン

### コーディング規約

#### TypeScript
- strict modeを有効化
- `any`型の使用は最小限に（型定義が困難な場合のみ）
- 明示的な型注釈を推奨（特に関数の引数と戻り値）
- interfaceとtypeの使い分け:
  - オブジェクトの形状定義: interface
  - ユニオン型、交差型: type

#### 命名規則
- ファイル名: kebab-case（例: `chat-interface.tsx`）
- コンポーネント名: PascalCase（例: `ChatInterface`）
- 関数/変数名: camelCase（例: `sendMessage`）
- 定数: UPPER_SNAKE_CASE（例: `API_BASE_URL`）
- 型/インターフェース: PascalCase（例: `Message`, `ConversationResponse`）

#### コンポーネント設計
- 単一責任の原則を守る
- propsの型を明示的に定義
- 再利用可能なコンポーネントは`components/`に配置
- ビジネスロジックはカスタムフックやサービスに分離

#### エラーハンドリング
- try-catchで例外を適切にキャッチ
- エラーメッセージはユーザーフレンドリーに
- エラーの詳細はコンソールにログ出力
- 外部API呼び出しは必ずエラーハンドリングを実装

#### ロギング
- 重要な処理の開始・終了をログ出力
- エラー発生時はスタックトレースを含める
- 本番環境では機密情報をログに出力しない
- 開発環境: console.log/error
- 本番環境（将来的に）: Winston等のロガー使用を検討

### 環境変数

```.env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_chat?schema=public"

# Claude API
ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
CLAUDE_MAX_TOKENS=4096

# Server
PORT=3001
NODE_ENV=development

# Frontend (Next.js)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### セキュリティ要件

#### API Key管理
- Claude APIキーは環境変数で管理
- `.env`ファイルは`.gitignore`に追加
- フロントエンドから直接Claude APIを呼ばない（必ずバックエンド経由）

#### データ保護
- ユーザー入力のサニタイゼーション（XSS対策）
- SQLインジェクション対策（Prismaが自動で対応）
- CORS設定を適切に行う

#### エラー情報
- 本番環境ではスタックトレースを公開しない
- エラーレスポンスに機密情報を含めない

### パフォーマンス要件

#### レスポンスタイム
- API応答: 通常時は500ms以内（Claude API除く）
- ストリーミング開始: 1秒以内
- 画面遷移: 300ms以内

#### データベース
- 適切なインデックスを設定
- N+1問題を避ける
- ページネーションを実装

#### フロントエンド
- 画像の最適化
- 不要な再レンダリングを避ける
- コードスプリッティング

## テスト要件

### 対象範囲
基本的なユニットテストを実装

### バックエンドテスト

#### 必須テスト
- Claude APIサービスのモックテスト
- 会話サービスのCRUD操作テスト
- APIエンドポイントの基本動作テスト

#### テストフレームワーク
- Jest
- Supertest（APIテスト用）

#### テスト実装の原則（CLAUDE.mdの規約を遵守）
- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)`のような意味のないアサーションは禁止
- 各テストケースは具体的な入力と期待される出力を検証
- モックは必要最小限に留め、実際の動作に近い形でテスト
- **ハードコーディングの防止**:
  - テストを通すためだけのハードコードは絶対に禁止
  - 本番コードに`if (testMode)`のような条件分岐を入れない
  - テスト用の特別な値（マジックナンバー）を本番コードに埋め込まない
  - 環境変数や設定ファイルを使用して、テスト環境と本番環境を適切に分離
- Red-Green-Refactorサイクルを実践
- 境界値、異常系、エラーケースも必ずテスト
- カバレッジだけでなく、実際の品質を重視
- テストケース名は何をテストしているか明確に記述

### フロントエンドテスト

#### 必須テスト
- 主要コンポーネントのレンダリングテスト
- ユーザーインタラクションのテスト
- カスタムフックのテスト

#### テストフレームワーク
- Jest
- React Testing Library

### テストコマンド
```bash
# バックエンド
cd backend
npm test

# フロントエンド
cd frontend
npm test

# カバレッジ
npm test -- --coverage
```

## デプロイメント

### 開発環境（ローカル）

#### 前提条件
- Node.js 18+
- PostgreSQL 14+
- npm/yarn/pnpm
- Claude APIキー

#### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd ai-chat
```

2. **依存関係のインストール**
```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

3. **PostgreSQLのセットアップ**
```bash
# Docker Composeを使用する場合
cd ..
docker-compose up -d
```

4. **環境変数の設定**
```bash
# ルートディレクトリに.env.localを作成
cp .env.example .env.local
# エディタで.env.localを編集し、必要な値を設定
```

5. **データベースマイグレーション**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

6. **開発サーバーの起動**
```bash
# バックエンド（ターミナル1）
cd backend
npm run dev

# フロントエンド（ターミナル2）
cd frontend
npm run dev
```

7. **アクセス**
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 本番環境
現時点では本番環境へのデプロイは想定していない。将来的にデプロイする場合は、以下を検討:
- Vercel（Next.js）
- Railway/Render（Express + PostgreSQL）
- Docker Compose

## 今後の拡張可能性

### フェーズ2以降で検討可能な機能
- マルチユーザー対応とユーザー認証
- 会話の検索機能
- 会話のエクスポート（JSON/Markdown）
- ファイルアップロード対応（画像解析）
- レート制限の実装
- 会話のフォルダ分け・タグ付け
- ダークモード対応
- 音声入力/出力
- 複数のAI API対応（OpenAI, Gemini等）

## 参考リンク

- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 変更履歴

- 2025-12-30: 初版作成
