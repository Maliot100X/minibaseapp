import React, { useRef, useEffect } from 'react';
import { ArrowRightLeft, Trophy, Medal, CheckSquare, FileText, MoreHorizontal, Lock, Rocket, User } from 'lucide-react';
import clsx from 'clsx';
import type { AppTab } from './Layout';

interface NavbarProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onChangeTab }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const navItems: { key: AppTab; icon: React.ElementType; label: string }[] = [
    { key: 'miner', icon: Trophy, label: 'Miner' },
    { key: 'tiers', icon: Trophy, label: 'Tiers' },
    { key: 'stake', icon: Lock, label: 'Staking' },
    { key: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { key: 'boost', icon: Rocket, label: 'Boost' },
    { key: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'more', icon: MoreHorizontal, label: 'More' },
    { key: 'whitepaper', icon: FileText, label: 'Whitepaper' },
    { key: 'leaderboard', icon: Medal, label: 'Leaderboard' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector('.active-nav-item');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-800 pb-safe z-50">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar h-16 px-2 mask-linear-fade"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {navItems.map(({ key, icon: Icon, label }) => {
          const isActive = currentTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeTab(key)}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs text-gray-400 transition-all active:scale-95',
                isActive &&
                  'text-white active-nav-item shadow-[0_0_12px_rgba(59,130,246,0.55)] bg-blue-600/30 border border-blue-500/60',
              )}
            >
              <Icon size={18} className="mb-1" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
