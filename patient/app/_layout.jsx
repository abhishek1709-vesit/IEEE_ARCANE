import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { isAuthenticated } from "../services/authService";
import { StatusBar } from "expo-status-bar";
import "./global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();

      // Not logged in → redirect to login
      if (
        !isAuth &&
        !segments.includes("login") &&
        !segments.includes("register")
      ) {
        router.replace("/login");
      }

      // Logged in → prevent access to auth screens
      if (
        isAuth &&
        (segments.includes("login") || segments.includes("register"))
      ) {
        router.replace("/(tabs)/home");
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
