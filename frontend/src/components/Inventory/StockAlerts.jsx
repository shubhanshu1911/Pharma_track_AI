import React, { useEffect, useState } from 'react';
import { getAllInventory } from '../../api/inventoryApi';
import { getProductByID } from '../../api/productApi';  // Import the function to get product details

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [productNames, setProductNames] = useState({}); // State to store product names

    useEffect(() => {
        const fetchAlerts = async () => {
            const response = await getAllInventory();
            // Filter alerts based on quantity and reorder level
            const lowStockAlerts = response.data.filter(alert => alert.quantity < alert.reorder_level);
            setAlerts(lowStockAlerts);

            // Fetch product names for the filtered alerts
            const names = {};
            for (const alert of lowStockAlerts) {
                try {
                    const productResponse = await getProductByID(alert.product_id); // Fetch product name by product_id
                    names[alert.product_id] = productResponse.data.product_name; // Store the product name
                } catch (error) {
                    console.error('Error fetching product name:', error);
                    names[alert.product_id] = 'Unknown'; // Fallback if fetch fails
                }
            }
            setProductNames(names); // Update state with product names
        };

        fetchAlerts();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
            <ul className="space-y-4">
                {alerts.map(alert => (
                    <li key={alert.product_id} className="bg-red-100 p-4 rounded shadow-md">
                        <div>Product Name: {productNames[alert.product_id] || 'Loading...'}</div> {/* Display product name */}
                        <div>Quantity: {alert.quantity}</div>
                        <div>Reorder Level: {alert.reorder_level}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockAlerts;
