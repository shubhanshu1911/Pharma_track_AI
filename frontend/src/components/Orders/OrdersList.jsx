import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/ordersApi';
import OrderItem from './OrderItem';
import { getProductByID } from '../../api/productApi';

const OrdersList = () => {
    const [ordersWithProductNames, setOrdersWithProductNames] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getAllOrders();
                const ordersData = response.data;

                const ordersWithNames = await Promise.all(
                    ordersData.map(async (order) => {
                        try {
                            const productResponse = await getProductByID(order.product_id);
                            const product = productResponse.data;
                            return { ...order, product_name: product.product_name };
                        } catch (error) {
                            console.error('Error fetching product name:', error);
                            return { ...order, product_name: 'Unknown' };
                        }
                    })
                );

                setOrdersWithProductNames(ordersWithNames);
                setLoading(false);
            } catch (error) {
                setError('Error fetching orders. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleUpdateOrderStatus = async (orderId, updatedData) => {
        try {
            setOrdersWithProductNames((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId
                        ? { ...order, ...updatedData, actual_delivery_date: updatedData.actual_delivery_date || order.actual_delivery_date }
                        : order
                )
            );

            await updateOrderStatus(orderId, updatedData);
        } catch (error) {
            setError('Error updating order status. Please try again later.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await deleteOrder(orderId);

            // Remove the deleted order from the state
            setOrdersWithProductNames((prevOrders) =>
                prevOrders.filter((order) => order.order_id !== orderId)
            );
        } catch (error) {
            setError('Error deleting order. Please try again later.');
        }
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const latestIndex = ordersWithProductNames.length - 1;

    return (
        <div style={{ height: '600px', overflowY: 'auto' }}>
            <h2 className="text-xl font-semibold mb-4">Orders List</h2>
            <ul className="space-y-4">
                {ordersWithProductNames.map((order, index) => (
                    <OrderItem
                        key={order.order_id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                        onDeleteOrder={handleDeleteOrder}
                        isLatest={latestIndex === ordersWithProductNames.length - 1 - index}
                    />
                ))}
            </ul>
        </div>
    );
};

export default OrdersList;
