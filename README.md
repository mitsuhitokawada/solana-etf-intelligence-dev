# Solana ETF Intelligence — Live Development Version

A research prototype connecting US Solana ETF flows, SOL price returns and onchain activity, with live data exposed to ChatGPT through a hosted MCP server and Plugin Extension.

## Features
- SOL current price and 90-day daily history from CoinGecko; 7/30/90-day charts.
- US Solana ETF net flows and net assets from SoSoValue; daily flow chart.
- Solana DEX volume from DefiLlama (all traded tokens, not SOL-only).
- Direct Solana mainnet RPC performance samples via PublicNode, with mainnet genesis verification and vote/non-vote counts.
- Descriptive Pearson correlation between ETF flows and matched UTC daily SOL returns; dates, sample size and limits are explicit.
- Factual executive summary computed from numbers.
- MCP tools: `get_market_prices`, `open_market_panel`, `fetch_market_prices`.

## Demo and submission materials
- [English judge demo](https://solana-etf-intelligence-dev.tinybee3.chatgpt.site/review) — currently owner-private; external judge access is not enabled.
- [Submission draft](docs/SUBMISSION.md)
- [English demo script](docs/DEMO_SCRIPT.md)
- [Verification record](docs/VERIFICATION.md)
- [Original Colosseum project](https://colosseum.com/arena/projects/solana-etf-intelligence)

The [original public demo](https://mitsuhitokawada.github.io/solana-etf-intelligence-demo/) uses simulated data and remains unchanged. This repository contains the separate live-data development version.

## Run and verify
Node.js 22.13+ and pnpm (see package.json) are required.

```sh
pnpm install
node scripts/verify-data.mjs
pnpm exec tsc --noEmit
pnpm build
```

Configure `COINGECKO_DEMO_API_KEY` and `SOSOVALUE_API_KEY` as server-only secrets in Sites. See [.env.example](.env.example). Never place keys in browser code or commit them.

## Architecture and access
Sites hosts the server and MCP endpoint; the browser calls `/api/prices`. ChatGPT uses the MCP endpoint at `/mcp`. The English judge UI is `/review`; the Japanese UI is `/panel`.

This snapshot targets an owner-private Sites deployment. The shared read-only market-data endpoint relies on Sites dispatch access controls for visitor/service authentication. If deploying elsewhere, supply the equivalent access control before exposing the API. The Sites source repository and this GitHub snapshot are separate; automatic GitHub synchronization is not configured.

## Limitations
Correlation is descriptive over a short sample, not a causal model or investment forecast. UTC price windows differ from US ETF trading sessions. DEX volume is not net inflow. RPC samples are not daily transactions or unique users.

No onchain program deployment, transaction execution, active-address aggregation or OpenAI API insight generation is implemented. ChatGPT can read the data through MCP; global Extension message sending can fail with “The composer is unavailable.” A copyable analysis prompt is provided.

Provider redistribution terms, side-track eligibility and external judge access require confirmation before final submission. Public source code does not imply a publicly accessible hosted application.

## Verification
Live MCP retrieval succeeded for price, price history, ETF flows, DEX volume, correlation and PublicNode mainnet performance on 2026-10-10. TypeScript and data validation tests passed. Browser visual QA is not completed in this environment.

## 日本語
既存のハッカソン提出デモを保持した、実データ連携の開発版です。秘密鍵は公開していません。英語画面・提出説明・デモ台本を含みます。ハッカソンへの追加応募はまだ完了していません。
