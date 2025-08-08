const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com/api/v1'
  : 'http://localhost:8000/api/v1';

export default API_BASE_URL;