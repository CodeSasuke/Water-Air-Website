class ErrorHandler {
    static handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
            if (error.response) {
                // Handle API errors
                this.showErrorMessage(error.response.data.message || 'An error occurred');
            } else if (error.request) {
                // Handle network errors
                this.showErrorMessage('Network error. Please check your connection.');
            } else {
                // Handle other errors
                this.showErrorMessage('An unexpected error occurred.');
            }
        } else {
            // Server-side error handling
            throw new Error(`${context}: ${error.message}`);
        }
    }

    static showErrorMessage(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
}

export default ErrorHandler;
