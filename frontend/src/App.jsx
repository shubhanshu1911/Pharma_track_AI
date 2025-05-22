import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import CustomerRequest from './pages/CustomerRequest';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HealingIcon from '@mui/icons-material/Healing';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import InventoryIcon from '@mui/icons-material/Inventory';

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Vertical navigation bar */}
        <nav className="bg-black text-white w-50 p-3">
          <div className="mb-5 mt-3 text-xl">
            <h1 > <HealingIcon /> PharmaTrackAI</h1>
          </div>
          <ul className="space-y-4">
            <li><Link to="/" className="block hover:bg-neutral-500 p-2 rounded">
              <DashboardIcon/> Overview
            </Link></li>
            <li><Link to="/orders" className="block hover:bg-neutral-500 p-2 rounded">
              <AddBusinessIcon /> Orders
            </Link></li>
            <li><Link to="/sales" className="block hover:bg-neutral-500 p-2 rounded">
              <InsightsIcon /> Sales
            </Link></li>
            <li><Link to="/inventory" className="block hover:bg-neutral-500 p-2 rounded">
              <InventoryIcon/> Inventory
            </Link></li>
            <li><Link to="/CustomerRequest" className="block hover:bg-neutral-500 p-2 rounded">
              <PeopleAltIcon /> Customer Request
            </Link></li>
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-grow p-8 bg-neutral-100">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/CustomerRequest" element={<CustomerRequest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
