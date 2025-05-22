const pool = require('../db'); 

// API to search product by name and return product ID
const getProductIDByName = async (req, res) => {
    const { product_name } = req.body;

    try {
        const product = await pool.query(
            'SELECT product_id FROM products WHERE product_name ILIKE $1',
            [product_name]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ product_id: product.rows[0].product_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// API to search products based on query string
const searchProducts = async (req, res) => {
    const { query } = req.query;

    try {
        const products = await pool.query(
            'SELECT * FROM products WHERE product_name ILIKE $1',
            [`%${query}%`]
        );

        if (products.rows.length === 0) {
            return res.status(404).json({ error: 'No products found' });
        }

        res.status(200).json(products.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Controller to get product details by product_id
const getProductByID = async (req, res) => {
    const { product_id } = req.params;  // Extract product_id from route parameters

    try {
        // Query to fetch product details from the products table
        const productQuery = await pool.query('SELECT * FROM products WHERE product_id = $1', [product_id]);

        // Check if product exists
        if (productQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Return the product details
        res.status(200).json(productQuery.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProductIDByName,
    searchProducts,
    getProductByID
};
