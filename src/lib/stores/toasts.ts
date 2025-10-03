import { writable } from 'svelte/store';

export interface Toast {
        id: string;
        type: 'success' | 'error' | 'info' | 'warning';
        title: string;
        message?: string;
        duration?: number;
        action?: { label: string; onClick: () => void };
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
        const id = Math.random().toString(36).slice(2);
        const newToast: Toast = {
                id,
                duration: 5000,
                ...toast
        };

        toasts.update((list) => [...list, newToast]);

        if (newToast.duration && newToast.duration > 0) {
                setTimeout(() => removeToast(id), newToast.duration);
        }

        return id;
}

export function removeToast(id: string) {
        toasts.update((list) => list.filter((toast) => toast.id !== id));
}
