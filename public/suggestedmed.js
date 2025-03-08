document.getElementById('get-medicine-button').addEventListener('click', () => {
    const patientId = document.getElementById('mpatient-id').value;
  
    if (!patientId) {
      alert('Please enter a valid Patient ID.');
      return;
    }
  
    // Fetch bill data from the server
    fetch('http://localhost:3000/getmedicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    })
    .then(response => {
        if (!response.ok) { // Check if the response was successful
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Debugging

        const tableHeader = document.getElementById('medicine-header');
        const tableBody = document.getElementById('medicine-body');

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
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to generate bill.');
    });
});

document.getElementById('medicine-discard').addEventListener('click', () => {
    const tableHeader = document.getElementById('medicine-header');
    const tableBody = document.getElementById('medicine-body');

    // Clear the table content without fetching any data
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
});
