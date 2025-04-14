import axios from 'axios';

export interface AxiosErrorDetails {
  status?: number;
  statusText?: string;
  data?: any;
  headers?: any;
  config?: {
    url?: string;
    method?: string;
    headers?: any;
    data?: any;
  };
}

export function handleKeycloakError(error: any, operation: string): never {
  if (axios.isAxiosError(error)) {
    const errorDetails: AxiosErrorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
      },
    };

    console.error(`Error ${operation}:`, errorDetails);
    const errorMessage = error.response?.data?.errorMessage || error.message;
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
  }
  
  console.error(`Unexpected error ${operation}:`, error);
  throw error;
}