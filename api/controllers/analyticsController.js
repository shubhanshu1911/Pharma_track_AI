const pool = require('../db');
const axios = require('axios');

// Get total sales month-wise for a specific product
const getSalesByProduct = async (req, res) => {
    const { product_id } = req.params; // Extract product_id from request parameters
    try {
        const salesData = await pool.query(
            `SELECT 
                DATE_TRUNC('month', sale_date) AS sale_month, 
                SUM(quantity_sold) AS total_quantity, 
                SUM(total_amount) AS total_revenue
             FROM sales
             WHERE product_id = $1
             GROUP BY sale_month
             ORDER BY sale_month`,
            [product_id]
        );

        res.json(salesData.rows); // Return the month-wise sales data
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get low stock alerts (give all stocks below set threshold)
const getStockAlerts = async (req, res) => {
    const threshold = 10; // default threshold is set to 10 (may change later as needed) 
    try {
        const lowStock = await pool.query('SELECT * FROM inventory WHERE quantity < $1', [threshold]);
        res.json(lowStock.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get revenue for a specified period (startDate and endDate is given and revenu is returned )
const getRevenue = async (req, res) => {
    const { startDate, endDate } = req.body; 
    try {
        const revenue = await pool.query(
            'SELECT SUM(total_amount) AS total_revenue FROM sales WHERE sale_date BETWEEN $1 AND $2',
            [startDate, endDate]
        );
        res.json(revenue.rows[0]); // Return the total revenue
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


const getSalesByYear = async (req, res) => {
    const { year } = req.params;  

   
    if (!year || isNaN(year)) {
        return res.status(400).json({ message: 'Invalid or missing year in the request.' });
    }

    try {
        // Query for total sales for the entire year
        const totalSalesQuery = `
            SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = $1
        `;
        const totalSalesResult = await pool.query(totalSalesQuery, [year]);
        const totalRevenue = totalSalesResult.rows[0].total_revenue;

        // Query for monthly sales breakdown
        const monthlySalesQuery = `
            SELECT
                EXTRACT(MONTH FROM sale_date) AS month,
                COALESCE(SUM(total_amount), 0) AS monthly_revenue
            FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = $1
            GROUP BY month
            ORDER BY month
        `;
        const monthlySalesResult = await pool.query(monthlySalesQuery, [year]);

        // Initialize an array with 12 elements, all set to 0 (for each month)
        const monthlySalesBreakdown = Array(12).fill(0); 

        // Populate the array with actual sales data
        monthlySalesResult.rows.forEach(row => {
            const monthIndex = row.month - 1; // Month is 1-based, so convert to 0-based index
            monthlySalesBreakdown[monthIndex] = row.monthly_revenue;
        });

        
        res.json({
            year,
            totalRevenue,
            monthlySalesBreakdown,
        });
    } catch (err) {
        console.error('Error fetching sales data by year:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Controller to get count of pending orders
const getPendingOrderCount = async (req, res) => {
    try {
        const query = 'SELECT COUNT(*) FROM orders WHERE status = $1';
        const result = await pool.query(query, ['pending']);
        const pendingOrderCount = result.rows[0].count;

        res.status(200).json({ pendingOrderCount });
    } catch (error) {
        console.error('Error fetching pending orders count:', error);
        res.status(500).json({ message: 'Error fetching pending orders count', error: error.message });
    }
};

const getName = async(req,res) => {
    console.log("yusuf");
    // res.send("Hello");

    try {
        console.log('getProductsBelowROP function called');

        // Step 1: Fetch all product_id and quantity from inventory table
        const inventoryQuery = 'SELECT product_id, quantity FROM inventory';
        const { rows: inventoryData } = await pool.query(inventoryQuery);

        console.log('Inventory Data:', JSON.stringify(inventoryData, null, 2));

        // Step 2: Fetch ROP data from FastAPI
        const ropResponse = await axios.get('http://3.111.31.228:8000/roq');
        const ropData = ropResponse.data;

        console.log('ROP Data:', JSON.stringify(ropData, null, 2));

        // Step 3: Compare and filter products below ROP
        const productsBelowROP = inventoryData.filter(product => {
            const productROP = ropData[product.product_id]?.rop;
            if (productROP === undefined || productROP === null) return false;
            const weeklyROP = productROP / 4;
            return product.quantity < weeklyROP;
        });

        console.log('Products Below ROP:', JSON.stringify(productsBelowROP, null, 2));

        // Step 4: Send the filtered products as response
        res.status(200).json(productsBelowROP);
    } catch (err) {
        console.error('Error in getProductsBelowROP:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }

};


module.exports = { getSalesByProduct, getStockAlerts, getRevenue, getSalesByYear, getPendingOrderCount, getName };
