// services/analyticsService.js
import axios from 'axios';

const ANALYTICS_API_URL = 'http://3.111.31.228:5000/api/v1/analytics';

// services/analyticsService.js
export const getSales = async (year) => {
    try {
        const response = await axios.get(`${ANALYTICS_API_URL}/sales-by-year/${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sales by year:', error);
        throw error;
    }
};

export const getPendingOrderCount = async () => {
    try {
        const response = await axios.get(`${ANALYTICS_API_URL}/pending-orders-count`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sales by year:', error);
        throw error;
    }
};

export const getPendingOrders = async () => {
    try {
        const response = await axios.get('/order-status/:order_id');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        throw error;
    }
};

export const getStockAlerts = async () => {
    try {
        const response = await axios.get(`${ANALYTICS_API_URL}/stock-alerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock alerts:', error);
        throw error;
    }
};

export const getYearlyRevenue = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${ANALYTICS_API_URL}/revenue`, {
            params: {
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching yearly revenue:', error);
        throw error;
    }
};
