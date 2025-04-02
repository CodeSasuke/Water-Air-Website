function handleLogin(event) {
    event.preventDefault();
    
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return false;
    }

    // In a real application, you would validate credentials against a backend
    // For now, we'll just redirect to dashboard
    window.location.href = 'dashboard.html';
    return false;
}