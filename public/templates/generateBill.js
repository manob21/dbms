export function generateBillPage(patientDetails, billDetails) {
    // Fetch the bill template
    fetch('/templates/billTemplate.html')
      .then(response => response.text())
      .then(template => {
        // Create a new window for the bill
        const newWindow = window.open('', '_blank');
        newWindow.document.write(template);
  
        // Inject patient details
        const patientDetailsHTML = `
          <p><strong>Patient ID:</strong> ${patientDetails.patient_id}</p>
          <p><strong>Patient Name:</strong> ${patientDetails.patient_name}</p>
          <p><strong>Bill Date:</strong> ${patientDetails.date}</p>
          <hr>
        `;
        newWindow.document.getElementById('patient-details').innerHTML = patientDetailsHTML;
  
        // Inject bill details into the table
        const billHeader = newWindow.document.getElementById('bill-header');
        const billBody = newWindow.document.getElementById('bill-body');
  
        // Add table header
        const headerRow = `<tr>
          <th>Bill ID</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>`;
        billHeader.innerHTML = headerRow;
  
        // Add table rows
        billDetails.forEach(row => {
          const rowHTML = `<tr>
            <td>${row.bill_id}</td>
            <td>${row.amount}</td>
            <td>${row.date}</td>
          </tr>`;
          billBody.innerHTML += rowHTML;
        });
  
        // Optional: Trigger print
        newWindow.print();
      })
      .catch(error => console.error('Error loading bill template:', error));
  }
  