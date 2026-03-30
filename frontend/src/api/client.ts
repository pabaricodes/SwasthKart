const BASE_URL = "/api/v1";

interface ApiError {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

class ApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (response.status === 204) return undefined as T;

    const data = await response.json();

    if (!response.ok) {
      const apiError = data as ApiError;
      throw {
        status: response.status,
        code: apiError.error?.code || "UNKNOWN_ERROR",
        message: apiError.error?.message || "Something went wrong",
        details: apiError.error?.details || {},
      };
    }

    return data as T;
  }

  get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return this.request<T>(path + query);
  }

  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
