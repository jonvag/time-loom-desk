export interface ErrorData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface CreateErrorRequest {
  name: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}