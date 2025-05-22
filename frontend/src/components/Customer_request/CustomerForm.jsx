import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RequestForm = () => {
    const [requestData, setRequestData] = useState({
        customer_name: '',
        product_id: '',
        quantity_requested: '',
        request_date: '',
        supplier_id: '',
    });
    const [productName, setProductName] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quantityError, setQuantityError] = useState(null); // Error state for quantity validation
    const [dateError, setDateError] = useState(null); // Error state for date validation

    // Fetch product suggestions based on user input
    const fetchProductSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://3.111.31.228:5000/api/v1/products/products?query=${query}`);
            setSuggestions(response.data);  // Adjust API response as needed
        } catch (error) {
            console.error('Error fetching product suggestions:', error);
            setError('Failed to fetch product suggestions');
        } finally {
            setLoading(false);
        }
    };

    // Handle product name change and fetch suggestions
    const handleProductNameChange = (e) => {
        const value = e.target.value;
        setProductName(value);
        fetchProductSuggestions(value);
    };

    // Fetch suppliers for the selected product
    const fetchSuppliers = async () => {
        if (!requestData.product_id) return;

        try {
            const response = await axios.get(`http://3.111.31.228:5000/api/v1/orders/suppliers/${requestData.product_id}`);
            setSuppliers(response.data);  // Adjust based on API response
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    // Fetch suppliers when a product is selected
    useEffect(() => {
        if (requestData.product_id) {
            fetchSuppliers();
        }
    }, [requestData.product_id]);

    // Check if the date is in the future
    const isFutureDate = (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        return selectedDate > today;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            alert("Please select a supplier before placing the request.");
            return;
        }

        if (quantityError || dateError) {
            alert('Please fix the errors before submitting.');
            return;
        }

        try {
            // Submit form data with all required fields
            await axios.post('http://3.111.31.228:5000/api/v1/request/add-request', {
                ...requestData,
            });

            alert('Request submitted successfully!');
            // Clear form fields
            setProductName('');
            setRequestData({ customer_name: '', product_id: '', quantity_requested: '', request_date: '', supplier_id: '' });
            setSelectedSupplier(null);
            setSuppliers([]);
            setSuggestions([]);
        } catch (err) {
            console.error('Error placing request:', err);
            setError('Failed to place request');
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (product) => {
        setProductName(product.product_name);
        setRequestData({ ...requestData, product_id: product.product_id });
        setSuggestions([]);
    };

    // Handle supplier click
    const handleSupplierClick = (supplier) => {
        setSelectedSupplier(supplier);
        setRequestData({ ...requestData, supplier_id: supplier.supplier_id });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md" style={{ height: '600px', overflowY: 'auto' }}>
            <h2 className="text-xl font-semibold mb-4">Submit Customer Request</h2>

            <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={requestData.customer_name}
                onChange={e => setRequestData({ ...requestData, customer_name: e.target.value })}
                className="border p-2 w-full mb-4"
            />

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
                                Supplier Name: {supplier.supplier_name}, Cost per unit: {supplier.cost_price}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No suppliers available for the selected product.</p>
            )}

            <input
                type="number"
                placeholder="Quantity Requested"
                value={requestData.quantity_requested}
                onChange={e => {
                    const value = parseInt(e.target.value, 10);
                    if (value < 0 || isNaN(value)) {
                        setQuantityError('Quantity must be a positive integer.');
                        setRequestData({ ...requestData, quantity_requested: '' });
                    } else {
                        setQuantityError(null);
                        setRequestData({ ...requestData, quantity_requested: value });
                    }
                }}
                className="border p-2 w-full mb-4"
            />
            {quantityError && <p className="text-red-500">{quantityError}</p>}

            <input
                type="date"
                placeholder="Request Date"
                value={requestData.request_date}
                onChange={e => {
                    const date = e.target.value;
                    if (isFutureDate(date)) {
                        setDateError('Request date cannot be in the future.');
                    } else {
                        setDateError(null);
                        setRequestData({ ...requestData, request_date: date });
                    }
                }}
                className="border p-2 w-full mb-4"
            />
            {dateError && <p className="text-red-500">{dateError}</p>}

            {selectedSupplier && (
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded mt-4">
                    Submit Request
                </button>
            )}
        </form>
    );
};

export default RequestForm;
