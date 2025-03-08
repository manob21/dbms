document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting

    const password = document.getElementById('passwordInput').value;
    const correctPassword = '1234'; // Set your correct password here
    const errorMessage = document.getElementById('errorMessage');

    if (password === correctPassword) {
        window.location.href = 'home.html'; // Redirect to this page if password is correct
    } else {
        alert("Wrong PassWord!!! please enter correct password..."); // Show error message if password is incorrect
    }
});