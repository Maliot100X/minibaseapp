import React, { useState } from 'react';
import { CheckCircle, Circle, Twitter, Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useAppStore } from '../state/appStore';
import { publicClient } from '../config/client';
import { useFarcaster } from '../context/FarcasterContext';

const Earn: React.FC = () => {
  const { address } = useWallet();
  const { context } = useFarcaster();
  const tasks = useAppStore((s) => s.tasks);
  const completeTask = useAppStore((s) => s.completeTask);
  const xUsername = useAppStore((s) => s.xUsername);

  const [loading, setLoading] = useState<string | null>(null);

  const handleTask = async (id: string, reward: number, action?: () => Promise<boolean> | void) => {
    if (tasks[id]) return;

    setLoading(id);
    try {
      if (action) {
        const result = await action();
        if (result === false) {
           // action failed or returned false
           return; 
        }
      }
      // If action is void or returns true/undefined, complete task
      completeTask(id, reward);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const hasFarcasterContext = !!context;

  // Base Verification Helpers
  const verifyBaseTx = async () => {
    if (!address) return false;
    const count = await publicClient.getTransactionCount({ address: address as `0x${string}` });
    return count > 0;
  };

  return (
    <div className="flex flex-col items-center px-4 pt-safe pb-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Task Hub</h1>
        <p className="text-xs text-gray-400">Complete tasks to earn Points</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        
        {/* Group 1: Farcaster */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Farcaster</h3>
          
          <TaskItem 
            id="fc_follow"
            title="Follow Signal on Farcaster"
            reward={250}
            isCompleted={tasks['fc_follow']}
            isLoading={loading === 'fc_follow'}
            disabled={!hasFarcasterContext}
            helper={!hasFarcasterContext ? 'Available inside Farcaster mini app' : undefined}
            onClick={() => handleTask('fc_follow', 250, async () => false)}
          />
          <TaskItem 
            id="fc_recast"
            title="Recast Announcement"
            reward={250}
            isCompleted={tasks['fc_recast']}
            isLoading={loading === 'fc_recast'}
            disabled={!hasFarcasterContext}
            helper={!hasFarcasterContext ? 'Available inside Farcaster mini app' : undefined}
            onClick={() => handleTask('fc_recast', 250, async () => false)}
          />
          <TaskItem 
            id="fc_share"
            title="Share Mini App"
            reward={250}
            isCompleted={tasks['fc_share']}
            isLoading={loading === 'fc_share'}
            disabled={!hasFarcasterContext}
            helper={!hasFarcasterContext ? 'Available inside Farcaster mini app' : undefined}
            onClick={() => handleTask('fc_share', 250, async () => false)}
          />
        </div>

        {/* Group 2: Twitter / X */}
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
            onClick={() =>
              handleTask('x_login', 500, async () => {
                if (!xUsername || !xUsername.trim()) {
                  alert('Add your X username in the Profile tab first.');
                  return false;
                }
                return true;
              })
            }
          />
          
          {tasks['x_login'] && (
            <>
              <TaskItem 
                id="x_follow"
                title="Follow account on X"
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
                onClick={() =>
                  handleTask('x_follow', 500, async () => {
                    if (!xUsername || !xUsername.trim()) {
                      alert('Add your X username in the Profile tab first.');
                      return false;
                    }
                    window.open('https://x.com/BelgmNatur7704', '_blank');
                    return true;
                  })
                }
              />
              <TaskItem 
                id="x_like"
                title="Like Pinned Post"
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
                onClick={() =>
                  handleTask('x_like', 500, async () => {
                    if (!xUsername || !xUsername.trim()) {
                      alert('Add your X username in the Profile tab first.');
                      return false;
                    }
                    window.open('https://x.com/BelgmNatur7704/status/2011935189929226344', '_blank');
                    return true;
                  })
                }
              />
            </>
          )}
        </div>

        {/* Group 3: Base */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Base Network</h3>
          
          <TaskItem 
            id="base_connect"
            title="Connect Base Wallet"
            reward={500}
            isCompleted={tasks['base_connect'] || !!address} // Auto-complete if connected
            isLoading={loading === 'base_connect'}
            icon={<Wallet size={16} />}
            onClick={() => handleTask('base_connect', 500, async () => {
               if (!address) {
                 alert("Please connect your wallet first");
                 return false;
               }
               return true;
            })}
          />
          
          <TaskItem 
            id="base_tx"
            title="Execute 1 Transaction"
            reward={500}
            isCompleted={tasks['base_tx']}
            isLoading={loading === 'base_tx'}
            onClick={() => handleTask('base_tx', 500, async () => {
               const hasTx = await verifyBaseTx();
               if (!hasTx) {
                 alert("No transactions found for this address on Base Sepolia yet.");
                 return false;
               }
               return true;
            })}
          />
          
          <TaskItem 
            id="base_swap"
            title="Complete 1 Swap"
            reward={500}
            isCompleted={tasks['base_swap']}
            isLoading={loading === 'base_swap'}
            onClick={() => handleTask('base_swap', 500, async () => {
               // Reuse tx check for now, ideally check specific event
               const hasTx = await verifyBaseTx();
               if (!hasTx) {
                 alert("Please complete a swap first.");
                 return false;
               }
               return true;
            })}
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
        {helper && !isCompleted && (
          <div className="text-[10px] text-gray-400 mt-1">{helper}</div>
        )}
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

export default Earn;
