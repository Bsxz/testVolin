import { useCallback } from 'react';
import { useAuthStore } from './authStore';
import { useDeviceStore } from './deviceStore';
import { useThemeStore } from './themeStore';
// 状态管理入口文件
export { useAuthStore } from './authStore';
export { useDeviceStore } from './deviceStore';
export { useThemeStore } from './themeStore';
export type { Device, Space, Scene } from './deviceStore';
export type { ThemeConfig, ThemeMode } from './themeStore';

// 认证相关hooks
export const useAuth = () => {
  const {
    isLoggedIn,
    user,
    token,
    isLoading,
    login,
    loginWithOnePass,
    logout,
    checkAuthStatus,
    updateUser,
    setLoading,
  } = useAuthStore();

  return {
    isLoggedIn,
    user,
    token,
    isLoading,
    login,
    loginWithOnePass,
    logout,
    checkAuthStatus,
    updateUser,
    setLoading,
  };
};

// 设备相关hooks
export const useDevices = () => {
  const {
    devices,
    spaces,
    scenes,
    isLoading,
    selectedSpace,
    toggleDevice,
    updateDeviceStatus,
    updateDeviceProperty,
    setSelectedSpace,
    getDevicesBySpace,
    toggleScene,
    enableScene,
    loadDevices,
    loadSpaces,
    loadScenes,
    refreshAll,
    setLoading,
  } = useDeviceStore();

  return {
    devices,
    spaces,
    scenes,
    isLoading,
    selectedSpace,
    toggleDevice,
    updateDeviceStatus,
    updateDeviceProperty,
    setSelectedSpace,
    getDevicesBySpace,
    toggleScene,
    enableScene,
    loadDevices,
    loadSpaces,
    loadScenes,
    refreshAll,
    setLoading,
  };
};

// 主题相关hooks
export const useTheme = () => {
  const {
    mode,
    theme,
    isDark,
    setMode,
    toggleTheme,
    updateTheme,
    getTheme,
    isDarkMode,
  } = useThemeStore();

  return {
    mode,
    theme,
    isDark,
    setMode,
    toggleTheme,
    updateTheme,
    getTheme,
    isDarkMode,
  };
};

// 应用初始化hook
export const useAppInit = () => {
  const { checkAuthStatus } = useAuthStore();
  const { refreshAll } = useDeviceStore();

  const initializeApp = useCallback(async () => {
    try {
      // 检查认证状态
      await checkAuthStatus();

      // 如果已登录，加载设备数据
      const { isLoggedIn } = useAuthStore.getState();
      if (isLoggedIn) {
        await refreshAll();
      }
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }, [checkAuthStatus, refreshAll]);

  return { initializeApp };
};
