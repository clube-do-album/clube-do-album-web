import type { ApiError } from '../../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Cache-Control', 'no-cache');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, cache: 'no-store' });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  const text = await response.text();
  const data = parseResponseBody(text);

  if (!response.ok) {
    const error = data as ApiError | null;
    throw new Error(resolveApiErrorMessage(response, error));
  }

  return data as T;
}

function parseResponseBody(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    } satisfies ApiError;
  }
}

function resolveApiErrorMessage(response: Response, error: ApiError | null) {
  const backendMessage = normalizeErrorMessage(error?.message ?? error?.error);

  if (backendMessage) {
    return backendMessage;
  }

  switch (response.status) {
    case 400:
      return 'Requisicao invalida. Confira os dados enviados.';
    case 401:
      return 'Sua sessao expirou. Entre novamente para continuar.';
    case 403:
      return 'Voce nao tem permissao para realizar esta acao.';
    case 404:
      return 'Nao encontramos o recurso solicitado.';
    case 409:
      return 'Essa acao conflita com um dado que ja existe.';
    case 422:
      return 'Nao foi possivel processar os dados enviados.';
    case 429:
      return 'Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.';
    default:
      if (response.status >= 500) {
        return 'O servidor encontrou um problema. Tente novamente em instantes.';
      }

      return `Nao foi possivel concluir a requisicao. Codigo ${response.status}.`;
  }
}

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'A requisicao demorou demais para responder. Tente novamente.';
  }

  if (error instanceof TypeError) {
    return 'Nao foi possivel conectar ao servidor. Verifique se a API esta online.';
  }

  return 'Nao foi possivel comunicar com o servidor.';
}

function normalizeErrorMessage(message?: string) {
  if (!message) {
    return '';
  }

  const normalized = message.trim();

  if (!normalized || normalized.toLowerCase() === 'failed to fetch') {
    return '';
  }

  if (normalized.toLowerCase() === 'internal server error') {
    return '';
  }

  return normalized;
}
