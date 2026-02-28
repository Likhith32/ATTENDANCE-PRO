import axios from 'axios';
import { API_BASE as BASE_URL } from '../config/api';

const API_BASE = `${BASE_URL}/api`;

export const api = {
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/upload-pdf`, formData);
  },
  
  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/upload-excel`, formData);
  },
  
  calculate: async (workingDays: number, hours_per_day: number, recipientEmail: string = "") => {
    return axios.post(`${API_BASE}/calculate`, {
      working_days: workingDays,
      hours_per_day: hours_per_day,
      recipient_email: recipientEmail
    });
  },
  
  testEmail: async (recipientEmail: string) => {
    return axios.post(`${API_BASE}/test-email`, {
      recipient_email: recipientEmail
    });
  },
  
  getSummary: async () => {
    return axios.get(`${API_BASE}/summary`);
  },
  
  getResults: async () => {
    return axios.get(`${API_BASE}/results`);
  },
  
  exportBulk: () => {
    window.open(`${API_BASE}/export-bulk`, '_blank');
  },
  
  downloadReport: (empId: string) => {
    window.open(`${API_BASE}/download-report/${empId}`, '_blank');
  }
};
