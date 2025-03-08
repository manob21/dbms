document.getElementById('appointment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            app_id: form.app_id.value,
            doc_id: form.doc_id.value,
            p_id: form.p_id.value,
            app_date: form.app_date.value,
            app_time: form.app_time.value
        };

        try {
            const response = await fetch('/add-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add appointment!');
        }
});
  