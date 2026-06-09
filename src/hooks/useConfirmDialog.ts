import { useState } from 'react';
import type { ConfirmDialogProps } from '../components/common/ConfirmDialog';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
};

const initialOptions: ConfirmOptions = {
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  onConfirm: () => undefined,
};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>(initialOptions);

  function confirm(nextOptions: ConfirmOptions) {
    setOptions({ ...nextOptions, cancelLabel: nextOptions.cancelLabel ?? 'Cancelar' });
    setOpen(true);
  }

  function close() {
    if (!isLoading) {
      setOpen(false);
    }
  }

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await options.onConfirm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const dialogProps: ConfirmDialogProps = {
    open,
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel,
    cancelLabel: options.cancelLabel ?? 'Cancelar',
    isLoading,
    onCancel: close,
    onConfirm: () => void handleConfirm(),
  };

  return { confirm, dialogProps };
}
