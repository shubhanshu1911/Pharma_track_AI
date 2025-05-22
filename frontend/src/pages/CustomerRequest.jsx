import React from 'react';
import CustomerForm from '../components/Customer_request/CustomerForm';
import RequestChart from '../components/Customer_request/RequestChart';

const InventoryPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Customer Request</h1>
            <div className="grid grid-cols-2 gap-6">
                <RequestChart />
                <CustomerForm />
            </div>
        </div>
    );
};

export default InventoryPage;
