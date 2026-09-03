import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Closet from './pages/Closet';
import Outfits from './pages/Outfits';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream text-ink">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Closet />} />
            <Route path="/outfits" element={<Outfits />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}