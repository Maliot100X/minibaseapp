import React, { useEffect, useMemo, useState } from 'react';
import { Rocket, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { createWalletClient, custom, parseEther, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { BOOST_RECEIVER_ADDRESS } from '../config/contracts';
import { publicClient } from '../config/client';

const Boost: React.FC = () => {
  const { address, isBaseSepolia, switchToBaseSepolia } = useWallet();
  const [boostUrl, setBoostUrl] = useState('');
  const [boostToken, setBoostToken] = useState<'eth' | 'usdc'>('eth');
  const [boosting, setBoosting] = useState(false);
  const [boostedPosts, setBoostedPosts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('boostedPosts');
      if (saved) setBoostedPosts(JSON.parse(saved));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const urlMeta = useMemo(() => {
    if (!boostUrl) return null;
    try {
      const u = new URL(boostUrl);
      let platform = 'Link';
      if (u.hostname.includes('warpcast') || u.hostname.includes('farcaster')) {
        platform = 'Farcaster';
      } else if (u.hostname.includes('x.com') || u.hostname.includes('twitter.com')) {
        platform = 'Twitter / X';
      } else if (u.hostname.includes('base')) {
        platform = 'Base app';
      }
      return {
        platform,
        hostname: u.hostname,
        href: boostUrl,
        path: `${u.pathname}${u.search}`,
      };
    } catch {
      return null;
    }
  }, [boostUrl]);

  const handleBoost = async () => {
    if (!address || !window.ethereum || !boostUrl || !isBaseSepolia) return;
    setBoosting(true);
    try {
      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
      const [account] = await client.requestAddresses();

      let hash: `0x${string}`;
      if (boostToken === 'eth') {
        hash = await client.sendTransaction({
          account,
          to: BOOST_RECEIVER_ADDRESS as `0x${string}`,
          value: parseEther('0.0006'),
          chain: baseSepolia,
        });
      } else {
        const usdcAddress = (import.meta as any).env.VITE_BASE_USDC_ADDRESS as `0x${string}` | undefined;
        if (!usdcAddress) {
          throw new Error('USDC address not configured');
        }
        const amount = parseUnits('2', 6);
        hash = await client.writeContract({
          address: usdcAddress,
          abi: [
            {
              type: 'function',
              name: 'transfer',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'transfer',
          args: [BOOST_RECEIVER_ADDRESS as `0x${string}`, amount],
          account,
        });
      }
      await publicClient.waitForTransactionReceipt({ hash });

      const newPosts = [boostUrl, ...boostedPosts].slice(0, 10);
      setBoostedPosts(newPosts);
      localStorage.setItem('boostedPosts', JSON.stringify(newPosts));
      setBoostUrl('');
      alert('Post boosted successfully');
    } catch (error) {
      console.error(error);
      alert('Boost failed. Ensure you are on Base Sepolia and have enough balance.');
    } finally {
      setBoosting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-4 pt-safe pb-safe space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Boost Post</h1>
        <p className="text-xs text-gray-400">
          Pay $2 in ETH or USDC on Base to highlight a Farcaster post.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {!isBaseSepolia && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 text-xs flex items-center justify-between">
            <span>Wrong network. Switch to Base Sepolia to boost.</span>
            <button
              type="button"
              onClick={switchToBaseSepolia}
              className="ml-3 px-3 py-1 bg-yellow-500 text-black text-[11px] font-semibold rounded"
            >
              Switch
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center space-x-2 mb-3">
            <Rocket size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Boost a Farcaster Cast</h3>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Paste Farcaster, X, or Base mini-app URL..."
              value={boostUrl}
              onChange={(e) => setBoostUrl(e.target.value)}
              className="flex-1 bg-black/50 border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleBoost}
              disabled={boosting || !boostUrl || !address || !isBaseSepolia}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded transition-colors disabled:opacity-50"
            >
              {boosting ? '...' : 'BOOST'}
            </button>
          </div>
          {urlMeta && (
            <div className="mt-3 bg-black/40 border border-gray-700 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{urlMeta.platform} link</span>
                <span className="text-gray-500">{urlMeta.hostname}</span>
              </div>
              <div className="text-[12px] text-gray-100 truncate">
                {urlMeta.path || '/'}
              </div>
              <div className="flex justify-end">
                <a
                  href={urlMeta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[10px] text-blue-400 hover:text-blue-300"
                >
                  <span>Open original</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}
          <div className="mt-2 flex justify-between items-center text-[10px] text-gray-500">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBoostToken('eth')}
                className={`px-2 py-1 rounded border ${
                  boostToken === 'eth'
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-black/40 border-gray-700 text-gray-300'
                }`}
              >
                Pay ETH
              </button>
              <button
                type="button"
                onClick={() => setBoostToken('usdc')}
                className={`px-2 py-1 rounded border ${
                  boostToken === 'usdc'
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-black/40 border-gray-700 text-gray-300'
                }`}
                disabled={!(import.meta as any).env.VITE_BASE_USDC_ADDRESS}
              >
                Pay USDC
              </button>
            </div>
            <div className="text-right">
              <div>Price: $2</div>
              <div>Feed: Public</div>
            </div>
          </div>
        </div>

        {boostedPosts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              Recent Boosts
            </div>
            {boostedPosts.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black/30 p-2 rounded border border-gray-800 hover:border-gray-600 transition-colors flex items-center justify-between"
              >
                <span className="text-[10px] text-blue-400 truncate w-4/5">{url}</span>
                <ExternalLink size={10} className="text-gray-500" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Boost;
