import { ALIYUN_CONFIG } from "@/config/aliyun";
import OnePassService from "@/services/OnePassService";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore, useTheme } from "../../store";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const { login, loginWithOnePass, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [_isOnePassLoading, setIsOnePassLoading] = useState(false);
  const [_onePassSupported, setOnePassSupported] = useState(false);
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const initOnePass = async () => {
    if (isInitializing) {
      return;
    }

    setIsInitializing(true);
    try {
      const initResult = await OnePassService.init({
        secretInfo:
          ALIYUN_CONFIG[
            Platform.OS === "ios" ? "IOS_SECRET_INFO" : "ANDROID_SECRET_INFO"
          ],
      });

      if (initResult) {
        // 默认启用一键登录
        setOnePassSupported(true);
        // 设置UI配置
        await OnePassService.setUIConfig(ALIYUN_CONFIG.UI_CONFIG);

        // 设置事件监听器
        const successListener = OnePassService.addListener(
          OnePassService.EVENTS.onTokenSuccess,
          async (data) => {
            if (data.code === OnePassService.RESULT_CODES[600000]) {
              if (isLoggingIn) {
                return;
              }
              setIsLoggingIn(true);
              const success = await loginWithOnePass(data.token);
              if (success) {
                setIsOnePassLoading(false); // 清除加载状态
                console.log("一键登录成功，准备跳转到首页");
                // 关闭一键登录授权页面
                await OnePassService.quitLoginPage();
                onLoginSuccess?.();
              } else {
                setIsOnePassLoading(false); // 清除加载状态
                console.log("一键登录失败");
                // 登录失败也要关闭授权页面
                await OnePassService.quitLoginPage();
              }
              setIsLoggingIn(false);
            }
          }
        );

        const failListener = OnePassService.addListener(
          OnePassService.EVENTS.onTokenFailed,
          async (data) => {
            console.log("一键登录失败事件:", data);
            setIsOnePassLoading(false); // 清除加载状态
            // 关闭授权页面
            await OnePassService.quitLoginPage();
          }
        );

        // 监听切换账号事件
        const switchAuthListener = OnePassService.addListener(
          OnePassService.EVENTS.onTokenFailed, // 使用相同的事件，通过code区分
          async (data) => {
            if (data.code === OnePassService.RESULT_CODES[700001]) {
              setIsOnePassLoading(false); // 清除加载状态
              // 关闭授权页面
              await OnePassService.quitLoginPage();
            }
          }
        );

        try {
          // 只在第一次预取号
          if (!hasPrefetched) {
            const prefetchResult = await OnePassService.prefetch();
            setHasPrefetched(true);

            if (prefetchResult) {
              setIsOnePassLoading(true); // 设置加载状态
              await OnePassService.startOnePass();
            } else {
            }
          } else {
            setIsOnePassLoading(true);
            await OnePassService.startOnePass();
          }
        } catch (error) {
          setIsOnePassLoading(false); // 清除加载状态
        }

        // 清理监听器
        return () => {
          successListener.remove();
          failListener.remove();
          switchAuthListener.remove();
        };
      }
    } catch (error) {
      setOnePassSupported(true);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initOnePass();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.xxl,
    },
    logoText: {
      fontSize: theme.fonts.xxl * 2,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitleText: {
      fontSize: theme.fonts.md,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    formContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      fontSize: theme.fonts.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    loginButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    loginButtonDisabled: {
      backgroundColor: theme.colors.buttonDisabled,
    },
    loginButtonText: {
      color: theme.colors.buttonText,
      fontSize: theme.fonts.lg,
      fontWeight: "600",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      fontSize: theme.fonts.sm,
      color: theme.colors.textSecondary,
    },
    onePassButton: {
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    onePassButtonDisabled: {
      backgroundColor: theme.colors.buttonDisabled,
    },
    onePassButtonText: {
      color: theme.colors.buttonText,
      fontSize: theme.fonts.lg,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    footerText: {
      fontSize: theme.fonts.sm,
      color: theme.colors.textSecondary,
    },
    registerText: {
      fontSize: theme.fonts.sm,
      color: theme.colors.primary,
      fontWeight: "600",
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: safeAreaInsets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>{t("app.name")}</Text>
          <Text style={styles.subtitleText}>{t("app.subtitle")}</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.username")}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            disabled={isLoading}
            onPress={async () => {
              if (username && password) {
                const success = await login(username, password);
                if (success) {
                  console.log("手动登录成功，准备跳转到首页");
                  onLoginSuccess?.();
                } else {
                  console.log("手动登录失败");
                }
              }
            }}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? t("common.loading") : t("auth.login")}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("auth.noAccount")}</Text>
            <TouchableOpacity>
              <Text style={styles.registerText}>{t("auth.register")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
