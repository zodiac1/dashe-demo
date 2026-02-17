import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionData {
  accessToken: string | null;
  userId: string | null;
}

interface SessionContextProps extends SessionData {
  setSession: (data: SessionData) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const setSession = ({ accessToken, userId }: SessionData) => {
    setAccessToken(accessToken);
    setUserId(userId);
  };

  const clearSession = () => {
    setAccessToken(null);
    setUserId(null);
  };

  return (
    <SessionContext.Provider value={{ accessToken, userId, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
