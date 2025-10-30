export class HttpError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

let getAccessToken: (() => string | null) | null = null;

export function setTokenProvider(tokenProvider: () => string | null) {
  getAccessToken = tokenProvider;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const headers = new Headers(init?.headers);

    if (getAccessToken) {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.debug("apiFetch: Authorization header set");
      }
    }

    const requestInit: RequestInit = {
      ...init,
      headers,
    };

    const res = await fetch(input, requestInit);

    if (!res.ok) {
      let body: unknown = null;
      body = await res.clone().json();

      const url =
        typeof input === "string"
          ? input
          : input instanceof Request
          ? input.url
          : String(input);
      const statusText = res.statusText || "Unknown error";

      let messageFromServer: string | null = null;
      if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        if (typeof b.error === "string") messageFromServer = b.error;
        else if (typeof b.message === "string") messageFromServer = b.message;
      } else if (typeof body === "string") {
        messageFromServer = body;
      }

      // Handle authentication/authorization errors
      if (res.status === 401 || res.status === 403) {
        const authMessage =
          res.status === 401
            ? "Your session has expired. Please log in again."
            : "You don't have permission to access this resource.";
        console.log("Authentication error:", messageFromServer || authMessage);
        throw new HttpError(messageFromServer || authMessage, res.status);
      }

      const message =
        messageFromServer ||
        `${statusText} (${res.status}) when calling ${url}`;
      console.log("API error:", message);
      throw new HttpError(message, res.status);
    }

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
        ? input.url
        : String(input);
    console.error(`apiFetch error calling ${url}:`, msg);
    throw err;
  }
}

export default apiFetch;
