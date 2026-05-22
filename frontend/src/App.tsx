import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MintPage from './pages/MintPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HistoryPage from './pages/HistoryPage';
import { Toaster } from './components/ui/toaster';
import Scene3D from './components/3d/Scene3D';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number,number,number,number] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/"              element={<LandingPage />} />
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/mint"          element={<MintPage />} />
          <Route path="/ai-assistant"  element={<AIAssistantPage />} />
          <Route path="/history"       element={<HistoryPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="film-grain" />
      <div className="ambient-glow" />
      <div className="grid-floor" />
      <Scene3D />
      <div className="relative min-h-screen text-white">
        <AnimatedRoutes />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
