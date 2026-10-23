import React, { createContext, useContext, useState, useEffect } from 'react';
import { RealtimeEvent } from '../types';

interface RealtimeContextType {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
  toasts: Array<{ id: string; message: string; type: string; timestamp: string }>;
  dismissToast: (id: string) => void;
  triggerRefresh: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [triggerRefresh, setTriggerRefresh] = useState<number>(0);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string; timestamp: string }>>([]);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      es = new EventSource('/api/realtime/stream');

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'CONNECTED') {
            setIsConnected(true);
            return;
          }

          setLastEvent(data);
          // Trigger components to refetch latest data automatically
          setTriggerRefresh((prev) => prev + 1);

          // Add toast if meaningful message
          if (data.message) {
            const toastId = 'tst-' + Date.now();
            setToasts((prev) => [
              ...prev.slice(-3), // keep max 4 toasts
              {
                id: toastId,
                message: data.message,
                type: data.type,
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
            ]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 6000);
          }
        } catch (err) {
          // ignore parse error
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        if (es) {
          es.close();
        }
        // Attempt reconnect after 5s
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        lastEvent,
        toasts,
        dismissToast,
        triggerRefresh,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return ctx;
}
