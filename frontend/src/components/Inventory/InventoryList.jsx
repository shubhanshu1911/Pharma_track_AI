import React, { useEffect, useState } from 'react';
import { getAllInventory } from '../../api/inventoryApi';
import { getProductByID } from '../../api/productApi';  // Import the function to get product details

const InventoryList = () => {
    const [inventory, setInventory] = useState([]);
    const [inventoryWithNames, setInventoryWithNames] = useState([]); // State to hold inventory with product names
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            const response = await getAllInventory();
            const inventoryData = response.data;

            // Fetch product names for each inventory item
            const inventoryWithNames = await Promise.all(
                inventoryData.map(async (item) => {
                    try {
                        const productResponse = await getProductByID(item.product_id);
                        return { ...item, product_name: productResponse.data.product_name }; // Add product name to item
                    } catch (error) {
                        console.error('Error fetching product name:', error);
                        return { ...item, product_name: 'Unknown' }; // Fallback if fetch fails
                    }
                })
            );

            setInventoryWithNames(inventoryWithNames);
            setLoading(false);
        };

        fetchInventory();
    }, []);

    if (loading) return <div>Loading inventory...</div>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Inventory List</h2>
            <ul className="space-y-4">
                {inventoryWithNames.map(item => (
                    <li key={item.id} className="bg-white p-4 rounded shadow-md">
                        <div>Product Name: {item.product_name}</div> {/* Display product name */}
                        <div>Stock: {item.quantity}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;
