import { generateBillPage } from './templates/generateBill.js';




document.getElementById('generate-bill-button').addEventListener('click', () => {
    console.log("reached here");
    const patientId = document.getElementById('patient-id').value;
    console.log("reached here");
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