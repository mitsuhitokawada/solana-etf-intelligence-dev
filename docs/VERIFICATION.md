# Verification record

- TypeScript strict check: required after final changes.
- API validation tests cover invalid price, HTTP errors, null ETF flow, independent provider failures, historical price points and cached repeated requests.
- Correlation tests cover UTC date matching, a known Pearson +1 example and a minimum sample guard.
- Live MCP retrieval confirmed SOL current price, 90-day price history, ETF history, DEX volume and descriptive correlation on 2026-10-10.
- Direct public Solana mainnet RPC request returned a 60-second performance sample on 2026-10-10. The official endpoint returned HTTP 403 from the hosted runtime. Switched to PublicNode, verifying the mainnet genesis hash before accepting samples. Hosted MCP retrieval successfully verified PublicNode mainnet performance samples on 2026-10-10.
- Native browser QA is unavailable in this environment. Visual rendering, click interactions and judge access have not been fully verified.
- “The composer is unavailable” is a known Extension UI message limitation, not an MCP data-fetch failure.
- This source snapshot is being published to the separate development GitHub repository. Side-track form submission is not completed.
