import React, { useEffect, useState } from 'react';
import { getAllSales, deleteSale } from '../../api/salesApi'; // Import the deleteSale function
import { getProductByID } from '../../api/productApi';
import DeleteIcon from '@mui/icons-material/Delete';

const SalesList = () => {
    const [salesWithProductNames, setSalesWithProductNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    // Fetch sales and map product names only once
    useEffect(() => {
        if (!hasFetched) {
            const fetchSales = async () => {
                try {
                    const salesResponse = await getAllSales();
                    const salesData = salesResponse.data;

                    // For each sale, fetch the corresponding product name by product_id
                    const salesWithNames = await Promise.all(
                        salesData.map(async (sale) => {
                            try {
                                const productResponse = await getProductByID(sale.product_id);
                                const product = productResponse.data;
                                return { ...sale, product_name: product.product_name };
                            } catch (error) {
                                console.error('Error fetching product name:', error);
                                return { ...sale, product_name: 'Unknown' };
                            }
                        })
                    );

                    setSalesWithProductNames(salesWithNames);
                    setLoading(false);
                    setHasFetched(true);
                } catch (error) {
                    console.error('Error fetching sales:', error);
                }
            };

            fetchSales();
        }
    }, [hasFetched]);

    // Function to delete a sale
    const handleDeleteSale = async (sale_id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await deleteSale(sale_id); // Call the delete function
                setSalesWithProductNames((prevSales) =>
                    prevSales.filter((sale) => sale.sale_id !== sale_id) // Remove deleted sale from state
                );
            } catch (error) {
                console.error('Error deleting sale:', error);
            }
        }
    };

    if (loading) return <div>Loading sales...</div>;

    // Get the index of the latest entry in the sales list
    const latestIndex = salesWithProductNames.length - 1;

    return (
        <div style={{ height: '600px', overflowY: 'auto' }}>
            <h2 className="text-xl font-semibold mb-4">Sales List</h2>
            <ul className="space-y-4 ">
                {salesWithProductNames.map((sale, index) => {
                    const saleDate = new Date(sale.sale_date);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = saleDate.toLocaleDateString(undefined, options);
                    const isLatest = latestIndex === salesWithProductNames.length - 1 - index;

                    return (
                        <li
                            key={sale.sale_id}
                            className={`relative bg-white p-4 rounded shadow-md ${isLatest ? 'border-2 border-blue-500' : ''}`} // Make the container relative
                        >
                            <div>
                                <div>Product Name: {sale.product_name}</div>
                                <div>Quantity Sold: {sale.quantity_sold}</div>
                                <div>Customer: {sale.customer_name}</div>
                                <div>Sold on: {formattedDate}</div>
                                <div>Total Amount: {sale.total_amount}</div>
                            </div>

                            {/* Add delete button in the top-right corner */}
                            <button
                                onClick={() => handleDeleteSale(sale.sale_id)} // Call delete handler
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                            >
                                <DeleteIcon />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SalesList;
