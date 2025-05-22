import axios from 'axios';

const PRODUCT_API_URL = 'http://3.111.31.228:5000/api/v1/products';


// Function to get product details by product_id
export const getProductByID = async (product_id) => axios.get(`${PRODUCT_API_URL}/products/${product_id}`);