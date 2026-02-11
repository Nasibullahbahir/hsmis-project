import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

class AuthService {
  async login(username, password) {
    try {
      console.log(`Attempting login with username: ${username}`);
      
      // First, test the connection
      try {
        const testResponse = await axios.get(BASE_URL + '/test1/api/token/', {
          timeout: 5000
        });
        console.log('Server reachable:', testResponse.status);
      } catch (testErr) {
        console.log('Server test failed - expected for POST endpoint');
      }

      // Try with different endpoints
      const endpoints = [
        '/test1/api/token/',
        '/api/token/',
        '/test1/token/'
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${BASE_URL}${endpoint}`);
          response = await axios.post(BASE_URL + endpoint, {
            username: username,
            password: password
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          });
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          lastError = err;
          console.log(`Failed with endpoint ${endpoint}:`, err.message);
          if (err.response) {
            console.log('Response status:', err.response.status);
            console.log('Response data:', err.response.data);
          }
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      if (response && response.data.access) {
        console.log('Login successful, received token');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        return response.data;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        
        // If it's a 404, show helpful message
        if (error.response.status === 404) {
          throw new Error(`Endpoint not found. Checked: ${BASE_URL}/test1/api/token/`);
        }
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();