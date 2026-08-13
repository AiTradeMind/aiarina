import React, { createContext, useContext, useState, useEffect } from 'react';
import { JWTPayload } from '../modules/identity/types/index';
import { fetchApi } from '../lib/api';

interface AuthContextType {
  user: JWTPayload | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/auth/me')
      .then((res) => {
        if (res && !res._isApiError) {
          setUser(res);
        } else if (import.meta.env.MODE === 'development') {
          setUser({
            userId: 9999,
            email: 'guest@aiarena.dev',
            role: 'admin',
            organizationId: 'dev-org',
            development: true
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
