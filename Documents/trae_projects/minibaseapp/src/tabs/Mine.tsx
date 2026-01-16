import React, { useEffect, useState } from 'react';
import { Zap, ArrowRightLeft, Play, Timer, Rocket } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useAppStore } from '../state/appStore';
import { AppTab } from '../components/Layout';

interface MineProps {
  onNavigate?: (tab: AppTab) => void;
}

const Mine: React.FC<MineProps> = ({ onNavigate }) => {
  const { address, isBaseSepolia } = useWallet();

  const points = useAppStore((s) => s.points);
  const tier = useAppStore((s) => s.tier);
  const isStaked = useAppStore((s) => s.isStaked);
  const stakeMultiplier = useAppStore((s) => s.stakeMultiplier);
  const miningActive = useAppStore((s) => s.miningActive);
  const lastActivation = useAppStore((s) => s.lastActivation);
  const syncPoints = useAppStore((s) => s.syncPoints);
  const startMining = useAppStore((s) => s.startMining);

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [sessionEstimate, setSessionEstimate] = useState(0);

  useEffect(() => {
    if (!miningActive) {
      return;
    }
    const interval = setInterval(() => {
      syncPoints();
    }, 5000);
    return () => clearInterval(interval);
  }, [miningActive, syncPoints]);

  useEffect(() => {
    if (!miningActive) {
      setTimeLeft('');
      setProgress(0);
      setSessionEstimate(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = lastActivation + 24 * 60 * 60 * 1000;
      const diff = expiry - now;
      const totalMs = 24 * 60 * 60 * 1000;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setProgress(1);
        const basePerDay = 100;
        const multipliers = [1.0, 3.0, 5.0, 10.0, 25.0, 50.0];
        const tierMultiplier = multipliers[tier] || 1.0;
        const totalMultiplier = tierMultiplier * (stakeMultiplier || 1);
        setSessionEstimate(basePerDay * totalMultiplier);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
            .toString()
            .padStart(2, '0')}`,
        );
        const elapsedMs = totalMs - diff;
        const ratio = elapsedMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;
        setProgress(ratio);
        const basePerDay = 100;
        const multipliers = [1.0, 3.0, 5.0, 10.0, 25.0, 50.0];
        const tierMultiplier = multipliers[tier] || 1.0;
        const totalMultiplier = tierMultiplier * (stakeMultiplier || 1);
        setSessionEstimate(basePerDay * totalMultiplier * ratio);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [miningActive, lastActivation, tier, stakeMultiplier]);

  const handleStartMining = () => {
    if (!address || !isBaseSepolia) {
      return;
    }
    startMining();
  };

  const getDailyRate = (t: number, staked: boolean) => {
    const base = 100;
    const multipliers = [1.0, 3.0, 5.0, 10.0, 25.0, 50.0];
    const multiplier = multipliers[t] || 1.0;
    return base * multiplier * (staked ? 1.0 : 1.0);
  };

  const dailyRate = getDailyRate(tier, isStaked);
  const canSwap = points >= 1000;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-safe pb-safe space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Signal Miner</h1>
        <p className="text-xs text-gray-400">
          24h mining sessions • Base Sepolia
        </p>
        <p className="text-[10px] text-gray-500">
          For full emission math and tier effects, read the Whitepaper tab in More.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Rocket size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Boost Post</h3>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('boost')}
                className="text-[11px] px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-500"
              >
                Open
              </button>
            )}
          </div>
          <p className="mt-2 text-[12px] text-gray-300">
            Paste a Farcaster URL and pay $2 in ETH or USDC on Base to highlight your cast in the
            Boost tab.
          </p>
        </div>

        {/* Points Card */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Zap size={64} />
          </div>
          
          <div className="space-y-4 relative z-10">
             <div className="flex justify-between items-start">
                <div>
                  <div className="text-[12px] text-gray-400 mb-1">Mining Balance</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {Math.floor(points).toLocaleString()} <span className="text-sm text-yellow-500">PTS</span>
                  </div>
                </div>
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${miningActive ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                   {miningActive ? 'Active' : 'Paused'}
                </div>
             </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tier</div>
                <div className="text-lg font-bold text-blue-400">Level {tier}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Daily Rate</div>
                <div className="text-lg font-bold text-green-400">
                  {dailyRate} PTS
                  {isStaked && <span className="text-[10px] ml-1 text-yellow-500">(Boosted)</span>}
                </div>
              </div>
            </div>

            {miningActive && (
               <div className="pt-3 space-y-2">
                 <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider">
                   <span>Session Progress</span>
                   <span>{Math.round(progress * 100)}%</span>
                 </div>
                 <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                   <div
                     className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                     style={{ width: `${Math.round(progress * 100)}%` }}
                   />
                 </div>
                 <div className="flex items-center justify-between text-xs text-gray-400">
                   <div className="flex items-center space-x-2">
                     <Timer size={14} className="text-yellow-500" />
                     <span className="font-mono text-sm">{timeLeft}</span>
                   </div>
                   <div className="text-right">
                     <div className="text-[10px] uppercase tracking-wider">Est. Points This Session</div>
                     <div className="font-mono text-sm text-yellow-400">
                       {sessionEstimate.toFixed(2)} PTS
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!miningActive && (
             <button
             onClick={handleStartMining}
             disabled={!address || !isBaseSepolia} 
             className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Play size={16} />
             <span>
               {!address ? 'Connect Wallet to Mine' : !isBaseSepolia ? 'Switch to Base Sepolia' : 'START MINING'}
             </span>
           </button>
          )}

          {miningActive && (
             <div className="w-full bg-gray-800/50 text-gray-400 text-sm font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 border border-gray-800">
                <Zap size={16} className="text-yellow-500 animate-pulse" />
                <span>Mining in Progress...</span>
             </div>
          )}

          {canSwap && onNavigate && (
            <button
              onClick={() => onNavigate('swap')}
              className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-green-900/20"
            >
              <ArrowRightLeft size={16} />
              <span>Swap Points for SIGNAL</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mine;
