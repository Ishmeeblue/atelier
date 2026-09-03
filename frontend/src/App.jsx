import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Closet from './pages/Closet';
import Outfits from './pages/Outfits';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream text-ink">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Closet />} />
            <Route path="/outfits" element={<Outfits />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}