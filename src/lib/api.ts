export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export type ApiErrorResponse = {
  _isApiError: true;
  status: number;
  message: string;
  authenticated?: boolean;
  data?: any;
  error?: any;
};

export const resolveArrayData = <T = any>(res: any): T[] => {
  if (!res) return [];
  if (typeof res === 'object' && res !== null && '_isApiError' in res && res._isApiError) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === 'object' && res !== null && 'data' in res && Array.isArray((res as any).data)) {
    return (res as any).data as T[];
  }
  if (typeof res === 'object' && res !== null && 'items' in res && Array.isArray((res as any).items)) {
    return (res as any).items as T[];
  }
  if (typeof res === 'object' && res !== null && 'list' in res && Array.isArray((res as any).list)) {
    return (res as any).list as T[];
  }
  if (typeof res === 'object' && res !== null && 'rankings' in res && Array.isArray((res as any).rankings)) {
    return (res as any).rankings as T[];
  }
  if (typeof res === 'object' && res !== null && 'evaluations' in res && Array.isArray((res as any).evaluations)) {
    return (res as any).evaluations as T[];
  }
  return [];
};

const requestCounts: Record<string, number> = {};
const pendingRequests: Record<string, Promise<any>> = {};
const lastRequestTime: Record<string, number> = {};

export const fetchApi = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const cacheKey = `${url}:${options?.method || 'GET'}:${JSON.stringify(options?.body || '')}`;
  const now = Date.now();
  
  // Throttle duplicate rapid requests within 1000ms
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  requestCounts[url] = (requestCounts[url] || 0) + 1;
  
  const promise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (response.status === 204) {
        return { _isApiError: false, data: null };
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 429) {
          return {
            _isApiError: true,
            status: 429,
            message: 'Too many requests. Please wait.',
            data: null
          };
        }
        if (response.status === 401) {
          return {
            _isApiError: true,
            status: 401,
            message: 'Authentication Required',
            authenticated: false,
            data: null
          };
        }
        if (response.status === 403) {
          return {
            _isApiError: true,
            status: 403,
            message: 'Access Denied',
            data: null
          };
        }
        return {
          _isApiError: true,
          status: response.status,
          message: data?.error || data?.message || 'An error occurred',
          data
        };
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        return null;
      }
      return {
        _isApiError: true,
        status: 500,
        message: 'Network connection failed',
        error
      };
    } finally {
      setTimeout(() => {
        delete pendingRequests[cacheKey];
      }, 1000);
    }
  })();

  pendingRequests[cacheKey] = promise;
  return promise;
};
