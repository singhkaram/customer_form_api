const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');
require('dotenv').config();
const cors = require('cors'); 

const app = express();

// Connect to MongoDB
connectDB();

// Body-parser middleware
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use customer routes
app.use('/api', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







