const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('chatToken');
    this.user = JSON.parse(localStorage.getItem('chatUser'));
  }

  async login(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('chatToken', this.token);
        localStorage.setItem('chatUser', JSON.stringify(this.user));
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  }

  async getUserProfile() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data.success ? data.user : null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export default new AuthService(); 