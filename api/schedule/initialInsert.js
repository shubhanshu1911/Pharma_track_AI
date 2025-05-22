const fs = require('fs');
const path = require('path');

const insertInitialSupplierScores = async () => {
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

                // Prepare the update query
                const updateQuery = `
                    UPDATE supplierproductreliability
                    SET reliability_score = ${reliability_score}
                    WHERE supplier_id = ${supplier_id} AND product_id = ${product_id}
                    AND reliability_score IS NULL;
                `;

                // Print the update SQL command
                console.log(updateQuery);

                // Instead of executing the update, check if we need to insert
                // Here we simulate checking if the row exists
                const checkQuery = `
                    SELECT * FROM supplierproductreliability
                    WHERE supplier_id = ${supplier_id} AND product_id = ${product_id};
                `;
                
                // Print the check SQL command
                console.log(checkQuery);

                // Assuming we would do the logic to see if the row exists...
                // For now, just directly print the insert command
                const insertQuery = `
                    INSERT INTO supplierproductreliability (supplier_id, product_id, reliability_score)
                    VALUES (${supplier_id}, ${product_id}, ${reliability_score});
                `;

                // Print the insert SQL command
                console.log(insertQuery);
            }
        }

        console.log('SQL commands generated successfully.');
    } catch (error) {
        console.error('Error generating SQL commands:', error);
    }
};

insertInitialSupplierScores();
