/*-----------------------------------------------------------------
* File: database.js
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is part of the user backend service.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Updated custom type casting to handle date fields properly
// This prevents "Conversion failed when converting date and/or time from character string" errors
const customTypeCast = function (field, next) {
    // For SQL Server DATETIME fields, handle specifically
    if (field.type && (field.type.includes('DATETIME') || field.type.includes('DATE'))) {
        const value = field.string();
        if (value === null || value === undefined) {
            return null;
        }

        // Return the raw value without timezone information
        if (typeof value === 'string' && value.includes('+')) {
            // Strip timezone info if present
            return value.split('+')[0].trim();
        }
        return value;
    }

    // For other field types, use the default behavior
    return next();
};

// Create Sequelize instance with configuration
const sequelize = new Sequelize(
    process.env.DB_NAME || 'EduBridgeAI_Enterprise',
    process.env.DB_USER || 'sa',
    process.env.DB_PASSWORD || '123456aA@$',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: false,
                useUTC: false,
                dateFirst: 1,
                enableArithAbort: true,
                trustServerCertificate: true,
                instanceName: (process.env.DB_SERVER || 'localhost').split('\\')[1],
                requestTimeout: 30000,
                dateFormat: 'ymd', // Set date format
                datefirst: 7, // Sunday is the first day
                // Don't use timezone conversion for date handling
                useNagleAlgorithm: true,
                connectTimeout: 30000
            },
            typeCast: customTypeCast, // Updated custom type casting function
            typeValidation: true,
            useDateString: true
        },
        define: {
            timestamps: false, // Disable automatic timestamps unless specified in model
            freezeTableName: true, // Use exact model name as table name
        },
        // Remove timezone setting to prevent automatic conversion
        logging: true, // Enable logging temporarily to debug date issues
        query: {
            raw: false // Don't convert to raw objects
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = sequelize;

