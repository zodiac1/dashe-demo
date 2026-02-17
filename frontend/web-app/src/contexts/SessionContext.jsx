import { createContext, useContext, useState } from 'react';

const SessionContext = createContext();


export function SessionProvider({ children }) {
  const [session, setSession] = useState({ access_token: '', username: '', role: '' });

  const saveSession = ({ access_token, username, role }) => {
    setSession({ access_token, username, role });
  };

  const clearSession = () => {
    setSession({ access_token: '', username: '', role: '' });
  };

  return (
    <SessionContext.Provider value={{ session, saveSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
