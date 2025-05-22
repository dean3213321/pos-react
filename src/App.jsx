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
import Wispay from './pages/Wispay.jsx';
import Transactions from './pages/Transactions.jsx';
import ScreencastPage from './pages/ScreencastPage.jsx';
import { useState } from 'react';
import { WispayProvider } from './utils/WispayContext.jsx';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <WispayProvider>
      <Router>
        <MainLayout 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Router>
    </WispayProvider>
  );
}

function MainLayout({ selectedCategory, onSelectCategory }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/screencast';

  return (
    <div className="d-flex flex-column vh-100">
      {showNavbar && <Navbar />}
      <AppContent 
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
    </div>
  );
}

function AppContent({ selectedCategory, onSelectCategory }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname === '/category' || 
                       location.pathname === '/items' || 
                       location.pathname === '/Wispay' || 
                       location.pathname === '/Transactions' || 
                       location.pathname === '/screencast';

  return (
    <div className="container-fluid h-100 p-0">
      <div className="row h-100 m-0">
        {!isAdminRoute && (
          <div className="col-md-3 col-lg-2 p-0 bg-light h-100">
            <Sidebar onSelect={onSelectCategory} />
          </div>
        )}
        <div className={`col-md-${isAdminRoute ? 12 : 9} col-lg-${isAdminRoute ? 12 : 10} p-0 h-100`}>
          <div className={`h-100 ${location.pathname === '/screencast' ? 'overflow-hidden' : 'overflow-auto'} p-3`}>
            <Routes>
              <Route path="/" element={<Dashboard selectedCategory={selectedCategory} />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/category" element={<Category />} />
              <Route path="/items" element={<Items />} />
              <Route path="/Wispay" element={<Wispay />} />
              <Route path="/Transactions" element={<Transactions />} />
              <Route path="/screencast" element={<ScreencastPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
