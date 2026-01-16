import { useState, useEffect } from 'react';
import { SIGNAL_TOKEN_ADDRESS } from '../config/contracts';

interface Holder {
  address: string;
  value: string; // raw value
}

export const useLeaderboard = () => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolders = async () => {
    setLoading(true);
    try {
      // Using Blockscout API (Etherscan compatible)
      const response = await fetch(
        `https://base-sepolia.blockscout.com/api?module=token&action=getTokenHolders&contractaddress=${SIGNAL_TOKEN_ADDRESS}&page=1&offset=20&apikey=${import.meta.env.VITE_BLOCKSCOUT_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === "1" && Array.isArray(data.result)) {
        setHolders(data.result);
      } else {
        // Fallback or handle API differences. Blockscout V2 API might be different.
        // Trying V2 API if V1 fails or returns empty (Blockscout often has /api/v2)
        // But the prompt gave an API key, usually for the standard API.
        console.warn("API returned:", data);
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolders();
  }, []);

  return { holders, loading, error };
};
