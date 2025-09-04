import { create } from "zustand";
// import { persist, createJSONStorage } from 'zustand/middleware';
import { Appearance } from "react-native";

// 主题类型
export type ThemeMode = "light" | "dark" | "system";

// 主题配置接口
export interface ThemeConfig {
  colors: {
    // 基础颜色
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;

    // 文本颜色
    text: string;
    textSecondary: string;
    textDisabled: string;

    // 状态颜色
    success: string;
    warning: string;
    error: string;
    info: string;

    // 边框和分割线
    border: string;
    divider: string;

    // 输入框
    inputBackground: string;
    inputBorder: string;
    placeholder: string;

    // 按钮
    buttonPrimary: string;
    buttonSecondary: string;
    buttonText: string;
    buttonDisabled: string;

    // 阴影
    shadow: string;

    // 透明色
    overlay: string;
  };

  // 字体配置
  fonts: {
    // 字体族
    regular: string;
    medium: string;
    bold: string;
    light: string;
    // 字体大小
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  // 间距
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  // 圆角
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// 浅色主题
const lightTheme: ThemeConfig = {
  colors: {
    primary: "#3498db",
    secondary: "#2ecc71",
    background: "#f8f9fa",
    surface: "#ffffff",
    card: "#ffffff",

    text: "#333333",
    textSecondary: "#666666",
    textDisabled: "#999999",

    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
    info: "#3498db",

    border: "#e1e8ed",
    divider: "#e1e8ed",

    inputBackground: "#ffffff",
    inputBorder: "#e1e8ed",
    placeholder: "#999999",

    buttonPrimary: "#3498db",
    buttonSecondary: "#95a5a6",
    buttonText: "#ffffff",
    buttonDisabled: "#bdc3c7",

    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  fonts: {
    // 字体族 - 使用系统默认字体，也可以指定自定义字体
    regular: "System", // iOS: 'System', Android: 'Roboto'
    medium: "System",
    bold: "System",
    light: "System",
    // 字体大小
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// 深色主题
const darkTheme: ThemeConfig = {
  colors: {
    primary: "#4a9eff",
    secondary: "#2ecc71",
    background: "#121212",
    surface: "#1e1e1e",
    card: "#2d2d2d",

    text: "#ffffff",
    textSecondary: "#b3b3b3",
    textDisabled: "#666666",

    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",

    border: "#333333",
    divider: "#333333",

    inputBackground: "#2d2d2d",
    inputBorder: "#333333",
    placeholder: "#666666",

    buttonPrimary: "#4a9eff",
    buttonSecondary: "#555555",
    buttonText: "#ffffff",
    buttonDisabled: "#444444",

    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
  },

  fonts: {
    // 字体族 - 使用系统默认字体，也可以指定自定义字体
    regular: "System", // iOS: 'System', Android: 'Roboto'
    medium: "System",
    bold: "System",
    light: "System",
    // 字体大小
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// 主题状态管理
interface ThemeState {
  // 状态
  mode: ThemeMode;
  theme: ThemeConfig;
  isDark: boolean;

  // 操作
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;

  // 工具方法
  getTheme: () => ThemeConfig;
  isDarkMode: () => boolean;
}

// 创建主题状态管理
export const useThemeStore = create<ThemeState>()((set, get) => ({
  // 初始状态
  mode: "system",
  theme: lightTheme,
  isDark: false,

  // 设置主题模式
  setMode: (mode: ThemeMode) => {
    const currentState = get();
    // 如果模式没有变化，直接返回
    if (currentState.mode === mode) {
      return;
    }

    const systemColorScheme = Appearance.getColorScheme();
    const isDark =
      mode === "dark" || (mode === "system" && systemColorScheme === "dark");

    set({
      mode,
      theme: isDark ? darkTheme : lightTheme,
      isDark,
    });
  },

  // 切换主题
  toggleTheme: () => {
    const { mode } = get();
    const newMode = mode === "light" ? "dark" : "light";
    get().setMode(newMode);
  },

  // 更新主题配置
  updateTheme: (newTheme: Partial<ThemeConfig>) => {
    const { theme } = get();
    set({
      theme: {
        ...theme,
        ...newTheme,
        colors: {
          ...theme.colors,
          ...newTheme.colors,
        },
        fonts: {
          ...theme.fonts,
          ...newTheme.fonts,
        },
        spacing: {
          ...theme.spacing,
          ...newTheme.spacing,
        },
        borderRadius: {
          ...theme.borderRadius,
          ...newTheme.borderRadius,
        },
      },
    });
  },

  // 获取当前主题
  getTheme: () => {
    return get().theme;
  },

  // 检查是否为深色模式
  isDarkMode: () => {
    return get().isDark;
  },
}));

// 监听系统主题变化
Appearance.addChangeListener(({ colorScheme }) => {
  const { mode } = useThemeStore.getState();
  if (mode === "system") {
    // 直接更新主题，不调用setMode避免循环
    const isDark = colorScheme === "dark";
    useThemeStore.setState({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
    });
  }
});
