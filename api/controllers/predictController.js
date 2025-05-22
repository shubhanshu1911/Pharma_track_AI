const path = require('path');
const fs = require('fs');

// Controller to get demand data
const getDemandData = (req, res) => {
    try {
        const demandFilePath = path.join(__dirname, '..', 'data', 'demand_prediction.json');
        const demandData = JSON.parse(fs.readFileSync(demandFilePath, 'utf-8'));
        res.status(200).json(demandData);
    } catch (error) {
        console.error('Error fetching demand data:', error);
        res.status(500).json({ message: 'Error fetching demand data', error: error.message });
    }
};

// Controller to get supplier score data
const getSupplierScoreData = (req, res) => {
    try {
        const supplierScoreFilePath = path.join(__dirname, '..', 'data', 'supplier_score.json');
        const supplierScoreData = JSON.parse(fs.readFileSync(supplierScoreFilePath, 'utf-8'));
        res.status(200).json(supplierScoreData);
    } catch (error) {
        console.error('Error fetching supplier score data:', error);
        res.status(500).json({ message: 'Error fetching supplier score data', error: error.message });
    }
};

module.exports = {
    getDemandData,
    getSupplierScoreData
};
