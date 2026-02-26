import axios, { type AxiosError } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = "access_token";
const LOGIN_PATH = "/login";

type ValidationErrorItem = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

type ValidationErrorResponse = {
  detail?: ValidationErrorItem[] | string;
};

type ApiErrorHandlers = {
  onUnauthorized?: () => void;
  onValidationError?: (messages: string[]) => void;
};

const apiErrorHandlers: ApiErrorHandlers = {};

export function registerApiErrorHandlers(handlers: ApiErrorHandlers) {
  apiErrorHandlers.onUnauthorized = handlers.onUnauthorized;
  apiErrorHandlers.onValidationError = handlers.onValidationError;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  Cookies.set(ACCESS_TOKEN_KEY, token, { sameSite: "strict" });
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  Cookies.remove(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return Cookies.get(ACCESS_TOKEN_KEY) ?? window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
}

function getValidationMessages(data: ValidationErrorResponse | undefined): string[] {
  const detail = data?.detail;

  if (typeof detail === "string" && detail.trim().length > 0) {
    return [detail];
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item.msg).filter(Boolean);
  }

  return ["Validation error"];
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ValidationErrorResponse>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuthToken();
      apiErrorHandlers.onUnauthorized?.();
      redirectToLogin();
    }

    if (status === 422) {
      const messages = getValidationMessages(error.response?.data);
      apiErrorHandlers.onValidationError?.(messages);
    }

    return Promise.reject(error);
  },
);

export default api;
