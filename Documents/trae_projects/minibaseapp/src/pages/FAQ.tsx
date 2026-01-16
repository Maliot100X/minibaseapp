import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="pb-24 px-4 pt-safe space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-[20px] font-semibold">FAQ</h1>
        <p className="text-xs text-gray-400">Quick answers about mining, staking, swap and boost.</p>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-sm font-semibold text-white">What does the miner do?</div>
          <p className="text-[13px] text-gray-300">
            The miner accrues off-chain points over a 24h session using a fixed formula based on
            your tier and staking multiplier. Points can be swapped for SIGNAL when your wallet is
            connected on Base Sepolia.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-sm font-semibold text-white">How does staking work?</div>
          <p className="text-[13px] text-gray-300">
            You lock SIGNAL into the staking vault for 7, 14 or 21 days. Longer locks apply a larger
            multiplier to your mining rate and swap output. Staking is a real on-chain transfer to
            the vault address.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-sm font-semibold text-white">Is there auto-mining?</div>
          <p className="text-[13px] text-gray-300">
            No. Mining must be started manually and automatically stops after 24 hours. There is no
            background mining without your consent.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="text-sm font-semibold text-white">Which networks and wallets are used?</div>
          <p className="text-[13px] text-gray-300">
            All on-chain actions run on Base Sepolia (chainId 84532). You can use a Farcaster
            custody wallet, Base embedded wallet, or MetaMask from the Profile tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

