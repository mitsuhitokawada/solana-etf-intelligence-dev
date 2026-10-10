# Submission draft — Superteam Japan x enXross side track

## Project name
Solana ETF Intelligence

## Description
Solana ETF Intelligence connects institutional demand with onchain activity. It combines US Solana ETF net flows from SoSoValue, SOL price history from CoinGecko, Solana DEX volume from DefiLlama, and recent network performance sampled directly from Solana mainnet RPC. Users can inspect source timestamps, price and flow charts, and a reproducible comparison between ETF net flows and SOL daily returns.

A hosted MCP server exposes the same live data to ChatGPT through an installed Plugin Extension. ChatGPT can retrieve the snapshot and explain the observations in conversation. The dashboard's executive summary is computed from numeric data; it is not an OpenAI API-generated narrative.

The original Colosseum submission is a simulated-data prototype. This separate development version adds live sources and descriptive correlation without modifying that demo.

## Value proposition
ETF dashboards show institutional flows; onchain dashboards show activity. We connect the two and expose the observations to conversational analysis, with explicit dates, definitions and limits. Initial users are analysts, research teams and Solana investors. A possible business model is a research subscription and an MCP data service; willingness to pay is not yet validated.

## Methodology
Match ETF trading date D to the SOL percentage price change between D 00:00 UTC and D+1 00:00 UTC. Compute Pearson correlation only with at least 10 valid matched dates. Display the actual period and n. The UTC window differs from the US trading session; this prototype does not estimate causal effects or statistical significance. Do not present correlation as evidence that ETF flows caused price changes.

DEX volume covers all tokens across tracked Solana DEXs. It is not net capital inflow. Mainnet RPC samples are short performance windows, not daily transactions or active addresses.

## Existing project links
- Colosseum: https://colosseum.com/arena/projects/solana-etf-intelligence
- Original public demo: https://mitsuhitokawada.github.io/solana-etf-intelligence-demo/
- Original source: https://github.com/mitsuhitokawada/solana-etf-intelligence-demo
- Original pitch: https://youtu.be/c8sRsqOBxtw
- Original demo video: https://youtu.be/w1v6fXs1E7E

## Development judge demo
https://solana-etf-intelligence-dev.tinybee3.chatgpt.site/review
Public judge demo. Unauthenticated page access verified on 2026-10-10. Do not claim the original video demonstrates these new features.

## Required before submission
- Confirm Colosseum submission country is Japan.
- Confirm applicant residency/KYC eligibility.
- Confirm read-only analytics with direct Solana RPC qualifies for “runs on Solana”; do not assert that adding RPC alone guarantees eligibility.
- Publish current development source in a separate GitHub repository; do not reuse the original source link as evidence for this version.
- Review provider redistribution terms for any use beyond this prototype. Judge page access has been made public.
- Record the current English demo/pitch or provide updated pitch materials.
- Actual side-track form submission has not been performed.

## Known limitations
No deployed onchain program, wallet transaction execution, active-address aggregation, daily network transaction aggregation, or OpenAI API insight generation. Global Extension message sending can fail with “The composer is unavailable”; MCP data retrieval works, and the judge page provides a copyable prompt.
