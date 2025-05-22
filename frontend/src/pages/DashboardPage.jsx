import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSales, getPendingOrderCount, getStockAlerts, getYearlyRevenue } from '../api/analyticsApi';
import MonthlySalesChart from './MonthlySalesChart';
import LowInventory from './LowInventory';
import axios from 'axios';
import Chatbot from './Chatbot';  // Import the Chatbot
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [totalSales, setTotalSales] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [lowStockAlerts, setLowStockAlerts] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [demandData, setDemandData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const year = 2023;
                const salesData = await getSales(year);
                setTotalSales(salesData.totalRevenue);

                const pendingOrdersData = await getPendingOrderCount();
                setPendingOrders(pendingOrdersData.pendingOrderCount);

                const stockAlertsData = await getStockAlerts();
                setLowStockAlerts(stockAlertsData.length);

                const revenueData = await getYearlyRevenue('2023-01-01', '2023-12-31');
                setRevenue(revenueData.total_revenue || 0);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const fetchDemandData = async () => {
            try {
                const response = await axios.get('http://3.111.31.228:8000/product-demand?week=5');
                const demandResponse = Object.entries(response.data).map(([productName, { demand }]) => ({
                    productName,
                    demand,
                }));
                setDemandData(demandResponse);
            } catch (error) {
                console.error('Error fetching demand data:', error);
            }
        };

        fetchData();
        fetchDemandData();
    }, []);

    return (
        <div className="container mx-auto p-2 h-screen flex flex-col justify-between">
            <h1 className="text-2xl font-bold mb-2">Overview</h1>

            {/* Flex container to hold cards and charts */}
            <div className="flex space-x-2 h-full">
                {/* Cards section */}
                <div className="flex flex-col space-y-2 w-1/3">
                    <div className="bg-blue-200 hover:bg-blue-300 p-2 rounded-lg shadow-md transition duration-300 flex-1">
                        <h2 className="text-md font-semibold">Total Sales (Yearly)</h2>
                        <p className="text-xl mt-1">₹ {totalSales}</p>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                            className="text-left bg-green-300 hover:bg-green-400 p-2 rounded-lg shadow-md transition duration-300 flex-1"
                            to="./Orders"    
                        >
                            <h2 className="text-md font-semibold">Pending Orders</h2>
                            <p className="text-xl mt-1">{pendingOrders}</p>
                        </Link>
                        <Link 
                            className="bg-yellow-200 hover:bg-yellow-300 p-2 rounded-lg shadow-md transition duration-300 flex-1"
                            to = "./inventory"
                        >
                            <h2 className="text-md font-semibold">Low Stock Alerts</h2>
                            <p className="text-xl mt-1">{lowStockAlerts}</p>
                        </Link>
                    </div>


                    {/* Monthly Sales Chart should appear below cards */}
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <MonthlySalesChart year={2023} />
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right section for the demand chart */}
                <div className="w-2/3 flex flex-col space-y-2">
                    <div className="bg-white shadow p-2 rounded-lg flex-1">
                        <h2 className="text-md font-semibold mb-1">Predicted Demands of Upcoming Week</h2>
                        <ResponsiveContainer width="100%" height = {300}>
                            <BarChart data={demandData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="productName" tick={false} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="demand" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Placeholder for Low Inventory Table */}
                    <div className="bg-white shadow p-2 rounded-lg flex-1">
                        <h1 className="text-md font-semibold mb-1">Low Inventory Table</h1>
                        {/* Low Inventory Table will be added here */}
                        <LowInventory />
                    </div>
                </div>
            </div>

            {/* Chatbot */}
            <div className="mt-2 h-24">
                <Chatbot />
            </div>
        </div>
    );
};

export default DashboardPage;
