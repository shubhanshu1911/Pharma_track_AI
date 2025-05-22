const pool = require('../db');
const axios = require("axios");

// Controller to add a sale
const addSale = async (req, res) => {
    const { product_id, quantity_sold, customer_name = 'Unknown', sale_date } = req.body;

    try {
        // Check if the product exists and get the sale price and inventory details
        const productInventory = await pool.query(
            `SELECT 
                p.sale_price, 
                i.quantity AS available_quantity 
            FROM products p 
            JOIN inventory i ON p.product_id = i.product_id 
            WHERE p.product_id = $1`,
            [product_id]
        );

        if (productInventory.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        const availableQuantity = productInventory.rows[0].available_quantity;
        const salePrice = productInventory.rows[0].sale_price;

        // Check if there's enough stock to make the sale
        if (availableQuantity < quantity_sold) {
            return res.status(400).json({ error: 'Insufficient stock to complete the sale' });
        }

        // Calculate total amount
        const totalAmount = salePrice * quantity_sold;

        // Start a transaction to insert the sale and update the inventory
        await pool.query('BEGIN');

        // Insert the sale into the sales table
        await pool.query(
            'INSERT INTO sales (product_id, quantity_sold, sale_date, total_amount, customer_name) VALUES ($1, $2, $3, $4, $5)',
            [product_id, quantity_sold, sale_date, totalAmount, customer_name]
        );

        // Update the inventory to reflect the sold quantity
        await pool.query(
            'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
            [quantity_sold, product_id]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(201).json({ message: 'Sale recorded successfully' });
    } catch (err) {
        // Rollback in case of error
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get all sales
const getAllSales = async (req, res) => {
    try {
        const sales = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC LIMIT 20');
        res.json(sales.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get particular sale by ID
const getSaleById = async (req, res) => {
    const { sale_id } = req.params;
    try {
        const sale = await pool.query('SELECT * FROM sales WHERE sale_id = $1', [sale_id]);

        if (sale.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json(sale.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


const deleteSale = async (req, res) => {
    const { sale_id } = req.params; // Extract sale_id from the URL parameters

    try {
        const deleteQuery = 'DELETE FROM sales WHERE sale_id = $1 RETURNING *';
        const result = await pool.query(deleteQuery, [sale_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.status(200).json({ message: 'Sale deleted successfully', sale: result.rows[0] });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Controller to check ROP status for a product
const checkROPStatus = async (req, res) => {
    const { product_id } = req.params;

    try {
        // Fetch the product's current inventory quantity
        const productInventory = await pool.query(
            'SELECT quantity FROM inventory WHERE product_id = $1',
            [product_id]
        );

        if (productInventory.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        const availableQuantity = productInventory.rows[0].quantity;

        // Fetch the ROP data from the FastAPI endpoint
        const ropResponse = await axios.get('http://3.111.31.228:8000/roq');
        const ropData = ropResponse.data;

        // Check if ROP data exists for this product
        if (!ropData[product_id]) {
            return res.status(404).json({ error: 'ROP data not found for this product' });
        }

        // Get the monthly ROP and convert it to weekly ROP
        const monthlyRop = ropData[product_id].rop;
        const weeklyRop = monthlyRop / 4;

        // Compare the available quantity with the weekly ROP
        const flag = availableQuantity < weeklyRop ? 1 : 0;

        res.status(200).json({ flag });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Controller to get products with quantity less than ROP/4
const getProductsBelowROP = async (req, res) => {
    try {
        // Fetch all product names and quantities from the inventory table
        const productsInventory = await pool.query(`
            SELECT p.product_id, p.product_name, i.quantity 
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
        `);

        // Fetch the ROP data from the FastAPI API
        const ropResponse = await axios.get('http://3.111.31.228:8000/roq');
        const ropData = ropResponse.data;

        // Fetch the weekly demand from the FastAPI API (using week 5 as query parameter)
        const week = 5; // Can be dynamic depending on the current week or system requirements
        const demandResponse = await axios.get(`http://3.111.31.228:8000/product-demand?week=${week}`);
        const demandData = demandResponse.data;

        // Filter products whose quantity is less than the required stock level (ROP/4 or weekly demand)
        const productsBelowROP = productsInventory.rows.map(product => {
            const productROP = ropData[product.product_id]?.rop;
            const weeklyDemand = demandData[product.product_id]?.weekly_demand;

            // Skip if either ROP or demand data is missing for this product
            if (!productROP || !weeklyDemand) return null;

            // Calculate weekly ROPa
            const weeklyROP = productROP / 4;

            // Determine the higher value between weekly ROP and weekly demand
            const requiredStockLevel = Math.max(weeklyROP, weeklyDemand);

            // Check if the quantity is less than the required stock level
            if (product.quantity < requiredStockLevel) {
                // Calculate order amount to reach the required stock level
                const orderAmount = requiredStockLevel - product.quantity;

                return {
                    product_id: product.product_id,
                    product_name: product.product_name,
                    quantity: product.quantity,
                    required_stock: requiredStockLevel,
                    order_amount: orderAmount // Recommended order amount based on demand or ROP
                };
            }

            return null; // Skip products that have enough stock
        }).filter(product => product !== null); // Remove null values

        res.status(200).json(productsBelowROP);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { addSale, getAllSales, getSaleById, deleteSale, checkROPStatus, getProductsBelowROP };
