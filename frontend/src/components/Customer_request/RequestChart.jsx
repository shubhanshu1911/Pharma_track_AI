import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequestTable = () => {
    const [groupedRequestData, setGroupedRequestData] = useState({});

    useEffect(() => {
        const fetchRequestData = async () => {
            try {
                const requestsResponse = await axios.get('http://3.111.31.228:5000/api/v1/request/requests');
                const requestsData = requestsResponse.data;

                const productIds = [...new Set(requestsData.map((request) => request.product_id))];
                const productPromises = productIds.map(product_id =>
                    axios.get(`http://3.111.31.228:5000/api/v1/products/products/${product_id}`)
                );

                const productsResponses = await Promise.all(productPromises);

                const productMap = {};
                productsResponses.forEach(response => {
                    const product = response.data;
                    productMap[product.product_id] = product.product_name;
                });

                // Format the request data with product names
                const formattedData = requestsData.map((request) => ({
                    product_name: productMap[request.product_id],
                    quantity_requested: request.quantity_requested,
                    request_date: new Date(request.request_date).toLocaleDateString(), // Format date for easier grouping
                }));

                // Group data by request_date
                const groupedData = formattedData.reduce((acc, request) => {
                    const { request_date } = request;
                    if (!acc[request_date]) {
                        acc[request_date] = [];
                    }
                    acc[request_date].push(request);
                    return acc;
                }, {});

                setGroupedRequestData(groupedData);
            } catch (error) {
                console.error('Error fetching request data:', error);
            }
        };

        fetchRequestData();
    }, []);

    return (
        <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Request Data Grouped by Date</h2>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Request Date</th>
                        <th className="px-4 py-2">Product Name</th>
                        <th className="px-4 py-2">Quantity Requested</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(groupedRequestData).map((date) => (
                        <React.Fragment key={date}>
                            <tr className="bg-gray-300">
                                <td className="border px-4 py-2 font-semibold" colSpan={3}>
                                    {date}
                                </td>
                            </tr>
                            {groupedRequestData[date].map((request, index) => (
                                <tr key={index} className="bg-gray-100 hover:bg-gray-200">
                                    <td className="border px-4 py-2"></td>
                                    <td className="border px-4 py-2">{request.product_name}</td>
                                    <td className="border px-4 py-2">{request.quantity_requested}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestTable;
