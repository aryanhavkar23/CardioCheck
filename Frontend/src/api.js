// CardioCheck Centralized API Client

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
  || (typeof window !== 'undefined' && window.__CARDIOCONFIG__?.API_BASE_URL)
  || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('cardiocheck_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('cardiocheck_token', token);
    } else {
      localStorage.removeItem('cardiocheck_token');
    }
  }

  getStoredDoctor() {
    try {
      const data = localStorage.getItem('cardiocheck_doctor');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setStoredDoctor(doc) {
    if (doc) {
      localStorage.setItem('cardiocheck_doctor', JSON.stringify(doc));
    } else {
      localStorage.removeItem('cardiocheck_doctor');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        this.setStoredDoctor(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Clinical session expired. Please sign in again.');
      }

      if (!response.ok) {
        let errMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.detail) {
            errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // fallback to status text
        }
        throw new Error(errMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async register(data) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.access_token);
    this.setStoredDoctor(res.doctor);
    return res;
  }

  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.access_token);
    this.setStoredDoctor(res.doctor);
    return res;
  }

  async getMe() {
    const res = await this.request('/api/auth/me');
    this.setStoredDoctor(res);
    return res;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setToken(null);
      this.setStoredDoctor(null);
    }
  }

  // --- Dashboard ---
  async getDashboardSummary() {
    return await this.request('/api/dashboard/summary');
  }

  // --- Patients ---
  async listPatients(search = '') {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return await this.request(`/api/patients${q}`);
  }

  async createPatient(data) {
    return await this.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPatient(id) {
    return await this.request(`/api/patients/${id}`);
  }

  async updatePatient(id, data) {
    return await this.request(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getPatientAssessments(patientId) {
    return await this.request(`/api/patients/${patientId}/assessments`);
  }

  // --- Assessments & Predictions ---
  async predictAssessment(patientId, features) {
    return await this.request(`/api/assessments/${patientId}/predict`, {
      method: 'POST',
      body: JSON.stringify(features)
    });
  }

  async saveAssessmentDraft(patientId, draftData) {
    return await this.request(`/api/patients/${patientId}/assessments/drafts`, {
      method: 'POST',
      body: JSON.stringify(draftData)
    });
  }

  async getAssessment(id) {
    return await this.request(`/api/assessments/${id}`);
  }

  async updateAssessmentNotes(id, notesData) {
    return await this.request(`/api/assessments/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify(notesData)
    });
  }

  async comparePatientAssessments(patientId) {
    return await this.request(`/api/assessments/compare/${patientId}`);
  }

  // --- Reports (PDF) ---
  getReportUrl(assessmentId) {
    return `${this.baseUrl}/api/assessments/${assessmentId}/report`;
  }

  async downloadReport(assessmentId, filename = 'CardioCheck_Report.pdf') {
    const token = this.getToken();
    const url = this.getReportUrl(assessmentId);
    const res = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to download report (${res.status})`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }

  async checkHealth() {
    return await this.request('/api/health');
  }
}

export const api = new ApiClient();
