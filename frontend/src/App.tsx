import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking connection...');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    // Test connection to backend
    const checkBackendConnection = async () => {
      try {
        // Direct test with full URL to bypass proxy issues
        const url = 'http://localhost:8080/api/health';
        console.log('Attempting to connect to:', url);
        
        const response = await axios.get(url, {
          // Explicitly set headers to help with CORS issues
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Backend response:', response);
        setBackendStatus('Connected to backend successfully!');
        setErrorDetails(JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        console.error('Failed to connect to backend:', error);
        setBackendStatus('Failed to connect to backend. Please ensure your Java service is running.');
        
        // Provide more detailed error information
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setErrorDetails(`Response error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          setErrorDetails('No response received from server. Check if server is running and network is working.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setErrorDetails(`Error: ${error.message}`);
        }
      }
    };

    checkBackendConnection();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ride Sharing Application</h1>
        <p>Welcome to our ride-sharing platform!</p>
        <div className="backend-status">
          <h3>Backend Connection Status:</h3>
          <p>{backendStatus}</p>
          {errorDetails && (
            <div className="error-details">
              <h4>Details:</h4>
              <pre>{errorDetails}</pre>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
