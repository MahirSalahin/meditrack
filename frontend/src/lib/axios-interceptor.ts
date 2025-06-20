import axios from "axios";
import { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

// API Error Response interface
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
});

// Add a request interceptor to set the Authorization header dynamically
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Only attempt to get token on client-side
      if (typeof window !== 'undefined') {
        const session = await getSession();
        const token = session?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle error status codes
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle in client components
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        const event = new CustomEvent('auth-error', { detail: { type: 'unauthorized' } });
        window.dispatchEvent(event);
        await signOut({
          redirectTo: "/auth/login",
        });
      } else if (error.response?.status === 403) {
        // For 403 Forbidden errors
        const event = new CustomEvent('auth-error', { detail: { type: 'forbidden' } });
        window.dispatchEvent(event);
      } else if (error.response?.status === 422) {
        // For 422 Validation errors
        const event = new CustomEvent('auth-error', { detail: { type: 'validation', errors: error.response.data.detail } });
        window.dispatchEvent(event);
      } else if (error.response?.status >= 500) {
        // For server errors
        const event = new CustomEvent('auth-error', { detail: { type: 'server-error' } });
        window.dispatchEvent(event);
      }
    }

    return Promise.reject(error);
  }
);

export type AxiosResponseType<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
};

// Helper function to handle API errors consistently
export const handleApiError = (error: AxiosError<ApiErrorResponse> | Error): string => {
  if ('response' in error && error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if ('response' in error && error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};

// Helper function to create consistent API responses
export const createApiResponse = <T>(data: T, message: string = "Success"): AxiosResponseType<T> => {
  return {
    success: true,
    message,
    data,
    errors: null
  };
};

export default axiosInstance;