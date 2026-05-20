import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MintPage from './pages/MintPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HistoryPage from './pages/HistoryPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mint" element={<MintPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
