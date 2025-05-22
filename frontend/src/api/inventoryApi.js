import axios from 'axios';

// Correct API URL with versioned path for inventory
const API_URL = 'http://3.111.31.228:5000/api/v1/inventory';

// Function to get all inventory items
export const getAllInventory = async () => {
    return axios.get(API_URL);
};

// Function to get low stock alerts
export const getLowStockAlerts = async () => {
    return axios.get(`${API_URL}/low-stock`); // Adjust the endpoint as needed
};

// Function to add a new inventory item (optional)
export const addInventoryItem = async (itemData) => {
    return axios.post(API_URL, itemData);
};

// Function to update an inventory item (optional)
export const updateInventoryItem = async (itemId, updatedData) => {
    return axios.put(`${API_URL}/${itemId}`, updatedData);
};

// Function to delete an inventory item (optional)
export const deleteInventoryItem = async (itemId) => {
    return axios.delete(`${API_URL}/${itemId}`);
};
