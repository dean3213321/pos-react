// src/App.js
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './components/Navbar';
import Sidebar from './components/SIdebar';
import Dashboard from './Dashboard';
import Admin from './Admin';
import Category from './pages/Category';
import Items from './pages/Items';
import Wispay from './pages/Wispay';
import Transactions from './pages/Transactions';
import ScreencastPage from './pages/ScreencastPage';
import { useState } from 'react';
import { WispayProvider } from './utils/WispayContext';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <WispayProvider>
      <AuthProvider>
        <Router>
          <MainLayout 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </Router>
      </AuthProvider>
    </WispayProvider>
  );
}

function MainLayout({ selectedCategory, onSelectCategory }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/screencast';
  const showSidebar = location.pathname !== '/screencast' && 
                     !location.pathname.startsWith('/admin') &&
                     location.pathname !== '/category' && 
                     location.pathname !== '/items' && 
                     location.pathname !== '/Wispay' && 
                     location.pathname !== '/Transactions';

  return (
    <div className="d-flex flex-column vh-100">
      {showNavbar && <Navbar />}
      <AppContent 
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        showSidebar={showSidebar}
      />
    </div>
  );
}

function AppContent({ selectedCategory, onSelectCategory, showSidebar }) {
  const location = useLocation();

  return (
    <div className="container-fluid h-100 p-0">
      <div className="row h-100 m-0">
        {showSidebar && (
          <div className="col-md-3 col-lg-2 p-0 bg-light h-100">
            <Sidebar onSelect={onSelectCategory} />
          </div>
        )}
        <div className={`col-md-${showSidebar ? 9 : 12} col-lg-${showSidebar ? 10 : 12} p-0 h-100`}>
          <div className={`h-100 ${location.pathname === '/screencast' ? 'overflow-hidden' : 'overflow-auto'} p-3`}>
            <Routes>
              <Route path="/" element={<Dashboard selectedCategory={selectedCategory} />} />
              <Route path="/screencast" element={<ScreencastPage />} />
              
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
              <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
              <Route path="/Wispay" element={<ProtectedRoute><Wispay /></ProtectedRoute>} />
              <Route path="/Transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;