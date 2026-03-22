export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: '',
  supabaseAnonKey: '',
};

// Validate critical configuration at startup in development
if (!environment.apiUrl) {
  console.warn('[Environment] apiUrl is not configured. API calls will fail.');
}
