import { parseAbiItem } from 'viem';
import { publicClient } from './wagmi';
import { SIGNAL_ADDRESS } from './contracts';

export interface ClaimLog {
  user: `0x${string}`;
  amount: bigint;
}

export const fetchClaimLogs = async (fromBlock: bigint | 'earliest', toBlock?: bigint) => {
  const logs = await publicClient.getLogs({
    address: SIGNAL_ADDRESS,
    event: parseAbiItem('event Claim(address indexed user, uint256 amount)'),
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    user: log.args.user as `0x${string}`,
    amount: log.args.amount as bigint,
  }));
};

