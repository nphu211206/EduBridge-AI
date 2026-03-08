/*-----------------------------------------------------------------
* File: server.js
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is part of the student admin backend service.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
// Load environment variables from project root
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./src/routes/students');
const usersRoutes = require('./src/routes/users');
const academicRoutes = require('./src/routes/academic');
const financeRoutes = require('./routes/finance');
const servicesRoutes = require('./routes/services');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/users', usersRoutes); // Enable users routes
app.use('/api/academic', academicRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/services', servicesRoutes); // Enable services routes

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Admin Student Service API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5011;
app.listen(PORT, () => {
  console.log(`Admin Student Service running on port ${PORT}`);
});

module.exports = app; 
