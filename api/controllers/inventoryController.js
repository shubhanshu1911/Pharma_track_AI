const pool = require('../db');

// Get all inventory items
const getInventory = async (req, res) => {
    try {
        const inventory = await pool.query('SELECT * FROM inventory');
        res.json(inventory.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get stock level for a specific product
const getStockByProductId = async (req, res) => {
    const { product_id } = req.params;
    try {
        const product = await pool.query('SELECT * FROM inventory WHERE product_id = $1', [product_id]);

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add new stock for a product(may not be used mostly just for edditing)==> generally alrady done when order is recived by setting order status as recieved  
const addStock = async (req, res) => {
    const { product_id, quantity, price } = req.body;

    try {
        await pool.query(
            'INSERT INTO inventory (product_id, quantity, price) VALUES ($1, $2, $3) ON CONFLICT (product_id) DO UPDATE SET quantity = inventory.quantity + $2',
            [product_id, quantity, price]
        );

        res.status(201).json({ message: 'Stock added/updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update stock for a specific product
const updateStock = async (req, res) => {
    const { product_id } = req.params;
    const { quantity } = req.body;

    try {
        await pool.query('UPDATE inventory SET quantity = $1 WHERE product_id = $2', [quantity, product_id]);
        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getInventory, getStockByProductId, addStock, updateStock };
