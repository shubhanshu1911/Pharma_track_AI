import React from 'react';
import InventoryList from '../components/Inventory/InventoryList';
import StockAlerts from '../components/Inventory/StockAlerts';

const InventoryPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Inventory</h1>
            <div className="grid grid-cols-2 gap-6">
                <InventoryList />
                <StockAlerts />
            </div>
        </div>
    );
};

export default InventoryPage;
