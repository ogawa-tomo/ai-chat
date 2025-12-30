# AIチャットボット 実行計画

## 概要
この文書は、CLAUDE.mdの仕様に基づいたAIチャットボットアプリケーションの実装計画です。

---

## フェーズ1: プロジェクトセットアップ

### 1.1 基本構成の作成
- [ ] ルートディレクトリにpackage.json作成（ワークスペース設定）
- [ ] .gitignore作成（node_modules, .env, dist等）
- [ ] .env.example作成（環境変数のテンプレート）
- [ ] README.md作成（プロジェクト概要とセットアップ手順）
- [ ] docker-compose.yml作成（PostgreSQL用）
- [ ] ルートtsconfig.json作成（共通設定）

### 1.2 ディレクトリ構造の作成
- [ ] frontend/ディレクトリ作成
- [ ] backend/ディレクトリ作成
- [ ] docs/ディレクトリ作成

---

## フェーズ2: バックエンド構築

### 2.1 Express.jsプロジェクトのセットアップ
- [ ] backend/package.json作成
- [ ] 必要な依存関係のインストール
  - express
  - typescript, @types/node, @types/express
  - ts-node, tsx（開発用）
  - dotenv
  - cors, @types/cors
  - zod（バリデーション）
  - @anthropic-ai/sdk（Claude API）
- [ ] backend/tsconfig.json作成
- [ ] backend/src/ディレクトリ構造作成
- [ ] backend/.env.example作成

### 2.2 Prismaセットアップ
- [ ] Prismaインストール（prisma, @prisma/client）
- [ ] backend/prisma/schema.prisma作成
- [ ] Conversationモデル定義
- [ ] Messageモデル定義
- [ ] Roleエラム定義
- [ ] prisma migrate dev実行（初回マイグレーション）
- [ ] prisma generateでクライアント生成

### 2.3 基本設定ファイルの作成
- [ ] backend/src/config/database.ts（Prismaクライアント設定）
- [ ] backend/src/config/claude.ts（Claude API設定）
- [ ] backend/src/middleware/errorHandler.ts
- [ ] backend/src/middleware/logger.ts

### 2.4 サービス層の実装
- [ ] backend/src/services/claude.service.ts
  - [ ] Claude APIクライアントの初期化
  - [ ] メッセージ送信とストリーミング応答の実装
  - [ ] エラーハンドリング
- [ ] backend/src/services/conversation.service.ts
  - [ ] 会話の作成
  - [ ] 会話一覧の取得
  - [ ] 会話詳細の取得
  - [ ] 会話の更新
  - [ ] 会話の削除
  - [ ] メッセージの保存

### 2.5 コントローラーの実装
- [ ] backend/src/controllers/chat.controller.ts
  - [ ] メッセージ送信エンドポイント（ストリーミング対応）
  - [ ] 新規会話作成エンドポイント
- [ ] backend/src/controllers/conversation.controller.ts
  - [ ] 会話一覧取得エンドポイント
  - [ ] 会話詳細取得エンドポイント
  - [ ] 会話更新エンドポイント
  - [ ] 会話削除エンドポイント

### 2.6 ルーティングの実装
- [ ] backend/src/routes/chat.routes.ts
- [ ] backend/src/routes/conversation.routes.ts

### 2.7 Expressアプリケーションの構築
- [ ] backend/src/app.ts
  - [ ] Express初期化
  - [ ] ミドルウェア設定（CORS, JSON parser, logger）
  - [ ] ルート登録
  - [ ] エラーハンドラー登録
- [ ] backend/src/index.ts（エントリーポイント）
  - [ ] データベース接続確認
  - [ ] サーバー起動

### 2.8 型定義の作成
- [ ] backend/src/types/api.ts（APIリクエスト/レスポンス型）
- [ ] backend/src/types/models.ts（ドメインモデル型）

### 2.9 バックエンドテストの実装
- [ ] Jestとテスト関連パッケージのインストール
- [ ] jest.config.js作成
- [ ] backend/tests/unit/services/claude.service.test.ts
  - [ ] Claude APIモックの作成
  - [ ] メッセージ送信のテスト
  - [ ] エラーハンドリングのテスト
- [ ] backend/tests/unit/services/conversation.service.test.ts
  - [ ] 会話CRUD操作のテスト
  - [ ] メッセージ保存のテスト
