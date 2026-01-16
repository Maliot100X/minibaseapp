import React from 'react';
import ReactMarkdown from 'react-markdown';

const markdown = `
# Signal Miner Whitepaper

Signal Miner is a Base Sepolia mini app that lets you mine off-chain points, convert them into a real ERC-20 token called SIGNAL, stake for multipliers, and boost Farcaster posts using on-chain payments.

All transactions run on Base Sepolia (chainId 84532) and use your active wallet (Farcaster custody, Base embedded, or MetaMask).

## 1. Tokenomics

Signal Miner tracks two balances:

- POINTS  
  Off-chain balances held in the app store. You earn points by mining and completing tasks. Points never leave your device and are only meaningful inside Signal Miner.

- SIGNAL  
  An ERC-20 token deployed on Base Sepolia. The app treats SIGNAL as the primary on-chain asset for staking and swap output.

Conversion between the two is fixed inside the app:

- 1,000 POINTS can be swapped for 100 SIGNAL
- SIGNAL is sent from a treasury wallet on Base Sepolia directly to your active wallet
- The app checks that you have enough points and that the treasury has enough SIGNAL before sending any transaction

There is no synthetic or custodial token. When you see SIGNAL in your wallet, it is held by your wallet address on Base Sepolia.

## 2. Mining and Staking

### Mining sessions

Mining produces POINTS only. It does not directly mint or move SIGNAL.

- You start a session manually from the Miner tab
- Sessions last up to 24 hours and then auto-stop
- The app shows a live countdown, status badge, and progress bar

During an active session, points accumulate using a deterministic formula:

- points = elapsedSeconds × (100 / 86400) × tierMultiplier × stakeMultiplier × boostMultiplier

Key properties:

- No background auto-mining: you must press START MINING
- Reads are available without a wallet; writes require an active wallet on Base Sepolia
- When the timer expires, the session stops and must be restarted manually

### Staking tiers

Staking uses real on-chain transfers of SIGNAL into a staking vault contract:

- You choose a lock period of 7, 14, or 21 days
- Lock periods apply multipliers of 1.1x, 1.25x, and 1.5x respectively
- The app shows your lock duration, unlock date, and current multiplier

Staking impacts both mining and swap:

- Mining rate is multiplied by your active stake multiplier
- Swap output benefits from the same multiplier, so committed stakers receive more SIGNAL for the same points

## 3. Emission Schedule

Emissions are tier-based and governed entirely by the on-chain SIGNAL contract. Higher tiers receive higher daily emission rates. Schedule evolves via contract updates.

The off-chain points formula mirrors this shape: higher tiers and stronger stake multipliers earn proportionally more points per second, and those points can later be converted into on-chain SIGNAL via the swap system.

## 4. Boost System

Boosting highlights Farcaster content using a small on-chain payment.

- You paste a Farcaster cast URL into the Boost tab
- You pay the equivalent of 2 USD in either ETH or USDC on Base Sepolia
- Funds are sent to a fixed receiver address:
  - 0x980E5F15E788Cb653C77781099Fb739d7A1aEEd0

Implementation details:

- ETH boosts send a native transaction from your wallet to the receiver
- USDC boosts call the ERC-20 transfer function from your wallet
- The app waits for on-chain confirmation before updating the boosted feed

Once confirmed:

- The boosted cast is added to the in-app recent boosts list
- Other users can follow the link to view or recast it directly on Farcaster

There is no manual approval step. The signal for a successful boost is the on-chain transaction receipt.

## 5. Swap Mechanics

Swaps convert off-chain POINTS into on-chain SIGNAL.

Constraints:

- You must be connected to Base Sepolia (chainId 84532)
- Swap amounts must be a multiple of 1,000 points
- You must have at least as many points as you want to swap
- The treasury wallet must hold enough SIGNAL to cover the transfer

When you confirm a swap:

- The app validates your point balance client-side
- It then sends a transaction that transfers SIGNAL from the treasury wallet to your active wallet
- On success, your local points balance is reduced and you see the transaction hash alongside your wallet's updated SIGNAL balance

No fake balances are shown. If the treasury has insufficient SIGNAL or the transaction fails, the swap is blocked and you see an inline error.

## 6. Social and Tasks

Signal Miner integrates closely with Farcaster and Twitter / X.

### Farcaster

Inside the Farcaster mini app:

- You can use your custody wallet as the active wallet
- Tasks cover following the official Farcaster account, recasting the mining announcement, and sharing the mini app link
- Verification is handled through a real Farcaster backend so task completion cannot be faked from the client

Pinned mining and introduction casts are highlighted in the Farcaster feed. They are the canonical reference for new users entering through Frames.

### Twitter / X

The Twitter / X integration uses a simple profile connection with no OAuth:

- Official account handle: @BelgmNatur7704
- Pinned post used in tasks: ID 2011935189929226344

In the Profile tab you add your Twitter / X username. The Tasks tab reads this username and lets you:

- Confirm your X connection
- Follow the official account
- Like the pinned post

Actions on X are user-attested rather than backend-verified. All information you need to complete these tasks is available in-app; no external documentation pages are required.

## 7. Roadmap

The roadmap is intentionally simple and focused on iterating in public:

- Phase 0: Core loop  
  Mining sessions, swaps, staking vault, wallet integrations, and a basic leaderboard on Base Sepolia.

- Phase 1: Social flywheel  
  Deepened Farcaster and Twitter integrations, boosted feed curation, and task expansions tied to real on-chain actions.

- Phase 2: Refinement  
  UX polish, analytics, improved leaderboards, and additional staking strategies while remaining on testnet.

- Phase 3: Beyond testnet  
  Potential migration of the core pattern to production networks once contracts, flows, and economics have been battle-tested.

## 8. Audits

Audit pending. Use Signal Miner at your own risk and treat it as experimental testnet infrastructure. Contracts and integrations may change as the system evolves.

## 9. Docs

All documentation is provided in-app through this Whitepaper tab and the More tab. No external documentation or links are required to understand the mining, staking, boost, swap, or task mechanics.

## 10. Risks

Using Signal Miner involves risks:

- Smart contract and integration risk  
  Contracts, SDKs, and wallet integrations can contain bugs or edge cases. Even on testnet, issues can cause failed transactions, incorrect balances, or unexpected behavior.

- Network volatility  
  Base Sepolia is a shared testnet. RPC outages, congestion, or reorgs can delay or revert transactions and temporarily desynchronize balances and leaderboards.

- Key management  
  Losing access to an embedded or external wallet means losing access to any SIGNAL held there. Never share private keys or seed phrases and always treat wallets as if they were on mainnet.

Signal Miner is an experimental project intended for builders and early adopters. Use it with an understanding of these limitations and prefer small, incremental interactions over large bets.
`;

const Whitepaper: React.FC = () => {
  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-bold mb-4">Whitepaper</h1>
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4 max-h-[70vh] overflow-y-auto">
        <ReactMarkdown className="prose prose-invert max-w-none prose-h1:text-2xl prose-h2:text-xl prose-p:text-sm prose-li:text-sm">
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Whitepaper;
