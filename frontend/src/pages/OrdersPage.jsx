import React from 'react';
import OrdersList from '../components/Orders/OrdersList';
import OrderForm from '../components/Orders/OrderForm';

const OrdersPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
            <div className="grid grid-cols-2 gap-3">
                <OrdersList />
                <OrderForm />
            </div>
        </div>
    );
};

export default OrdersPage;