- [ ] backend/tests/integration/api.test.ts
  - [ ] 各エンドポイントの基本動作テスト
  - [ ] エラーケースのテスト

---

## フェーズ3: フロントエンド構築

### 3.1 Next.jsプロジェクトのセットアップ
- [ ] Next.js 14+ (App Router)のインストール
- [ ] frontend/package.json作成
- [ ] Tailwind CSSのインストールと設定
- [ ] frontend/tsconfig.json作成
- [ ] frontend/next.config.js作成
- [ ] frontend/.env.example作成

### 3.2 基本レイアウトの作成
- [ ] frontend/src/app/layout.tsx（ルートレイアウト）
- [ ] frontend/src/app/page.tsx（ホームページ）
- [ ] frontend/src/app/globals.css（グローバルスタイル）

### 3.3 型定義とユーティリティ
- [ ] frontend/src/lib/types.ts
  - [ ] Message型
  - [ ] Conversation型
  - [ ] APIレスポンス型
- [ ] frontend/src/lib/api.ts
  - [ ] APIクライアントのベース設定
  - [ ] エラーハンドリング

### 3.4 カスタムフックの実装
- [ ] frontend/src/hooks/useChat.ts
  - [ ] メッセージ送信
  - [ ] ストリーミング応答の受信
  - [ ] 会話状態管理
  - [ ] エラーハンドリング

### 3.5 チャット画面のコンポーネント実装
- [ ] frontend/src/app/chat/page.tsx（チャットページ）
- [ ] frontend/src/components/chat/ChatInterface.tsx
  - [ ] メッセージ一覧とメッセージ入力を統合
  - [ ] 新規会話の開始
- [ ] frontend/src/components/chat/MessageList.tsx
  - [ ] メッセージ一覧の表示
  - [ ] 自動スクロール
- [ ] frontend/src/components/chat/MessageInput.tsx
  - [ ] テキスト入力フォーム
  - [ ] Enter/Shift+Enterのハンドリング
  - [ ] 送信ボタン
- [ ] frontend/src/components/chat/StreamingMessage.tsx
  - [ ] ストリーミング中のメッセージ表示
  - [ ] ローディングインジケーター

### 3.6 履歴画面のコンポーネント実装
- [ ] frontend/src/app/history/page.tsx（履歴ページ）
- [ ] frontend/src/components/history/ConversationList.tsx
  - [ ] 会話一覧の表示
  - [ ] ページネーション
  - [ ] プレビュー表示
- [ ] frontend/src/components/history/ConversationDetail.tsx
  - [ ] 会話の詳細表示
  - [ ] タイトル編集
  - [ ] 会話削除

### 3.7 共通コンポーネントの実装
- [ ] frontend/src/components/ui/Button.tsx
- [ ] frontend/src/components/ui/Input.tsx
- [ ] frontend/src/components/ui/Loading.tsx
- [ ] frontend/src/components/ui/ErrorMessage.tsx

### 3.8 レスポンシブデザインの調整
- [ ] モバイル表示の最適化
- [ ] タブレット表示の最適化
- [ ] デスクトップ表示の最適化

### 3.9 フロントエンドテストの実装
- [ ] Jest、React Testing Libraryのインストール
- [ ] jest.config.js作成
- [ ] frontend/src/components/chat/ChatInterface.test.tsx
  - [ ] レンダリングテスト
  - [ ] メッセージ送信のテスト
- [ ] frontend/src/components/chat/MessageList.test.tsx
  - [ ] メッセージ表示のテスト
- [ ] frontend/src/hooks/useChat.test.ts
  - [ ] フックのロジックテスト

---

## フェーズ4: 統合とテスト

### 4.1 環境変数の設定
- [ ] .env.local作成（ルートディレクトリ）
- [ ] Claude APIキーの設定
- [ ] データベースURLの設定
- [ ] その他の環境変数設定

### 4.2 PostgreSQLのセットアップ
- [ ] Docker ComposeでPostgreSQLを起動
- [ ] データベースの接続確認
- [ ] マイグレーション実行確認

### 4.3 統合テスト
- [ ] バックエンドの起動確認
- [ ] フロントエンドの起動確認
- [ ] フロントエンドからバックエンドへの接続確認
- [ ] チャット機能の動作確認
  - [ ] メッセージ送信
  - [ ] ストリーミング応答
  - [ ] 会話の保存
