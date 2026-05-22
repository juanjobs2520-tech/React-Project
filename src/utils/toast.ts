import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, { className: 'edugest-toast-success' });
};

export const showErrorToast = (message: string) => {
  toast.error(message, { className: 'edugest-toast-error' });
};

export const showWarningToast = (message: string) => {
  toast(message, { icon: '⚠️', className: 'edugest-toast-warning' });
};

export const getApiErrorMessage = (error: unknown, fallback = 'Ocurrió un error'): string => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};
