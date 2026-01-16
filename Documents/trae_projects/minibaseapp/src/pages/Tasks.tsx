import React, { useState } from 'react';
import { CheckCircle, Circle, Twitter, Wallet } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { useWallet } from '../hooks/useWallet';
import { publicClient } from '../config/client';
import { useFarcaster } from '../context/FarcasterContext';

const FARCASTER_TARGET_FID = Number((import.meta as any).env.VITE_FC_TARGET_FID ?? 0);

const Tasks: React.FC = () => {
  const { address } = useWallet();
  const { context, fid } = useFarcaster();
  const tasks = useAppStore((s) => s.tasks);
  const completeTask = useAppStore((s) => s.completeTask);
   const xUsername = useAppStore((s) => s.xUsername);

  const [loading, setLoading] = useState<string | null>(null);

  const hasFarcasterContext = !!context;
  const farcasterConfigured = hasFarcasterContext && FARCASTER_TARGET_FID > 0;
  const fcBackendBase = (import.meta as any).env.VITE_FC_API_BASE as string | undefined;

  const handleTask = async (id: string, reward: number, action?: () => Promise<boolean> | void) => {
    if (tasks[id]) return;

    setLoading(id);
    try {
      if (action) {
        const result = await action();
        if (result === false) {
          return;
        }
      }
      completeTask(id, reward);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const verifyBaseTx = async () => {
    if (!address) return false;
    const count = await publicClient.getTransactionCount({ address: address as `0x${string}` });
    return count > 0;
  };

  const verifyFarcasterFollow = async () => {
    if (!farcasterConfigured || !context) {
      alert('Farcaster is not configured for this task');
      return false;
    }

    const ctxAny = context as any;
    const user = ctxAny.user || ctxAny.interactor || ctxAny.viewer;
    const following =
      user?.following ||
      user?.followingFids ||
      user?.follows ||
      user?.fids;

    if (!Array.isArray(following)) {
      alert('Follow data is not available in Farcaster context');
      return false;
    }

    const ok = following.includes(FARCASTER_TARGET_FID);
    if (!ok) {
      alert('Follow the required Farcaster account first');
    }
    return ok;
  };

  const verifyFarcasterRecast = async () => {
    if (!fcBackendBase || !fid) {
      alert('Farcaster verification backend is not configured');
      return false;
    }

    try {
      const res = await fetch(`${fcBackendBase}/verify-recast?fid=${fid}`, { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.verified) {
        alert('Recast not detected yet');
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const verifyFarcasterShare = async () => {
    if (!fcBackendBase || !fid) {
      alert('Farcaster verification backend is not configured');
      return false;
    }

    try {
      const res = await fetch(`${fcBackendBase}/verify-share?fid=${fid}`, { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.verified) {
        alert('Share of the mini app not detected yet');
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const requireXUsername = async () => {
    if (!xUsername || !xUsername.trim()) {
      alert('Add your X username in the Profile tab first.');
      return false;
    }
    return true;
  };

  const verifyXSession = async () => {
    return requireXUsername();
  };

  const verifyXFollow = async () => {
    const ok = await requireXUsername();
    if (!ok) return false;
    window.open('https://x.com/BelgmNatur7704', '_blank');
    return true;
  };

  const verifyXLike = async () => {
    const ok = await requireXUsername();
    if (!ok) return false;
    window.open('https://x.com/BelgmNatur7704/status/2011935189929226344', '_blank');
    return true;
  };

  return (
    <div className="flex flex-col items-center px-4 pt-safe pb-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Task Hub</h1>
        <p className="text-xs text-gray-400">Complete tasks to earn Points</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Farcaster</h3>

          <TaskItem
            id="fc_follow"
            title="Follow Signal on Farcaster"
            reward={250}
            isCompleted={tasks['fc_follow']}
            isLoading={loading === 'fc_follow'}
            disabled={!farcasterConfigured}
            helper={
              !hasFarcasterContext
                ? 'Available inside Farcaster mini app'
                : !FARCASTER_TARGET_FID
                ? 'App owner must configure VITE_FC_TARGET_FID'
                : undefined
            }
            onClick={() => handleTask('fc_follow', 250, verifyFarcasterFollow)}
          />
          <TaskItem
            id="fc_recast"
            title="Recast mining announcement"
            reward={250}
            isCompleted={tasks['fc_recast']}
            isLoading={loading === 'fc_recast'}
            disabled={!hasFarcasterContext || !fcBackendBase || !fid}
            helper={
              !hasFarcasterContext
                ? 'Available inside Farcaster mini app'
                : !fcBackendBase
                ? 'Requires Farcaster verification backend'
                : undefined
            }
            onClick={() => handleTask('fc_recast', 250, verifyFarcasterRecast)}
          />
          <TaskItem
            id="fc_share"
            title="Share mini app on Farcaster"
            reward={250}
            isCompleted={tasks['fc_share']}
            isLoading={loading === 'fc_share'}
            disabled={!hasFarcasterContext || !fcBackendBase || !fid}
            helper={
              !hasFarcasterContext
                ? 'Available inside Farcaster mini app'
                : !fcBackendBase
                ? 'Requires Farcaster verification backend'
                : undefined
            }
            onClick={() => handleTask('fc_share', 250, verifyFarcasterShare)}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Twitter / X</h3>

          <TaskItem
            id="x_login"
            title="Login with X"
            reward={500}
            isCompleted={tasks['x_login']}
            isLoading={loading === 'x_login'}
            icon={<Twitter size={16} />}
            disabled={!xUsername || !xUsername.trim()}
            helper={
              !xUsername || !xUsername.trim()
                ? 'Add your X username in the Profile tab'
                : 'Uses your saved X username, no OAuth required'
            }
            onClick={() => handleTask('x_login', 500, verifyXSession)}
          />

          {tasks['x_login'] && (
            <>
              <TaskItem
                id="x_follow"
                title="Follow @BelgmNatur7704 on X"
                reward={500}
                isCompleted={tasks['x_follow']}
                isLoading={loading === 'x_follow'}
                disabled={!xUsername || !xUsername.trim() || !tasks['x_login']}
                helper={
                  !xUsername || !xUsername.trim()
                    ? 'Add your X username in the Profile tab'
                    : !tasks['x_login']
                    ? 'Complete "Login with X" first'
                    : undefined
                }
                onClick={() => handleTask('x_follow', 500, verifyXFollow)}
              />
              <TaskItem
                id="x_like"
                title="Like pinned post on X"
                reward={500}
                isCompleted={tasks['x_like']}
                isLoading={loading === 'x_like'}
                disabled={!xUsername || !xUsername.trim() || !tasks['x_login']}
                helper={
                  !xUsername || !xUsername.trim()
                    ? 'Add your X username in the Profile tab'
                    : !tasks['x_login']
                    ? 'Complete "Login with X" first'
                    : undefined
                }
                onClick={() => handleTask('x_like', 500, verifyXLike)}
              />
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Base Network</h3>

          <TaskItem
            id="base_connect"
            title="Connect Base wallet"
            reward={500}
            isCompleted={tasks['base_connect'] || !!address}
            isLoading={loading === 'base_connect'}
            icon={<Wallet size={16} />}
            onClick={() =>
              handleTask('base_connect', 500, async () => {
                if (!address) {
                  alert('Please connect your wallet first');
                  return false;
                }
                return true;
              })
            }
          />

          <TaskItem
            id="base_tx"
            title="Execute 1 transaction on Base"
            reward={500}
            isCompleted={tasks['base_tx']}
            isLoading={loading === 'base_tx'}
            onClick={() =>
              handleTask('base_tx', 500, async () => {
                const hasTx = await verifyBaseTx();
                if (!hasTx) {
                  alert('No transactions found for this address on Base Sepolia yet.');
                  return false;
                }
                return true;
              })
            }
          />

          <TaskItem
            id="base_swap"
            title="Complete 1 swap on Base"
            reward={500}
            isCompleted={tasks['base_swap']}
            isLoading={loading === 'base_swap'}
            onClick={() =>
              handleTask('base_swap', 500, async () => {
                const hasTx = await verifyBaseTx();
                if (!hasTx) {
                  alert('Please complete a swap first.');
                  return false;
                }
                return true;
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

interface TaskItemProps {
  id: string;
  title: string;
  reward: number;
  isCompleted: boolean;
  isLoading: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  helper?: string;
  onClick: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ title, reward, isCompleted, isLoading, icon, disabled, helper, onClick }) => (
  <button
    onClick={onClick}
    disabled={isCompleted || isLoading || disabled}
    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
      isCompleted
        ? 'bg-green-900/20 border-green-800 text-gray-400'
        : disabled
        ? 'bg-gray-900 border-gray-800 text-gray-500'
        : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <div className="text-left">
        <div className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>{title}</div>
        <div className="text-xs text-yellow-500 font-mono">+{reward} PTS</div>
        {helper && !isCompleted && <div className="text-[10px] text-gray-400 mt-1">{helper}</div>}
      </div>
    </div>

    <div>
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : isCompleted ? (
        <CheckCircle className="text-green-500" size={20} />
      ) : (
        <Circle className="text-gray-600" size={20} />
      )}
    </div>
  </button>
);

export default Tasks;
