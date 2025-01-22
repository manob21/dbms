const mysql = require('mysql2');
const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(cors()); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// Create connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Replace with your MySQL username
  password: 'Chat12m', // Replace with your MySQL password
  database: 'hospital' // Replace with your database name
});

// Test connection
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL!');
});

// Handle the /getTable POST request
app.post('/getTable', (req, res) => {
  const tableName = req.body.table; // Get the table name from the request

  if (!tableName) {
    return res.status(400).send('Table name is required');
  }

  // Validate the table name against a list of allowed tables
  const allowedTables = [
    'doctor',
    'admitted_patient',
    'appointment',
    'bill',
    'building',
    'department',
    'employee',
    'medicine',
    'nurse',
    'patient',
    'prescription',
    'room',
    'suggested_medicine',
    'suggested_test',
    'test',
  ];

  if (!allowedTables.includes(tableName)) {
    return res.status(400).send('Invalid table name');
  }

  // Construct and execute the query using parameterized queries to prevent SQL injection
  const query = `SELECT * FROM ??`; 
  db.query(query, [tableName], (err, results) => {
    if (err) {
      console.error('Error fetching table data:', err);
      return res.status(500).send('Error fetching table data');
    }
    res.json(results); // Send the data back as JSON
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
