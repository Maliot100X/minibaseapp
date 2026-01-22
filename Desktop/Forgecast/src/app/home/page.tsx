'use client';

import { TrendingUp, Plus, ArrowRight, Clock, Coins, User, Layers } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns'; // I might need to install date-fns or use simple formatter

interface CoinLog {
  args: {
    creator: string;
    coin: string;
    name: string;
    symbol: string;
    timestamp: string;
  };
  transactionHash: string;
}

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'new' | 'graduated' | 'boosted'>('new');

  const { data: coins, isLoading, error } = useQuery<CoinLog[]>({
    queryKey: ['recent-coins'],
    queryFn: async () => {
      const res = await fetch('/api/zora/recent');
      if (!res.ok) throw new Error('Failed to fetch coins');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const displayCoins = activeTab === 'new' 
    ? coins 
    : activeTab === 'graduated'
      ? coins?.slice(0, 5) // Placeholder for Graduated
      : []; // Placeholder for Boosted

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          Forgecast
        </h1>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">FC</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'new' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          New
          {activeTab === 'new' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('graduated')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'graduated' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Graduated
          {activeTab === 'graduated' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('boosted')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'boosted' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Boosted
          {activeTab === 'boosted' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Failed to load coins.
          </div>
        ) : activeTab === 'boosted' ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Boosted coins coming soon</p>
          </div>
        ) : !displayCoins || displayCoins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No coins found.
          </div>
        ) : (
          <div className="space-y-3">
            {displayCoins.map((coin) => (
              <div key={coin.transactionHash} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {coin.args.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{coin.args.name}</h3>
                      <p className="text-xs text-muted-foreground">${coin.args.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1 justify-end">
                      <Clock size={12} />
                      <span>
                        {new Date(Number(coin.args.timestamp) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded mt-1 inline-block">
                      Base
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>Creator: {formatAddress(coin.args.creator)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/launch" className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Plus size={20} />
          </div>
          <span className="font-medium text-sm">New Launch</span>
        </Link>
        <Link href="/profile" className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <TrendingUp size={20} />
          </div>
          <span className="font-medium text-sm">Portfolio</span>
        </Link>
      </div>
    </div>
  );
}
