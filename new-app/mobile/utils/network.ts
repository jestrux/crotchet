interface NetworkRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  bearerToken?: string;
}

export const networkRequest = async <T>(
  url: string,
  options: NetworkRequestOptions = {}
): Promise<T> => {
  const { method = 'GET', headers = {}, body, bearerToken } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (bearerToken) {
    requestHeaders['Authorization'] = `Bearer ${bearerToken}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Network request failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network request failed:', error);
    throw error;
  }
}; 