- [ ] 履歴機能の動作確認
  - [ ] 会話一覧表示
  - [ ] 会話詳細表示
  - [ ] 会話の編集・削除

### 4.4 エラーケースのテスト
- [ ] Claude API接続エラーのハンドリング
- [ ] データベース接続エラーのハンドリング
- [ ] 不正なリクエストのハンドリング
- [ ] ネットワークエラーのハンドリング

### 4.5 パフォーマンス確認
- [ ] APIレスポンスタイムの測定
- [ ] ストリーミング開始時間の測定
- [ ] 画面遷移速度の確認
- [ ] 大量のメッセージでの動作確認

---

## フェーズ5: ドキュメント整備

### 5.1 APIドキュメント
- [ ] docs/api.md作成
  - [ ] エンドポイント一覧
  - [ ] リクエスト/レスポンス例
  - [ ] エラーコード一覧

### 5.2 セットアップガイド
- [ ] docs/setup.md作成
  - [ ] 前提条件
  - [ ] インストール手順
  - [ ] 環境変数の設定
  - [ ] データベースのセットアップ
  - [ ] 起動方法

### 5.3 README更新
- [ ] プロジェクト概要
- [ ] 技術スタック
- [ ] セットアップ手順
- [ ] 使用方法
- [ ] ライセンス情報

---

## フェーズ6: 最終確認とクリーンアップ

### 6.1 コード品質チェック
- [ ] ESLintの設定と実行
- [ ] Prettierの設定と実行
- [ ] TypeScriptの型エラーチェック
- [ ] 未使用コードの削除

### 6.2 セキュリティチェック
- [ ] APIキーが環境変数で管理されているか確認
- [ ] .gitignoreに.envが含まれているか確認
- [ ] フロントエンドから直接Claude APIを呼んでいないか確認
- [ ] CORS設定が適切か確認

### 6.3 テストカバレッジ確認
- [ ] バックエンドのテストカバレッジ確認
- [ ] フロントエンドのテストカバレッジ確認
- [ ] 重要な機能がテストされているか確認

### 6.4 最終動作確認
- [ ] 全機能の動作確認（E2Eテスト）
- [ ] 異なるブラウザでの動作確認
- [ ] モバイル端末での動作確認

---

## オプション機能（フェーズ7以降）

### 将来的に追加可能な機能
- [ ] 会話の検索機能
- [ ] 会話のエクスポート機能（JSON/Markdown）
- [ ] ダークモード対応
- [ ] ファイルアップロード対応
- [ ] 会話のフォルダ分け・タグ付け
- [ ] レート制限の実装
- [ ] マルチユーザー対応

---

## 実装の優先順位

### 最優先（MVP）
1. プロジェクトセットアップ（フェーズ1）
2. バックエンドの基本機能（フェーズ2.1〜2.7）
3. フロントエンドの基本機能（フェーズ3.1〜3.6）
4. 統合テスト（フェーズ4.1〜4.3）

### 高優先
1. テストの実装（フェーズ2.9、3.9）
2. エラーハンドリングの強化（フェーズ4.4）
3. ドキュメント整備（フェーズ5）

### 中優先
1. パフォーマンス確認（フェーズ4.5）
2. コード品質チェック（フェーズ6.1）
3. セキュリティチェック（フェーズ6.2）

### 低優先
1. オプション機能（フェーズ7）

---

## 見積もり

### 開発期間（目安）
- フェーズ1: 1日
- フェーズ2: 3-4日
- フェーズ3: 3-4日
- フェーズ4: 2-3日
- フェーズ5: 1日
- フェーズ6: 1日

**合計: 約11-14日**（1人での作業を想定）

---

## 注意事項

1. **環境変数の管理**
   - Claude APIキーは絶対に.gitにコミットしない
   - .env.exampleのみをコミット

2. **テストの品質**
   - CLAUDE.mdのテスト規約を厳守
   - ハードコーディングは絶対に禁止
   - 実際の機能を検証する意味のあるテストのみ実装

3. **段階的な開発**
   - 各フェーズを完了してから次に進む
   - 動作確認を頻繁に行う
   - 問題が発生したら早期に対処

4. **ドキュメント**
   - コードを書きながらドキュメントも更新
   - 重要な決定事項は記録する

---

最終更新: 2025-12-31
