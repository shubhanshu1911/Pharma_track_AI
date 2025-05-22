import React, { useState, useEffect } from 'react';
import { getProductByID } from '../../api/productApi';
import DeleteIcon from '@mui/icons-material/Delete';

const OrderItem = ({ order, onUpdateStatus, isLatest, onDeleteOrder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState(order.status);
    const [actualDeliveryDate, setActualDeliveryDate] = useState(order.actual_delivery_date || '');
    const [productName, setProductName] = useState('');
    const [isEditable, setIsEditable] = useState(!order.actual_delivery_date);

    useEffect(() => {
        const fetchProductName = async () => {
            try {
                const response = await getProductByID(order.product_id);
                setProductName(response.data.product_name);
            } catch (error) {
                console.error('Error fetching product name:', error);
                setProductName('Unknown');
            }
        };

        fetchProductName();
    }, [order.product_id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not delivered yet';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleSubmit = () => {
        const updatedData = {
            status,
            actual_delivery_date: status === 'delivered' ? actualDeliveryDate : null,
        };

        onUpdateStatus(order.order_id, updatedData)
            .then(() => {
                setIsEditing(false);
                setIsEditable(false);
            })
            .catch((err) => console.error('Failed to update order status:', err));
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            onDeleteOrder(order.order_id);
        }
    };

    return (
        <li className={`bg-white p-4 rounded shadow-md relative ${isLatest ? 'border-2 border-blue-500' : ''}`}>
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                aria-label="Delete order"
            >
                <DeleteIcon/>
            </button>

            <div>Product Name: {productName}</div>
            <div>Order Date: {formatDate(order.order_date)}</div>
            <div>Total Cost: {order.total_cost}</div>
            <div>Quantity: {order.quantity}</div>
            <div>Actual Delivery Date: {formatDate(order.actual_delivery_date)}</div>
            <div>Claimed Lead Time: {order.claimed_lead_time}</div>
            <div>Actual Lead Time: {order.actual_lead_time}</div>
            <div>Status: {order.status}</div>

            {isEditing ? (
                <div className="mt-4">
                    <div className="mb-2">
                        <label className="block">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 w-full">
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {status === 'delivered' && (
                        <div className="mb-2">
                            <label className="block">Actual Delivery Date</label>
                            <input
                                type="date"
                                value={actualDeliveryDate}
                                onChange={(e) => setActualDeliveryDate(e.target.value)}
                                className="border p-2 w-full"
                                required
                            />
                        </div>
                    )}

                    <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 px-4 rounded mt-4">Update Status</button>
                    <button onClick={() => setIsEditing(false)} className="ml-4 bg-gray-600 text-white py-2 px-4 rounded mt-4">Cancel</button>
                </div>
            ) : (
                isEditable && (
                    <button onClick={() => setIsEditing(true)} className="bg-green-600 text-white py-2 px-4 rounded mt-4">Edit Order</button>
                )
            )}

            {!isEditable && <p className="text-gray-600 mt-4">Order already updated</p>}
        </li>
    );
};

export default OrderItem;
