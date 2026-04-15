const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const ApiError = require('./errors/ApiError');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(express.json());

app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use((req, res, next) => {
  next(ApiError.notFound('Route not found'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));