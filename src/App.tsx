import { useState } from 'react';
import Layout, { type AppTab } from './components/Layout';
import Mine from './tabs/Mine';
import Stake from './pages/Stake';
import Swap from './pages/Swap';
import Boost from './pages/Boost';
import Tiers from './pages/Tiers';
import Leaderboard from './pages/Leaderboard';
import Tasks from './pages/Tasks';
import Whitepaper from './pages/Whitepaper';
import More from './pages/More';
import Profile from './pages/Profile';

function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('miner');

  return (
    <Layout currentTab={currentTab} onChangeTab={setCurrentTab}>
      {currentTab === 'miner' && <Mine onNavigate={setCurrentTab} />}
      {currentTab === 'tiers' && <Tiers />}
      {currentTab === 'stake' && <Stake />}
      {currentTab === 'swap' && <Swap />}
      {currentTab === 'boost' && <Boost />}
      {currentTab === 'leaderboard' && <Leaderboard />}
      {currentTab === 'tasks' && <Tasks />}
      {currentTab === 'whitepaper' && <Whitepaper />}
      {currentTab === 'more' && <More />}
      {currentTab === 'profile' && <Profile />}
    </Layout>
  );
}

export default App;
