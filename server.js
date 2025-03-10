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

app.post('/docs-of-dept', (req, res) => {
  const deptName = req.body.dept; // Get the table name from the request

  if (!deptName) {
    return res.status(400).send('Table name is required');
  }
  if(deptName === 'none'){
    return res.json([]);
  }

  // Validate the table name against a list of allowed tables
  const allowedDepts = [
    'Oncology',
    'Neurology',
    'Cardiology',
    'Pediatrics',
    'Orthopedics',
    'Gastroenterology',
    'Dermatology',
    'Radiology',
    'Psychiatry',
    'Nephrology',
  ];

  if (!allowedDepts.includes(deptName)) {
    return res.status(400).send('Invalid table name');
  }

  // Construct and execute the query using parameterized queries to prevent SQL injection
  const query = `
    SELECT e.name, dp.name AS department
    FROM doctor d
    JOIN employee e ON d.emp_id = e.id
    join department dp on d.dept_id = dp.dept_id 
    WHERE dp.name = ?
  `; 
  db.query(query, [deptName], (err, results) => {
    if (err) {
      console.error('Error fetching table data:', err);
      return res.status(500).send('Error fetching table data');
    }
    res.json(results); // Send the data back as JSON
  });
});

app.post('/popular-doc', (req, res) => {
  const query = `
    SELECT e.name AS doctor_name
    FROM appointment a
    JOIN doctor d ON a.doc_id = d.emp_id
    JOIN employee e ON d.emp_id = e.id
    GROUP BY a.doc_id
    ORDER BY COUNT(a.doc_id) DESC
    LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/t-pat', (req, res) => {
  const query = `
    SELECT p.id, p.name, a.app_date, a.app_time, e.name AS doctor_name
    FROM appointment a
    JOIN patient p ON a.p_id = p.id
    JOIN doctor d ON a.doc_id = d.emp_id
    JOIN employee e ON d.emp_id = e.id
    WHERE a.app_date = CURDATE();
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/d-p-list', (req, res) => {
  const query = `
    SELECT e.name AS doctor_name, COUNT(a.app_id) AS total_appointments
    FROM doctor d
    JOIN employee e ON d.emp_id = e.id
    LEFT JOIN appointment a ON d.emp_id = a.doc_id
    GROUP BY e.name
    ORDER BY total_appointments DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/c-a-list', (req, res) => {
  const query = `
    SELECT p.id, p.name, a.room_no, a.building_name, a.date_of_add 
    FROM admitted_patient a
    JOIN patient p ON a.p_id = p.id
    WHERE a.date_of_dis IS NULL;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/getmedicine', (req, res) => {
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  // Query to get patient details
  const patientQuery = `
    SELECT p.name AS patient_name, m.name AS medicine_name ,m.disease_type as disease_type
    FROM suggested_medicine sm
    JOIN prescription pr ON sm.app_id = pr.app_id
    JOIN medicine m ON sm.medicine_id = m.medicine_id
    JOIN appointment a ON pr.app_id = a.app_id
    JOIN patient p ON a.p_id = p.id
    WHERE p.id = ? ;
  `;
  

  // Execute both queries in sequence
  db.query(patientQuery, [patientId], (err, patientResults) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(patientResults); 
  });
});

app.post('/common-des', (req, res) => {
  const query = `
    SELECT disease, COUNT(*) AS total_patients
    FROM patient
    GROUP BY disease
    ORDER BY total_patients DESC
    LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/n-p-ratio', (req, res) => {
  const query = `
    SELECT d.name AS department_name,
       COUNT(DISTINCT n.emp_id) AS total_nurses,
       COUNT(DISTINCT a.p_id) AS total_patients,
       ROUND(COUNT(DISTINCT a.p_id) / NULLIF(COUNT(DISTINCT n.emp_id), 0)) AS nurse_to_patient_ratio
      FROM department d
      LEFT JOIN nurse n ON d.dept_id = n.dept_id
      LEFT JOIN doctor doc ON d.dept_id = doc.dept_id
      LEFT JOIN appointment a ON doc.emp_id = a.doc_id
      GROUP BY d.name
      ORDER BY nurse_to_patient_ratio desc;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/d-p-ratio', (req, res) => {
  const query = `
    SELECT d.name AS department_name,
       COUNT(DISTINCT doc.emp_id) AS total_doctors,
       COUNT(DISTINCT a.p_id) AS total_patients,
       ROUND(COUNT(DISTINCT a.p_id) / NULLIF(COUNT(DISTINCT doc.emp_id), 0), 0) AS doctor_to_patient_ratio
        FROM department d
        LEFT JOIN doctor doc ON d.dept_id = doc.dept_id
        LEFT JOIN appointment a ON doc.emp_id = a.doc_id
        GROUP BY d.name
        ORDER BY doctor_to_patient_ratio desc;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);  // Send the most popular doctor info as JSON
  });
});

app.post('/docs-pref', (req, res) => {
  const deptName = req.body.dept; // Get the table name from the request

  if (!deptName) {
    return res.status(400).send('Table name is required');
  }
  if(deptName === 'none'){
    return res.json([]);
  }

  
  // Construct and execute the query using parameterized queries to prevent SQL injection
  const query = `
    WITH pref_table AS (
    SELECT p.disease, 
           doc.emp_id AS doctor_id, 
           COUNT(a.p_id) AS total_appointments
    FROM appointment a
    JOIN patient p ON a.p_id = p.id
    JOIN doctor doc ON a.doc_id = doc.emp_id
    WHERE p.disease = ? 
    GROUP BY p.disease, doc.emp_id
    ORDER BY total_appointments DESC
    )
    SELECT pt.disease, e.name AS doctor_name, pt.total_appointments
    FROM pref_table pt
    JOIN employee e ON e.id = pt.doctor_id;
  `; 
  db.query(query, [deptName], (err, results) => {
    if (err) {
      console.error('Error fetching table data:', err);
      return res.status(500).send('Error fetching table data');
    }
    res.json(results); // Send the data back as JSON
  });
});

app.post('/med-pref', (req, res) => {
  const deptName = req.body.dept; // Get the table name from the request

  if (!deptName) {
    return res.status(400).send('Table name is required');
  }
  if(deptName === 'none'){
    return res.json([]);
  }

  
  // Construct and execute the query using parameterized queries to prevent SQL injection
  const query = `
    SELECT m.name AS medicine_name, COUNT(sm.medicine_id) AS total_prescribed
      FROM suggested_medicine sm
      JOIN prescription pr ON sm.app_id = pr.app_id
      JOIN medicine m ON sm.medicine_id = m.medicine_id
      WHERE pr.disease_type = ? 
      GROUP BY m.name
      ORDER BY total_prescribed DESC
      LIMIT 3;
  `; 
  db.query(query, [deptName], (err, results) => {
    if (err) {
      console.error('Error fetching table data:', err);
      return res.status(500).send('Error fetching table data');
    }
    res.json(results); // Send the data back as JSON
  });
});

app.post('/add-appointment', (req, res) => {
  const { app_id, doc_id, p_id, app_date, app_time } = req.body;

  const insertQuery = `
      INSERT INTO appointment (app_id, doc_id, p_id, app_date, app_time)
      VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [app_id, doc_id, p_id, app_date, app_time], (err, result) => {
      if (err) {
          console.error('Error inserting data:', err);
          return res.status(500).json({ message: 'Failed to add appointment!' });
      }
      res.json({ message: 'Appointment added successfully!' });
  });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
