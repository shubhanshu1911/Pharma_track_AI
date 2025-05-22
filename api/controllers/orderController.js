const pool = require('../db');

/// Place a new order (status: pending)
const placeOrder = async (req, res) => {
    const { product_id, quantity, supplier_id, order_date, claimed_lead_time } = req.body;

    try {
        // Fetch product cost price based on both product_id and supplier_id
        const productQuery = await pool.query(
            'SELECT cost_price FROM productsuppliers WHERE product_id = $1 AND supplier_id = $2', 
            [product_id, supplier_id]
        );
        
        // Check if a result is returned
        if (productQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Product with the given supplier not found' });
        }

        const sale_price = productQuery.rows[0]?.cost_price || 0;
        const total_cost = sale_price * quantity;

        // Insert new order into orders table with status "pending"
        const result = await pool.query(
            'INSERT INTO orders (product_id, quantity, supplier_id, order_date, total_cost, status, claimed_lead_time, actual_delivery_date, actual_lead_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [product_id, quantity, supplier_id, order_date, total_cost, 'pending', claimed_lead_time, null, null]
        );

        res.status(201).json({ message: 'Order placed successfully', order: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Update order status (delivered or cancelled)
const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status, actual_delivery_date } = req.body;

    // Check if the provided status is valid
    if (status !== 'delivered' && status !== 'cancelled') {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Fetch the order details by order_id
        const orderResult = await pool.query('SELECT * FROM orders');

        // If the order does not exist
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Handle "delivered" status
        if (status === 'delivered') {
            // Ensure actual_delivery_date is provided
            if (!actual_delivery_date) {
                return res.status(400).json({ error: 'actual_delivery_date is required for delivered orders' });
            }

            // Calculate the actual lead time in days
            const actual_lead_time = Math.ceil((new Date(actual_delivery_date) - new Date(order.order_date)) / (1000 * 3600 * 24));

            // Increase the inventory quantity by the ordered amount
            await pool.query(
                'UPDATE inventory SET quantity = quantity + $1 WHERE product_id = $2',
                [order.quantity, order.product_id]
            );

            // Update the order with the new status and delivery details
            await pool.query(
                'UPDATE orders SET status = $1, actual_delivery_date = $2, actual_lead_time = $3 WHERE order_id = $4',
                [status, actual_delivery_date, actual_lead_time, order_id]
            );

            return res.status(200).json({ message: 'Order delivered, inventory updated', actual_lead_time });
        }

        // Handle "cancelled" status
        await pool.query('UPDATE orders SET status = $1 WHERE order_id = $2', [status, order_id]);

        res.status(200).json({ message: `Order ${status}` });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get all suppliers for a specific product
const getSuppliersByProductId = async (req, res) => {
    const { product_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT s.supplier_id, s.supplier_name, ps.cost_price, supplier_score
             FROM productsuppliers ps
             JOIN suppliers s ON ps.supplier_id = s.supplier_id
             WHERE ps.product_id = $1`,
            [product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No suppliers found for this product' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller to get all orders
const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC LIMIT 20');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


const getOrderStatusById = async (req, res) => {
    const { order_id } = req.params;

    if (!order_id || isNaN(order_id)) {
        return res.status(400).json({ message: 'Invalid or missing order_id in the request.' });
    }

    try {
        // Query to get the status of the order with the given order_id
        const result = await pool.query(
            'SELECT status FROM orders WHERE order_id = $1',
            [order_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No order found with order_id: ${order_id}` });
        }

        // Return the status of the order
        const status = result.rows[0].status;
        res.json({ order_id, status });
    } catch (err) {
        console.error('Error fetching order status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Delete order by order_id
const deleteOrder = async (req, res) => {
    const { order_id } = req.params; // Extract order_id from the URL parameters

    try {
        const deleteQuery = 'DELETE FROM orders WHERE order_id = $1 RETURNING *';
        const result = await pool.query(deleteQuery, [order_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully', order: result.rows[0] });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    placeOrder,
    updateOrderStatus,
    getSuppliersByProductId,
    getAllOrders,
    getOrderStatusById,
    deleteOrder
};
