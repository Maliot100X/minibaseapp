'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Layers, Wallet, RefreshCw, MessageSquare, LogOut } from 'lucide-react';

// PAYMENT LAYER PREP
const SIGN_IN_FEE = 0.20; // USD
const TREASURY_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Replace with provided Zora ETH wallet
const FEE_DISTRIBUTION = {
  treasury: 1.0, // 100% to treasury initially
};

type FrameContext = Awaited<typeof sdk.context>;

interface UserProfile {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

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

export default function ProfilePage() {
  const [context, setContext] = useState<FrameContext>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  
  const [activeTab, setActiveTab] = useState<'created' | 'holdings'>('created');

  // Fetch created coins
  const { data: createdCoins, isLoading: loadingCreated, refetch: refetchCreated } = useQuery<CoinLog[]>({
    queryKey: ['created-coins', address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/zora/user?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch created coins');
      return res.json();
    },
    enabled: !!address,
  });

  // Fetch holdings
  const { data: holdings, isLoading: loadingHoldings, refetch: refetchHoldings } = useQuery<CoinLog[]>({
    queryKey: ['holdings', address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/zora/holdings?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch holdings');
      return res.json();
    },
    enabled: !!address,
  });

  useEffect(() => {
    const loadContext = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        
        if (ctx?.user?.fid) {
          fetchProfile(ctx.user.fid);
        } else {
            setLoading(false);
        }
      } catch (err) {
        console.error('Error loading context:', err);
        setError('Failed to load Farcaster context');
        setLoading(false);
      }
    };

    loadContext();
  }, []);

  const fetchProfile = async (fid: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = useCallback(() => {
    if (context?.user?.fid) {
      fetchProfile(context.user.fid);
    }
    if (address) {
        refetchCreated();
        refetchHoldings();
    }
  }, [context, address, refetchCreated, refetchHoldings]);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button 
          onClick={handleSync}
          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          title="Sync Profile"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {profile && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {profile.pfp_url && (
              <Image
                src={profile.pfp_url}
                alt={profile.display_name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{profile.display_name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Farcaster ID: <span className="font-mono text-foreground">{profile.fid}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Wallet size={18} />
          Wallet Status
        </h3>
        
        {isConnected ? (
          <div className="space-y-3">
             <div className="text-sm text-muted-foreground bg-muted p-2 rounded break-all font-mono">
                {address}
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600"
              >
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
          </div>
        ) : (
          <div className="space-y-3">
             <p className="text-sm text-muted-foreground">Connect to view assets</p>
             <div className="flex flex-col gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-left"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isConnected ? (
        null // Already showed connect options above
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-2 border-b border-border pb-1">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'created' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Created Coins
              {activeTab === 'created' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'holdings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Holdings
              {activeTab === 'holdings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'created' ? (
              loadingCreated ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : !createdCoins || createdCoins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No created coins found.
                </div>
              ) : (
                createdCoins.map((coin) => (
                  <CoinCard key={coin.transactionHash} coin={coin} />
                ))
              )
            ) : (
              loadingHoldings ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : !holdings || holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No holdings found.
                </div>
              ) : (
                holdings.map((coin) => (
                  <CoinCard key={coin.transactionHash} coin={coin} />
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* AI Chat Placeholder */}
      <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-dashed border-primary/30 rounded-xl p-6 text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <MessageSquare size={24} />
        </div>
        <h3 className="font-semibold text-sm">AI Agent</h3>
        <p className="text-xs text-muted-foreground">Chat with your onchain agent coming in Phase 4.</p>
      </div>
    </div>
  );
}

function CoinCard({ coin }: { coin: CoinLog }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
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
            <span>{new Date(Number(coin.args.timestamp) * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
