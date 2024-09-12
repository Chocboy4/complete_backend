const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');


require('dotenv').config();
dotenv.config();
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());


app.use(express.urlencoded({extended : true}))

// User routes
app.use('/api/users', userRoutes);

// Secured route example
app.get('/api/secure', authMiddleware, (req, res) => {
  res.send('This is a secure route');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
