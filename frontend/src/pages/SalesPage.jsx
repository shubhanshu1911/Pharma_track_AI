import React from 'react';
import SalesList from '../components/Sales/SalesList';
import SalesForm from '../components/Sales/SalesForm';

const SalesPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Sales</h1>
            <div className="grid grid-cols-2 gap-3">
                <SalesList />
                <SalesForm />
            </div>
        </div>
    );
};

export default SalesPage;
