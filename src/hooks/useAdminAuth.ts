import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode JWT to check role (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return { user, loading, logout };
}
