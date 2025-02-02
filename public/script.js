import { generateBillPage } from './templates/generateBill.js';

document.getElementById('ok-button').addEventListener('click', () => {
    const tableName = document.getElementById('table-select').value;
 
    document.getElementById('table-name').textContent = `Table: ${tableName}`;

    if(tableName === 'none'){
        document.getElementById('table-name').textContent = '';
        document.getElementById('table-header').innerHTML = '';
        document.getElementById('table-body').innerHTML = '';
        return;
    }

    fetch('http://127.0.0.1:3000/getTable', { // Use port 3000
        method: 'POST', // POST request to send the table name
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table: tableName }) // Send tableName as part of the request body
    })
    .then(response => {
        if (!response.ok) { // Check if the response was successful
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Debugging

        const tableHeader = document.getElementById('table-header');
        const tableBody = document.getElementById('table-body');

        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tableHeader.appendChild(th);
            });

            data.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header];
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 10;
            td.textContent = 'No data found for this table';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }
    })
    .catch(err => {
        console.error('Error:', err); // Debugging
        alert(`Something went wrong: ${err.message}`); // Show a user-friendly error message
    });
});

document.getElementById('generate-bill-button').addEventListener('click', () => {
    const patientId = document.getElementById('patient-id').value;
  
    if (!patientId) {
      alert('Please enter a valid Patient ID.');
      return;
    }
  
    // Fetch bill data from the server
    fetch('http://localhost:3000/generateBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        console.log("data receaved")
  
        // Open a new window to render the bill
        fetch('/public/templates/billTemplate.html')
          .then(response => response.text())
          .then(template => {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(template);
            console.log("nothing happend");
            // Populate patient details
            const patient = data.patient;
            const patientDetailsHTML = `
            <table id="t1" border="0">
                <tr style="border: none;">
                    <td style="border: none;"><strong>Patient ID</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.patient_id}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Name</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.patient_name}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>City</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.city}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Gender</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.gender}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Date of Birth</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.DOB}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Marital Status</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.marital_status}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Phone No.</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.phone_no}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none;"><strong>Disease</strong></td>
                    <td style="border: none;"><string> :  </string>${patient.disease}</td>
                </tr>
            </table>
            `;
            newWindow.document.getElementById('patient-details').innerHTML = patientDetailsHTML;
            console.log("patient successfully called");
            // Populate bill details
            const billBody = newWindow.document.getElementById('bill-body');
            data.bill.forEach(row => {
                const docCharge = parseFloat(row.doc_charge) || 0;
                const medicineCharge = parseFloat(row.medicine_charge) || 0;
                const testCharge = parseFloat(row.test_charge) || 0;
                const operationCharge = parseFloat(row.operation_charge) || 0;
                const nursingCharge = parseFloat(row.nursing_charge) || 0;
              
                // Calculate the total
                const total = docCharge + medicineCharge + testCharge + operationCharge + nursingCharge;
                console.log("hello");
                const rowHTML = `
                    <tr>
                        
                        <td><b>Doctor Charge</b></td>
                        <td>${(parseFloat(row.doc_charge) || 0).toFixed(2)}</td>
                        
                    </tr>
                    <tr>
                        <td><b>Medicine Charge</b></td>
                        <td>${(parseFloat(row.medicine_charge) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><b>Test Charge</b></td>
                        <td>${(parseFloat(row.test_charge) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><b>Operation Charge</b></td>
                        <td>${(parseFloat(row.operation_charge) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><b>Nursing Charge</b></td>
                        <td>${(parseFloat(row.nursing_charge) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><b>Total</b></td>
                        <td>${total.toFixed(2)}</td>
                    </tr>
                `;
                billBody.innerHTML += rowHTML;
            });
  
            // Optionally trigger print
            newWindow.print();
          });
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to generate bill.');
      });
  });
  