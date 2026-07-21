import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Set global base URL for Axios API requests
const envApiUrl = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = envApiUrl.includes('onrender.com') ? '' : envApiUrl;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

