const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const pool = require('../db'); 

// Function to update supplier product reliability
const updateSupplierScore = async () => {
    try {
        // Read the JSON file
        const filePath = path.join(__dirname, '../data/supplier_score.json');
        const data = fs.readFileSync(filePath);
        const supplierScores = JSON.parse(data);

        // Iterate through the JSON data
        for (const product_id in supplierScores) {
            const suppliers = supplierScores[product_id];

            for (const supplier_id in suppliers) {
                const reliability_score = suppliers[supplier_id];

                // Update the supplierproductreliability table
                const query = `
                    UPDATE supplierproductreliability
                    SET reliability_score = $1
                    WHERE supplier_id = $2 AND product_id = $3;
                `;
                const values = [reliability_score, supplier_id, product_id];

                await pool.query(query, values);
            }
        }

        console.log('Supplier scores updated successfully.');
    } catch (error) {
        console.error('Error updating supplier scores:', error);
    }
};

// Schedule the task to run every day at 5 am (IST)
cron.schedule('30 23 * * *', async () => {
    console.log('Running updateSupplierScore at 5 am IST...');
    await updateSupplierScore();
}, {
    timezone: 'Asia/Kolkata' // Set the timezone to IST
});

module.exports = updateSupplierScore;
