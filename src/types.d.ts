declare global {
  interface Window {
    DodoPayments?: {
      open: (config: {
        url: string;
        onSuccess?: (data: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export {};

