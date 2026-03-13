import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.data?.detail) {
    const detail = error.response.data.detail;

    // If it's a standard string error
    if (typeof detail === "string") {
      return detail;
    }

    // If it's a FastAPI 422 Validation Array
    if (Array.isArray(detail)) {
      return detail
        .map((err: any) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : "Field";
          return `${field}: ${err.msg}`;
        })
        .join(" | ");
    }

    // Fallback for any other object
    return JSON.stringify(detail);
  }
  return fallback;
}
