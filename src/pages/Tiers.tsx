import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useAppStore } from '../state/appStore';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { SIGNAL_TOKEN_ADDRESS, TREASURY_ADDRESS, signalAbi } from '../config/contracts';
import { publicClient } from '../config/client';
import { parseUnits } from 'viem';

interface Tier {
  id: number;
  name: string;
  priceUSD: number;
  priceSignal: number;
  multiplier: number;
}

const TIERS: Tier[] = [
  { id: 0, name: 'Base Rig', priceUSD: 0, priceSignal: 0, multiplier: 1.0 },
  { id: 1, name: 'Tier 1 • x3', priceUSD: 1, priceSignal: 1000, multiplier: 3.0 },
  { id: 2, name: 'Tier 2 • x5', priceUSD: 3, priceSignal: 3000, multiplier: 5.0 },
  { id: 3, name: 'Tier 3 • x10', priceUSD: 5, priceSignal: 5000, multiplier: 10.0 },
  { id: 4, name: 'Tier 4 • x25', priceUSD: 8, priceSignal: 8000, multiplier: 25.0 },
  { id: 5, name: 'Tier 5 • x50', priceUSD: 15, priceSignal: 100000, multiplier: 50.0 },
];

const Tiers: React.FC = () => {
  const { address, isBaseSepolia, switchToBaseSepolia } = useWallet();
  const { balance, refetch } = useTokenBalance(address);
  const currentTier = useAppStore((s) => s.tier);
  const upgradeTier = useAppStore((s) => s.upgradeTier);

  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (tier: Tier) => {
    if (!address || !window.ethereum || !isBaseSepolia) return;
    
    setBuyingId(tier.id);
    setError(null);
    setTxHash(null);

    try {
      const price = parseUnits(tier.priceSignal.toString(), 18);
      const balanceBigInt = parseUnits(balance || '0', 18);

      if (balanceBigInt < price) {
        throw new Error("Insufficient SIGNAL balance");
      }

      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });

      const [account] = await client.requestAddresses();

      // Transfer SIGNAL to Treasury
      const hash = await client.writeContract({
        address: SIGNAL_TOKEN_ADDRESS,
        abi: signalAbi,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS as `0x${string}`, price],
        account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setTxHash(hash);
        upgradeTier(tier.id);
        refetch();
      } else {
        throw new Error("Transaction failed onchain");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Purchase failed");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-4 pt-safe pb-safe space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Mining Tiers</h1>
        <p className="text-xs text-gray-400">
          Upgrade your mining rig to earn points faster.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 pb-20">
        {!isBaseSepolia && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 text-xs flex items-center justify-between">
            <span>Wrong network. Switch to Base Sepolia to buy tiers.</span>
            <button
              type="button"
              onClick={switchToBaseSepolia}
              className="ml-3 px-3 py-1 bg-yellow-500 text-black text-[11px] font-semibold rounded"
            >
              Switch
            </button>
          </div>
        )}

        {!address && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-200">Wallet not available. Tier purchases are disabled.</p>
          </div>
        )}

        {TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isLocked = currentTier > tier.id; // Already surpassed
          const canBuy = !isCurrent && !isLocked && address && isBaseSepolia;

          return (
            <div 
              key={tier.id}
              className={`relative bg-gray-900 rounded-xl border ${isCurrent ? 'border-blue-500 shadow-lg shadow-blue-900/20' : 'border-gray-800'} p-5 transition-all`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Current Plan
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>{tier.name}</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Lvl {tier.id}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {tier.priceSignal === 0 ? 'Free' : `${tier.priceSignal} SIGNAL`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-400 font-bold">
                    <Zap size={14} fill="currentColor" />
                    <span>{tier.multiplier.toFixed(1)}x</span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Multiplier</div>
                </div>
              </div>

              <button
                onClick={() => handleBuy(tier)}
                disabled={!canBuy || buyingId !== null}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
                  isCurrent 
                    ? 'bg-blue-900/20 text-blue-400 cursor-default'
                    : isLocked
                    ? 'bg-gray-800 text-gray-500 cursor-default'
                    : 'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {buyingId === tier.id ? 'Purchasing...' : isCurrent ? 'Active' : isLocked ? 'Unlocked' : `Upgrade for ${tier.priceSignal} SIG`}
              </button>
            </div>
          );
        })}

        {error && (
          <div className="text-center text-xs text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
        
        {txHash && (
          <div className="text-center text-xs text-green-400 bg-green-900/20 p-2 rounded break-all">
             Success! Tx: {txHash}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tiers;
