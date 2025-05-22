const pool = require('../db');  // Assuming you are using `pg` for PostgreSQL

// Add a new customer request
exports.addRequest = async (req, res) => {
    try {
        const { customer_name = 'unknown', request_date, quantity_requested, product_id } = req.body;

        // Check if all fields are present
        if (!product_id || !request_date || !quantity_requested) {
            return res.status(400).json({ error: 'Required fields are missing.' });
        }

        // Insert the new request into the CustomerRequests table
        const query = `
            INSERT INTO customer_requests (customer_name, product_id, request_date, quantity_requested)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [customer_name, product_id, request_date, quantity_requested];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Request added successfully!',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding request:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Include more details in response
    }
};


// Get all customer requests
exports.getAllRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customer_requests ORDER BY request_date DESC;');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
