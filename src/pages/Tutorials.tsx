import React from 'react';
import { PlayCircle } from 'lucide-react';

const Tutorials: React.FC = () => {
  return (
    <div className="pb-24 px-4 pt-safe space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-[20px] font-semibold">Tutorials</h1>
        <p className="text-xs text-gray-400">Step-by-step guides to start mining, staking, swapping and boosting.</p>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">1. Connect a wallet</div>
              <p className="text-[13px] text-gray-300">
                Open the Profile tab or the wallet selector on the home screen and choose Farcaster,
                Base or MetaMask.
              </p>
            </div>
            <PlayCircle size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">2. Start a mining session</div>
              <p className="text-[13px] text-gray-300">
                Go to the Mine tab, ensure you are on Base Sepolia, and press START MINING to begin
                a 24h session.
              </p>
            </div>
            <PlayCircle size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">3. Stake for a boost</div>
              <p className="text-[13px] text-gray-300">
                Visit the Staking tab, choose a lock period, confirm the transaction, and apply a
                multiplier to your mining and swap rewards.
              </p>
            </div>
            <PlayCircle size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">4. Swap points to SIGNAL</div>
              <p className="text-[13px] text-gray-300">
                After mining and tasks, open the Swap tab, enter a multiple of 1,000 points, and
                confirm the transaction to receive SIGNAL from the treasury wallet.
              </p>
            </div>
            <PlayCircle size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">5. Boost a Farcaster post</div>
              <p className="text-[13px] text-gray-300">
                Go to the Boost tab, paste a Farcaster cast URL, pay $2 in ETH or USDC on Base
                Sepolia, and let your post appear in the boosted feed.
              </p>
            </div>
            <PlayCircle size={20} className="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
