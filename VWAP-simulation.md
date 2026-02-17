# VWAP simulation

This is an end-to-end playbook to build a realistic VWAP simulation on testnet and validate a risk engine from frontend to smart contracts. It is designed to be **in-depth and doable** for a hackathon team.

---

## 1) Objective, non-objectives, and success criteria

## Objective
Build a demo where users create and execute VWAP orders with real testnet transactions, realistic market behavior, and measurable risk controls (not mocked frontend state).

## Non-objectives
- Building a production-grade matching engine.
- Integrating every external DEX on day one.
- High-frequency optimization.

## Success criteria
- Every major action (`create`, `execute`, `cancel`, `claim`) is an on-chain tx.
- Frontend source of truth is chain state (no local fake order state).
- Price movement and slippage come from real liquidity and market flow.
- Risk engine checks are triggered and verifiable in tests and demo scenarios.
- Demo includes tx hashes, event logs, and reconciled balances.

---

## 2) Reference architecture

1. **Contracts**
   - `MockUSDC` / `MockMON` (or equivalent)
   - `SimpleAMM` (x*y=k, fee)
   - `VWAPEngine` (order lifecycle + risk checks)
   - Optional `ExecutionAdapter` if you may switch venue later

2. **Bots**
   - **Keeper bot**: executes eligible slices
   - **Flow bot**: random external trades to move market

3. **Frontend**
   - Chain-first order management
   - Risk dashboard + execution feed
   - Tx hash + status links

4. **Ops**
   - Logs + basic metrics
   - Runbooks + fallback procedures

---

## 3) Contract design (realistic but hackathon-safe)

## Core contracts
- `MockERC20`: mint faucet for test wallets.
- `SimpleAMM`:
  - `addLiquidity(tokenA, tokenB, amountA, amountB)`
  - `quoteOut(tokenIn, amountIn)`
  - `swapExactIn(tokenIn, amountIn, minOut, recipient)`
  - fee in bps
- `VWAPEngine`:
  - `createOrder(...)`
  - `executeSlice(orderId, minOut)`
  - `cancelOrder(orderId)`
  - `claim(orderId)` (optional depending on settlement model)

## Order model (recommended)
- `id`
- `owner`
- `tokenIn`, `tokenOut`
- `totalIn`, `remainingIn`
- `numSlices`, `executedSlices`
- `startTime`, `intervalSec`, `nextExecTime`
- `maxSlippageBps`
- `maxImpactBps` (recommended)
- `deadline`
- `status` (`ACTIVE`, `COMPLETED`, `CANCELLED`)

## Risk checks in `executeSlice`
- order exists and active
- `block.timestamp >= nextExecTime`
- not past `deadline`
- computed slice amount within bounds
- slippage bound: `actualOut >= minOut`
- impact bound (optional but useful)
- non-reentrant token movement

## Mandatory events
- `OrderCreated`
- `SliceExecuted`
- `OrderCancelled`
- `OrderCompleted`
- Optional `RiskCheckFailed(reason)`

## Security essentials
- `ReentrancyGuard`
- CEI ordering
- `SafeERC20`
- explicit revert reasons
- `Pausable`

---

## 4) Frontend simulation model (real txs only)

## Do this
- `readContract` for all order/slice/balance views.
- `writeContract` for create/execute/cancel.
- Display pending/success/fail states and tx hashes.
- Refresh should preserve state from chain.

## Do not do this
- No localStorage as source of truth for order progression.
- No simulated completion without tx confirmation.
- No fake timers that imply execution happened if chain tx failed.

## Required UI modules
- **Create order form**: pair, size, slices, interval, slippage, deadline
- **Order board**: remaining size, next execution time, status
- **Risk panel**: current quote/slippage/impact estimate
- **Execution feed**: event-driven timeline with tx links
- **Balance panel**: before/after token amounts

---

## 5) Market realism strategy on testnet

To avoid fake numbers, make market behavior explicit.

## 5.1 Controlled liquidity
- Seed AMM with baseline liquidity.
- Use scripts to reduce/increase liquidity for scenario testing.

## 5.2 Flow bot behavior
- Random trade every 10-30s.
- Random direction and notional size.
- Volatility regimes:
  - normal
  - stressed
  - illiquid

## 5.3 Why this is realistic enough
- Real swaps move reserves and prices.
- Your engine’s slippage/impact checks react to actual state.
- Execution quality becomes measurable and explainable.

---

## 6) Keeper bot design

## Responsibilities
- watch for active orders
- detect slice eligibility by `nextExecTime`
- compute `minOut` from quote and risk config
- submit execute tx
- retry transient failures with capped attempts

