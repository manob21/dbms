const mysql = require('mysql2');
const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public')); // Serve static files from the public folder
app.use('/templates', express.static(path.join(__dirname, 'public/templates')));
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
  if(tableName === 'none'){
    return res.json([]);
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

// Endpoint to fetch patient and bill details
app.post('/generateBill', (req, res) => {
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  // Query to get patient details
  const patientQuery = `
    SELECT id AS patient_id, name AS patient_name, city, gender, DOB, marital_status, phone_no, disease
    FROM patient
    WHERE id = ?
  `;

  // Query to get bill details for the patient
  const billQuery = `
    SELECT bill_id, doc_charge, medicine_charge, test_charge, operation_charge, nursing_charge
    FROM bill
    WHERE p_id = ?
  `;

  // Execute both queries in sequence
  db.query(patientQuery, [patientId], (err, patientResults) => {
    if (err || patientResults.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientDetails = patientResults[0];

    db.query(billQuery, [patientId], (err, billResults) => {
      if (err || billResults.length === 0) {
        return res.status(404).json({ error: 'No bill found for the given Patient ID' });
      }

      // Combine patient details and bill details
      const response = {
        patient: patientDetails,
        bill: billResults,
      };
      res.json(response);
    });
  });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
