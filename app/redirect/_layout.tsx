import { useAuthStore } from "@/store";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { Text, useColorScheme } from "react-native";
import { useSession } from "../ctx";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const isDarkMode = useColorScheme() === "dark";
  const { isLoggedIn, checkAuthStatus } = useAuthStore();

  // 应用启动时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!isLoggedIn) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href={"/login"} />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}
