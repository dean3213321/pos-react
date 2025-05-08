import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/SIdebar.jsx';
import Dashboard from './Dashboard.jsx';
import Admin from './Admin.jsx';
import Category from './pages/Category.jsx';
import Items from './pages/Items.jsx';
import Inventory from './pages/Inventory.jsx';
import Schedules from './pages/Schedule.jsx';
import { useState } from 'react';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        <Navbar />
        <AppContent 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
    </Router>
  );
}

function AppContent({ selectedCategory, onSelectCategory }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                      location.pathname === '/category' || 
                      location.pathname === '/items' || 
                      location.pathname === '/inventory' || 
                      location.pathname === '/schedules';

  return (
    <div className="container-fluid h-100 p-0">
      <div className="row h-100 m-0">
        {!isAdminRoute && (
          <div className="col-md-3 col-lg-2 p-0 bg-light h-100">
            <Sidebar onSelect={onSelectCategory} />
          </div>
        )}
        <div className={`col-md-${isAdminRoute ? 12 : 9} col-lg-${isAdminRoute ? 12 : 10} p-0 h-100`}>
          <div className="h-100 overflow-auto p-3">
            <Routes>
              <Route path="/" element={<Dashboard selectedCategory={selectedCategory} />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/category" element={<Category />} />
              <Route path="/items" element={<Items />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/schedules" element={<Schedules />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;