import axios, { AxiosError, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

export interface AxiosErrorDetails {
  status?: number;
  statusText?: string;
  data?: unknown;
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
  config?: {
    url?: string;
    method?: string;
    headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
    data?: unknown;
  };
}

export function handleKeycloakError(error: unknown, operation: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const errorDetails: AxiosErrorDetails = {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      headers: axiosError.response?.headers,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers,
        data: axiosError.config?.data,
      },
    };

    console.error(`Error ${operation}:`, errorDetails);
    const errorMessage = (axiosError.response?.data as { errorMessage?: string })?.errorMessage || axiosError.message;
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
  }
  
  console.error(`Unexpected error ${operation}:`, error);
  throw error instanceof Error ? error : new Error(String(error));
}