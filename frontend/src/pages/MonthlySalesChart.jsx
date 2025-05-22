import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlySalesChart = ({ year }) => {
    const [monthlySalesData, setMonthlySalesData] = useState([]);
    const [demandData, setDemandData] = useState([]);
    const API_URL = 'http://3.111.31.228:5000/api/v1/analytics';

    useEffect(() => {
        const fetchMonthlySales = async () => {
            try {
                const response = await axios.get(`${API_URL}/sales-by-year/${year}`);
                const salesData = response.data.monthlySalesBreakdown.map((revenue, index) => ({
                    month: index + 1,
                    monthly_revenue: parseFloat(revenue), // Convert string to float
                }));
                // Filter to show only the first 4 months
                const filteredSalesData = salesData.filter(data => data.month <= 4);
                setMonthlySalesData(filteredSalesData);
                console.log(filteredSalesData);
            } catch (error) {
                console.error('Error fetching monthly sales data:', error);
            }
        };

        const fetchDemandData = async () => {
            try {
                const response = await axios.get('http://3.111.31.228:8000/product-demand?week=5');
                console.log('API Response:', response.data); // Log the response for debugging
                const demandResponse = Object.entries(response.data).map(([productName, { demand }]) => ({
                    productName,
                    demand,
                }));
                setDemandData(demandResponse);
            } catch (error) {
                console.error('Error fetching demand data:', error);
            }
        };

        fetchMonthlySales();
        fetchDemandData();
    }, [year]);

    return (
        <div className="flex flex-wrap justify-between mt-3">
            <div className="flex-1 min-w-0 p-2 bg-white shadow rounded-lg mx-3">
                <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={monthlySalesData}
                            dataKey="monthly_revenue"
                            nameKey="month"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            fill="#8884d8"
                            label
                        >
                            {monthlySalesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d"][index % 4]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlySalesChart;
