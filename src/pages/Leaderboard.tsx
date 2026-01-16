import React, { useEffect, useState } from 'react';
import { parseAbiItem, formatUnits } from 'viem';
import { publicClient } from '../config/client';
import { SIGNAL_TOKEN_ADDRESS, TREASURY_ADDRESS, STAKING_VAULT_ADDRESS } from '../config/contracts';
import { Loader2, Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  address: string;
  totalSwapped: bigint;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stakerEntries, setStakerEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'swaps' | 'staking'>('swaps');
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'all-time'>('daily');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const currentBlock = await publicClient.getBlockNumber();

      const maxChunkSize = 10n;
      const maxTotalRange = 2000n;

      let desiredRange: bigint;
      if (timeframe === 'daily') {
        desiredRange = 43200n;
      } else if (timeframe === 'monthly') {
        desiredRange = 1296000n;
      } else {
        desiredRange = 2500000n;
      }

      const effectiveRange = desiredRange > maxTotalRange ? maxTotalRange : desiredRange;

      const fromBlock = currentBlock > effectiveRange ? currentBlock - effectiveRange : 0n;

      const event = parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      );

      const logs: any[] = [];

      let start = fromBlock;
      while (start <= currentBlock) {
        const end = start + maxChunkSize - 1n;
        const toBlock = end > currentBlock ? currentBlock : end;
        const chunkLogs = await publicClient.getLogs({
          address: SIGNAL_TOKEN_ADDRESS,
          event,
          fromBlock: start,
          toBlock,
        });
        logs.push(...chunkLogs);
        if (toBlock === currentBlock) break;
        start = toBlock + 1n;
      }

      const swapTotals: Record<string, bigint> = {};
      const stakeTotals: Record<string, bigint> = {};

      logs.forEach((log) => {
        const { from, to, value } = log.args as { from?: string; to?: string; value?: bigint };
        if (!from || !to || !value) return;

        if (from.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
          if (!swapTotals[to]) swapTotals[to] = 0n;
          swapTotals[to] += value;
        }

        if (to.toLowerCase() === STAKING_VAULT_ADDRESS.toLowerCase()) {
          if (!stakeTotals[from]) stakeTotals[from] = 0n;
          stakeTotals[from] += value;
        }
      });

      const swapSorted = Object.entries(swapTotals)
        .map(([address, totalSwapped]) => ({ address, totalSwapped }))
        .sort((a, b) => (a.totalSwapped < b.totalSwapped ? 1 : -1))
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
      const stakeSorted = Object.entries(stakeTotals)
        .map(([address, totalSwapped]) => ({ address, totalSwapped }))
        .sort((a, b) => (a.totalSwapped < b.totalSwapped ? 1 : -1))
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setEntries(swapSorted.slice(0, 50));
      setStakerEntries(stakeSorted.slice(0, 50));
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch leaderboard", err);
      setError(err.message || 'Failed to load leaderboard. Try a shorter timeframe.');
      // Don't auto-retry if it's likely a timeout
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [timeframe, retryCount]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-gray-500 font-bold w-5 text-center">{rank}</span>;
  };

  return (
    <div className="pb-24 space-y-6 px-4 pt-safe">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-gray-400">Top swappers and stakers on Base Sepolia</p>
      </div>

      <div className="flex bg-gray-900 p-1 rounded-lg">
        {(['swaps', 'staking'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-colors ${
              mode === m ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex bg-gray-900 p-1 rounded-lg">
        {(['daily', 'monthly', 'all-time'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
              timeframe === t
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-xs text-red-300 rounded-lg p-3 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setRetryCount(retryCount + 1)}
            className="text-[11px] px-2 py-1 rounded bg-red-800/60 hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden">
            {(mode === 'swaps' ? entries : stakerEntries).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {mode === 'swaps' ? 'No swaps yet in this period' : 'No staking activity in this period'}
              </div>
            ) : (
              (mode === 'swaps' ? entries : stakerEntries).map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center justify-between p-4 border-b border-gray-800 last:border-0 hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-blue-400">
                        {truncateAddress(entry.address)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{parseFloat(formatUnits(entry.totalSwapped, 18)).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">SIGNAL</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
