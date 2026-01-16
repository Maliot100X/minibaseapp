import React from 'react';
import TwitterFeed from './TwitterFeed';
import FAQ from './FAQ';
import Tutorials from './Tutorials';

const More: React.FC = () => {
  return (
    <div className="pb-safe px-4 pt-safe space-y-6">
      <h1 className="text-[20px] font-semibold mb-1">More</h1>
      <p className="text-[11px] text-gray-400">
        FAQ, tutorials, Twitter / X tasks, and app information in one place.
      </p>

      <div className="space-y-4">
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-1">
            Whitepaper
          </div>
          <p className="text-[14px] text-gray-300">
            For the full Signal Miner specification, open the Whitepaper tab in the bottom
            navigation. It covers tokenomics, mining, staking, boost, and swap mechanics.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-1">
            Network
          </div>
          <div className="text-[14px] text-white">
            Base Sepolia
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-1">
            Emission Schedule
          </div>
          <p className="text-[14px] text-gray-300">
            Emissions are tier-based and governed entirely by the on-chain SIGNAL contract.
            Higher tiers receive higher daily emission rates. Schedule evolves via contract
            updates.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-1">
            Audits
          </div>
          <p className="text-[14px] text-gray-300">
            Audit pending. Use Signal Miner at your own risk and treat it as experimental
            testnet infrastructure.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-1">
            Docs
          </div>
          <p className="text-[14px] text-gray-300">
            In-app documentation is available in the Whitepaper tab. No external navigation
            is required to understand the mining, emissions, tiers, or swap mechanics.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider">FAQ</div>
          <FAQ />
        </div>

        <div className="space-y-3">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider">Tutorials</div>
          <Tutorials />
        </div>

        <div className="space-y-3 pb-6">
          <div className="text-[12px] text-gray-400 uppercase tracking-wider">Twitter / X</div>
          <TwitterFeed />
        </div>
      </div>
    </div>
  );
};

export default More;
