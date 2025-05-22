import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { getProductByID } from '../api/productApi';


const PRODUCT_API_URL = 'http://3.111.31.228:5000/api/v1/products';

const LowInventory = () => {
    const [lowInventoryProducts, setLowInventoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to get product details by product_id
    const getProductByID = async (product_id) => {
        try {
            const response = await axios.get(`${PRODUCT_API_URL}/products/${product_id}`);
            return response.data; // Assuming the API returns product details
        } catch (err) {
            console.error(`Error fetching product with ID ${product_id}:`, err);
            return null; // Return null if there is an error fetching product
        }
    };

    // Fetch products with quantity less than ROP when the component loads
    useEffect(() => {
        const fetchLowInventoryProducts = async () => {
            try {
                const response = await axios.get('http://3.111.31.228:5000/api/v1/analytics/getName');
                const productData = response.data;

                // Make API calls to get details for each product_id in the low inventory list
                const detailedProducts = await Promise.all(
                    productData.map(async (product) => {
                        const productDetails = await getProductByID(product.product_id);
                        return {
                            ...product,
                            product_name: productDetails?.product_name || 'Unknown', // Use "Unknown" if product details not found
                        };
                    })
                );

                setLowInventoryProducts(detailedProducts);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch low inventory products');
                setLoading(false);
            }
        };

        fetchLowInventoryProducts();
    }, []);

    return (
        <div className="p-6 bg-white rounded shadow-md">
            {/* <h1 className="text-2xl font-bold mb-4">Low Inventory Products</h1> */}

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : lowInventoryProducts.length === 0 ? (
                <p>No products have low inventory.</p>
            ) : (
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2">Product ID</th>
                            <th className="border px-4 py-2">Product Name</th>
                            <th className="border px-4 py-2">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowInventoryProducts.slice(0,2).map((product) => (
                            <tr key={product.product_id}>
                                <td className="border px-4 py-2">{product.product_id}</td>
                                <td className="border px-4 py-2">{product.product_name}</td>
                                <td className="border px-4 py-2">{product.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LowInventory;