## Operational rules
- never bypass user risk constraints
- emit structured logs with `orderId`, `slice`, `txHash`
- support pause mode

---

## 7) Risk engine test plan (must pass before demo)

## 7.1 Unit tests
- create-order input validation
- schedule boundary checks
- slippage pass/fail
- deadline fail
- cancel/refund correctness
- event emission assertions

## 7.2 Integration tests
- Engine + AMM path
- Keeper execution loop
- concurrent orders
- decimal mismatch handling

## 7.3 Scenario tests (demo realism)
1. Baseline stable market
2. Volatility spike
3. Liquidity drought
4. Adverse trend drift
5. Keeper interruption/recovery
6. Invalid execution attempts

For each scenario, capture:
- completion rate
- rejection reason breakdown
- effective average execution price
- slippage/impact stats
- tx evidence

---

## 8) Metrics and acceptance thresholds

## Suggested metrics
- order completion rate
- avg slippage (bps)
- risk rejection count by reason
- benchmark delta vs TWAP/VWAP proxy
- gas per slice/order

## Suggested acceptance thresholds
- accounting mismatch: **0**
- baseline failure rate: below target (define upfront)
- stress mode risk rejections: above minimum trigger threshold (proves control)
- no stuck funds after cancel/complete

---

## 9) Complete start-to-finish execution plan

## Phase A (Day 1): Core chain path
1. Deploy mocks and AMM.
2. Seed liquidity.
3. Deploy VWAPEngine.
4. Wire frontend create order on-chain.
5. Wire execute slice on-chain.
6. Verify balances and events.

**Exit criteria:** One full order can be created and completed with real txs.

## Phase B (Day 2): Risk realism
1. Add slippage + deadline + impact checks.
2. Add flow bot.
3. Add keeper execution loop.
4. Add risk panel and tx feed in frontend.
5. Run baseline and volatility scenarios.

**Exit criteria:** Risk checks trigger correctly under stress.

## Phase C (Day 3): Demo hardening
1. Add runbooks and fallback controls.
2. Dry-run demo script twice.
3. Capture screenshots/tx list/metrics.
4. Final pass on UX and error states.

**Exit criteria:** Demo can be run by any teammate with runbook only.

---

## 10) Concrete technical checklist

## Contracts
- [ ] Implement `MockERC20` faucet tokens
- [ ] Implement `SimpleAMM` quoting + swap
- [ ] Implement `VWAPEngine` lifecycle
- [ ] Add risk checks + pause controls
- [ ] Add events for every state transition
- [ ] Add comprehensive tests

## Bots
- [ ] Keeper bot (schedule + execute + retry)
- [ ] Flow bot (random market activity)
- [ ] Scenario mode config (stable/stress/illiquid)
- [ ] Structured logs

## Frontend
- [ ] Remove local fake order progression
- [ ] Integrate wallet tx flow for create/execute/cancel
- [ ] Add tx status and explorer links
- [ ] Add risk panel and event timeline
- [ ] Add scenario selector (optional but useful)

## Operations
- [ ] Deployment scripts
- [ ] Environment templates
- [ ] Incident runbooks
- [ ] Demo script and fallback plan

---

## 11) Non-technical plan for team execution

## Roles
- Protocol engineer: contracts + tests
- Infra engineer: bots + deployment + monitoring
- Frontend engineer: chain integration + UX
- Demo operator: rehearses and runs live script

## Daily checkpoints
- Is frontend chain-first now?
- Did risk checks fire in at least one stress scenario today?
- Are tx hashes and logs captured for replay?
- Is fallback demo path tested?

---

## 12) Demo-day script (8-10 minutes)

1. Connect wallet and show starting balances.
2. Create order (show tx hash).
3. Start keeper and execute first slices.
4. Trigger stress mode (volatility/liquidity shift).
5. Show risk engine rejecting unsafe execution.
6. Resume normal mode and complete or cancel.
7. Show final balances, feed, and metric summary.

---

## 13) Common failure modes + mitigations

- **RPC flaky** -> fallback endpoint + retry/backoff
- **keeper down** -> manual execute button + secondary keeper
- **market too calm** -> force volatility regime in flow bot
- **unexpected reverts** -> explicit error decoding + runbook mapping
- **demo drift** -> deterministic seed mode for repeatability

---

## 14) Final ship gate

Do not call this complete unless:
- [ ] no fake local order engine remains
- [ ] all primary actions are real txs
- [ ] risk engine is demonstrably tested under stress
- [ ] accounting reconciles exactly
- [ ] team can run demo from runbook without ad-hoc fixes

