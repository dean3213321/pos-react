import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/SIdebar.jsx';
import Dashboard from './Dashboard.jsx';
import Admin from './Admin.jsx';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        <Navbar />
        <AppContent />
      </div>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="container-fluid h-100 p-0">
      <div className="row h-100 m-0">
        {!isAdminPage && (
          <div className="col-md-3 col-lg-2 p-0 bg-light h-100">
            <Sidebar />
          </div>
        )}
        <div className={`col-md-${isAdminPage ? 12 : 9} col-lg-${isAdminPage ? 12 : 10} p-0 h-100`}>
          <div className="h-100 overflow-auto p-3">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;