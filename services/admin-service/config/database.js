/*-----------------------------------------------------------------
* File: database.js
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is part of the admin backend service.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
const sql = require('mssql');
require('dotenv').config();

const dbServerString = process.env.DB_SERVER || 'localhost';
let serverName = dbServerString;
let instanceName = undefined;

if (dbServerString.includes('\\')) {
  const parts = dbServerString.split('\\');
  serverName = parts[0];
  instanceName = parts[1];
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: serverName,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: instanceName
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
  sql,
  poolPromise
}; 
