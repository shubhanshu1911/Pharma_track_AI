import React, { useState, useEffect } from 'react';
import { placeOrder } from '../../api/ordersApi';
import axios from 'axios';

const OrderForm = () => {
    const [orderData, setOrderData] = useState({
        product_id: '',
        quantity: '',
        order_date: '',
        claimed_lead_time: '',
        supplier_id: '',
    });
    const [productName, setProductName] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leadTimeError, setLeadTimeError] = useState(null);

    const fetchProductSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://3.111.31.228:5000/api/v1/products/products?query=${query}`);
            console.log(response);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching product suggestions:', error);
            setError('Failed to fetch product suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleProductNameChange = (e) => {
        const value = e.target.value;
        setProductName(value);
        fetchProductSuggestions(value);
    };

    const fetchSuppliers = async () => {
        if (!orderData.product_id) return;
        try {
            const response = await axios.get(`http://3.111.31.228:5000/api/v1/orders/suppliers/${orderData.product_id}`);
            setSuppliers(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    useEffect(() => {
        if (orderData.product_id) {
            fetchSuppliers();
        }
    }, [orderData.product_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!selectedSupplier) {
            alert("Please select a supplier before placing the order.");
            return;
        }
        try {
            await placeOrder({ ...orderData, supplier_id: selectedSupplier.supplier_id });
            alert('Order placed successfully!');
            setProductName('');
            setOrderData({ product_id: '', quantity: '', order_date: '', claimed_lead_time: '', supplier_id: '' });
            setSelectedSupplier(null);
            setSuppliers([]);
            setSuggestions([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false); // Reset isSubmitting
        }
    };

    const handleSuggestionClick = (product) => {
        setProductName(product.product_name);
        setOrderData({ ...orderData, product_id: product.product_id });
        setSuggestions([]);
    };

    const handleSupplierClick = (supplier) => {
        setSelectedSupplier(supplier);
        setOrderData({ ...orderData, supplier_id: supplier.supplier_id });
    };

    // Check for negative quantity input
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 0) {
            setOrderData({ ...orderData, quantity: value });
        } else {
            alert("Quantity cannot be negative!");
        }
    };

    // Check for future dates in the order date
    const handleOrderDateChange = (e) => {
        const selectedDate = new Date(e.target.value).setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to midnight to compare only the date
        if (selectedDate > today) {
            alert("Order date cannot be in the future!");
        } else {
            setOrderData({ ...orderData, order_date: e.target.value });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md" style={{ height: '600px'}}>
            <h2 className="text-xl font-semibold mb-4">Place New Order</h2>
            <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={handleProductNameChange}
                className="border p-2 w-full mb-4"
            />
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading suggestions...</p>}
            {suggestions.length > 0 && (
                <ul className="border border-gray-300 rounded mt-2">
                    {suggestions.map(product => (
                        <li
                            key={product.product_id}
                            onClick={() => handleSuggestionClick(product)}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                        >
                            {product.product_name}
                        </li>
                    ))}
                </ul>
            )}
            {suppliers.length > 0 ? (
                <div className="bg-white border border-gray-300 rounded p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">Suppliers:</h3>
                    <ul>
                        {suppliers.map(supplier => (
                            <li
                                key={supplier.supplier_id}
                                onClick={() => handleSupplierClick(supplier)}
                                className={`mb-2 cursor-pointer hover:bg-gray-200 ${selectedSupplier?.supplier_id === supplier.supplier_id ? 'bg-blue-100' : ''}`}
                            >
                                Supplier Name: {supplier.supplier_name}, cost per strip: {supplier.cost_price}, Reliability score: {supplier.supplier_score}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No suppliers available for the selected product.</p>
            )}
            <input
                type="number"
                placeholder="Quantity"
                value={orderData.quantity}
                onChange={handleQuantityChange} // Validate quantity input
                className="border p-2 w-full mb-4"
            />
            <input
                type="date"
                placeholder="Order Date"
                value={orderData.order_date}
                onChange={handleOrderDateChange} // Validate date input
                className="border p-2 w-full mb-4"
            />
            <input
                type="number"
                placeholder="Lead time (days)"
                value={orderData.claimed_lead_time}
                onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value < 0) {
                        setLeadTimeError('Lead time cannot be negative.');
                        setOrderData({ ...orderData, claimed_lead_time: '' }); // Reset value if negative
                    } else {
                        setLeadTimeError(null);
                        setOrderData({ ...orderData, claimed_lead_time: value });
                    }
                }}
                className="border p-2 w-full mb-4"
            />
            {leadTimeError && <p className="text-red-500">{leadTimeError}</p>}
            {selectedSupplier && (
                <button
                    type="submit"
                    className={`bg-blue-600 text-white py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Recording...' : 'Place Order'}
                </button>
            )}
        </form>
    );
};

export default OrderForm;
