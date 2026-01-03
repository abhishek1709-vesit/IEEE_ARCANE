import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '../services/authService';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      if (isAuth) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return null;
}
