// API service for communicating with the resume-ai server
// Default to server dev port 8081. Override via NEXT_PUBLIC_API_URL if needed.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

// Output contract from backend/LLM
interface ChatResponse {
  reply: string;
  resume_updates: {
    has_updates: boolean;
    update_trigger: 'explicit_request' | 'inferred_intent' | 'none';
    sections_changed: string[];
    reason: string;
  };
  output_resume_markdown: string;
  credits?: number;
}

interface RewriteResponse {
  text: string;
}

interface StripeSessionResponse {
  url: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  geminiConfigured: boolean;
}

interface LogoutResponse {
  message: string;
}

class ApiService {
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const isFormData =
        typeof window !== 'undefined' && options.body instanceof FormData;

      const headers = new Headers(options?.headers ?? {});

      // Attach Authorization header from localStorage if not provided
      try {
        if (!headers.has('Authorization') && typeof window !== 'undefined') {
          const jwtToken = localStorage.getItem('jwtToken');
          if (jwtToken) headers.set('Authorization', `Bearer ${jwtToken}`);
        }
      } catch {}

      // Convert Headers to plain object
      const headersObj: Record<string, string> = {};
      headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      // Merge with Content-Type if needed
      const _headers = isFormData
        ? headersObj
        : { 'Content-Type': 'application/json', ...headersObj };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: _headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error:
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async bootstrap(temporaryUserId?: string | null): Promise<
    ApiResponse<
      | {
          isAuthenticated: false;
          isGuestUser: true;
          temporaryUserId: string;
          chatId: string;
          chatTitle?: string;
          credits: number;
          freeCredits: number;
          jwtToken: string;
          refreshToken: string;
        }
      | {
          isAuthenticated: true;
          isGuestUser: boolean;
          user: any;
          chatId: string;
          chatTitle?: string;
          credits: number;
        }
    >
  > {
    let url = '/api/bootstrap';
    if (temporaryUserId) {
      url += `?temporaryUserId=${encodeURIComponent(temporaryUserId)}`;
    }
    return this.fetchWithErrorHandling(url);
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;
    return this.fetchWithErrorHandling<LogoutResponse>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  async createCheckoutSession(
    planId: string,
  ): Promise<ApiResponse<StripeSessionResponse>> {
    return this.fetchWithErrorHandling<StripeSessionResponse>(
      `/api/payments/create-checkout-session?plan=${planId}`,
      {
        method: 'POST',
      },
    );
  }

  async getChatHistory(
    chatId: string,
    temporaryUserId?: string | null,
  ): Promise<ApiResponse<any[]>> {
    let url = `/api/ai/chat/history?chatId=${chatId}`;
    if (temporaryUserId) {
      url += `&temporaryUserId=${temporaryUserId}`;
    }
    return this.fetchWithErrorHandling(url);
  }

  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return this.fetchWithErrorHandling<HealthResponse>('/api/health');
  }

  // Public fetch helper (e.g., runtime config)
  async fetchPublic<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.fetchWithErrorHandling<T>(endpoint, options);
  }

  async chat(
    user_message: string,
    current_resume_markdown: string,
    chat_history: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [],
  ): Promise<ApiResponse<ChatResponse>> {
    const chatId = localStorage.getItem('chatId');
    const jwt =
      typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
    const tempId =
      typeof window !== 'undefined'
        ? localStorage.getItem('temporaryUserId')
        : null;
    let chatEndpoint = '/api/ai/chat';
    if (!jwt && tempId) {
      chatEndpoint = `/api/ai/chat?temporaryUserId=${encodeURIComponent(
        tempId,
      )}`;
    }
    return this.fetchWithErrorHandling<ChatResponse>(chatEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        user_message,
        current_resume_markdown,
        chat_history,
        chatId,
      }),
    });
  }

  async chatWithFiles(
    user_message: string,
    current_resume_markdown: string,
    chat_history: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [],
    files: File[] = [],
  ): Promise<ApiResponse<ChatResponse>> {
    const chatId = localStorage.getItem('chatId');
    const jwt =
      typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
    const tempId =
      typeof window !== 'undefined'
        ? localStorage.getItem('temporaryUserId')
        : null;

    let chatEndpoint = '/api/ai/chat';
    if (!jwt && tempId) {
      chatEndpoint = `/api/ai/chat?temporaryUserId=${encodeURIComponent(tempId)}`;
    }

    const fd = new FormData();
    fd.append('user_message', user_message);
    fd.append('current_resume_markdown', current_resume_markdown || '');
    fd.append('chat_history', JSON.stringify(chat_history || []));
    if (chatId) {
      fd.append('chatId', chatId);
    }
    for (const f of files) fd.append('files', f);
    return this.fetchWithErrorHandling<ChatResponse>(chatEndpoint, {
      method: 'POST',
      body: fd,
    });
  }

  async rewrite(selection: string): Promise<ApiResponse<RewriteResponse>> {
    return this.fetchWithErrorHandling<RewriteResponse>('/api/ai/rewrite', {
      method: 'POST',
      body: JSON.stringify({ selection }),
    });
  }

  async updateChatTitle(
    chatId: string,
    title: string,
  ): Promise<ApiResponse<{ success: boolean; title: string }>> {
    return this.fetchWithErrorHandling<{ success: boolean; title: string }>(
      '/api/ai/chat/title',
      {
        method: 'PATCH',
        body: JSON.stringify({ chatId, title }),
      },
    );
  }
}

export const apiService = new ApiService();
export type { ChatResponse, RewriteResponse, HealthResponse };
