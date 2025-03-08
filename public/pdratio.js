document.getElementById('d-p-ratio-find').addEventListener('click', () => {
    fetch('http://127.0.0.1:3000/d-p-ratio', { // Use port 3000
        method: 'POST', // POST request to send the table name
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) { // Check if the response was successful
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Debugging

        const tableHeader = document.getElementById('d-p-ratio-header');
        const tableBody = document.getElementById('d-p-ratio-body');

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

document.getElementById('d-p-discard').addEventListener('click', () => {
    const tableHeader = document.getElementById('d-p-ratio-header');
    const tableBody = document.getElementById('d-p-ratio-body');

    // Clear the table content without fetching any data
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
});