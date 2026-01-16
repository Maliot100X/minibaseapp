import React from 'react';
import { Twitter } from 'lucide-react';

const TwitterFeed: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
            <Twitter size={18} className="text-white" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-sm font-semibold text-white">Twitter / X Tasks</div>
          <p className="text-[13px] text-gray-300">
            Add your X username in the Profile tab, then use the Tasks tab to confirm your X connection,
            follow the official Signal account (@BelgmNatur7704), and like the pinned post (ID 2011935189929226344)
            to earn bonus points.
          </p>
          <p className="text-[11px] text-gray-500">
            No OAuth is required. Tasks rely on your saved username and links out to X when needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwitterFeed;
