function handleSubmit(event) {
    event.preventDefault();
    
    const errorMessage = document.getElementById('errorMessage');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
        // Add your API call here
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle success
            window.location.href = '/success.html';
        })
        .catch(error => {
            errorMessage.textContent = 'Failed to send message. Please try again later.';
            errorMessage.classList.add('show');
        });
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
    }

    return false;
}
