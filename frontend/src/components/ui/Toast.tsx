import { useUiStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white cursor-pointer transition-opacity",
            toast.type === "success" && "bg-green-600",
            toast.type === "error" && "bg-red-600",
            toast.type === "info" && "bg-gray-800",
          )}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
