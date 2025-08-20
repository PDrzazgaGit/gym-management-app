import { AppError } from "../data/AppError";

export function ok(data: any) {
  return { success: true, data };
}

export function fail(err: AppError | Error, fallback: string) {
  return { success: false, error: err?.message || fallback };
}