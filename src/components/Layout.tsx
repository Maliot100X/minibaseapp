import React from 'react';
import Navbar from './Navbar';
import { useAppStore } from '../state/appStore';

export type AppTab =
  | 'miner'
  | 'stake'
  | 'swap'
  | 'boost'
  | 'tasks'
  | 'profile'
  | 'tiers'
  | 'more'
  | 'whitepaper'
  | 'leaderboard';

interface LayoutProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentTab, onChangeTab, children }) => {
  const contextReady = useAppStore((s) => s.contextReady);
  const activeAddress = useAppStore((s) => s.activeAddress);

  const isPreview = contextReady && !activeAddress;

  return (
    <div className="min-h-screen bg-black text-white pt-safe pb-20 pb-safe">
      {isPreview && (
        <div className="px-4 pt-3">
          <div className="w-full max-w-md mx-auto text-xs text-gray-200 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>You’re previewing SIGNAL MINER. Connect to start.</span>
          </div>
        </div>
      )}
      <main className="p-4">{children}</main>
      <Navbar currentTab={currentTab} onChangeTab={onChangeTab} />
    </div>
  );
};

export default Layout;
