import { useToastStore, type ToastVariant } from "@/store/toastStore";

export function useToast() {
  const pushToast = useToastStore((state) => state.pushToast);
  const dismissToast = useToastStore((state) => state.dismissToast);

  const notify = (
    variant: ToastVariant,
    title: string,
    description?: string,
  ) => pushToast({ variant, title, description });

  return {
    success: (title: string, description?: string) =>
      notify("success", title, description),
    error: (title: string, description?: string) =>
      notify("error", title, description),
    info: (title: string, description?: string) =>
      notify("info", title, description),
    dismiss: dismissToast,
  };
}
