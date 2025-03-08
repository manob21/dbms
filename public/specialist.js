document.getElementById('docs-of-dept-find').addEventListener('click', () => {
    const deptName = document.getElementById('dept-select').value;
 
    document.getElementById('docs-of-dept-table-name').textContent = `The doctors list of depeartment : ${deptName}`;

    if(deptName === 'none'){
        document.getElementById('docs-of-dept-table-name').textContent = '';
        document.getElementById('docs-of-dept-header').innerHTML = '';
        document.getElementById('docs-of-dept-body').innerHTML = '';
        return;
    }

    fetch('http://127.0.0.1:3000/docs-of-dept', { // Use port 3000
        method: 'POST', // POST request to send the table name
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dept: deptName }) // Send tableName as part of the request body
    })
    .then(response => {
        if (!response.ok) { // Check if the response was successful
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Debugging

        const tableHeader = document.getElementById('docs-of-dept-header');
        const tableBody = document.getElementById('docs-of-dept-body');

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