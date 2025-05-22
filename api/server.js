const dotenv = require('dotenv');
const pool = require('./db');
const express = require('express');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Importing routes
const salesRoutes = require('./routes/salesRoute');
const orderRoutes = require('./routes/orderRoute');
const inventoryRoutes = require('./routes/inventoryRoute'); 
const analyticsRoutes = require('./routes/analyticsRoute'); 
const productRoutes = require('./routes/productRoute');
const predictRoute = require('./routes/predictRoute');
const queryRoutes = require('./routes/queryRoutes');
const requestRoutes = require('./routes/requestRoutes')

// Use routes with a versioned base path
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/inventory', inventoryRoutes); 
app.use('/api/v1/analytics', analyticsRoutes); 
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/predict', predictRoute);
app.use('/api/v1/LLMquery',queryRoutes);
app.use('/api/v1/request',requestRoutes);
// Database connection
pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

// Error-handling middleware 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
