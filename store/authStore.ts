import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { UserInfo } from '../services/auth';

// 认证状态接口
interface AuthState {
  // 状态
  isLoggedIn: boolean;
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;

  // 操作
  login: (username: string, password: string) => Promise<boolean>;
  loginWithOnePass: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUser: (userInfo: Partial<UserInfo>) => void;
  setLoading: (loading: boolean) => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isLoggedIn: false,
      user: null,
      token: null,
      isLoading: false,

      // 用户名密码登录
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          // 临时测试登录 - 任何用户名密码都可以登录
          console.log('尝试登录:', { username, password });

          // 模拟登录延迟
          await new Promise<void>(resolve => setTimeout(resolve, 1000));

          // 创建模拟用户数据
          const mockUser: UserInfo = {
            uid: 1,
            userId: 1,
            mobile: '138****8888',
            nickName: username,
            avatar: '',
            status: 1,
            createTime: Date.now(),
            lastLoginTime: null,
            hasController: false,
          };

          const mockToken = `mock_token_${Date.now()}`;

          set({
            isLoggedIn: true,
            user: mockUser,
            token: mockToken,
            isLoading: false,
          });

          console.log('登录成功:', mockUser);
          return true;

          // 原始后端登录代码（暂时注释）
          /*
          const { data, success } = await authService.login({ username, password });

          if (success && data) {
            set({
              isLoggedIn: true,
              user: data.user,
              token: data.token,
              isLoading: false,
            });
            return true;
          }

          set({ isLoading: false });
          return false;
          */
        } catch (error) {
          console.error('登录失败:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // 一键登录
      loginWithOnePass: async (token: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.verifyOnePassLogin({
            token,
          });

          if (response.success && response.data) {
            // 从后端响应中提取用户信息和token
            const { token: userToken, ...userInfo } = response.data as any;

            set({
              isLoggedIn: true,
              user: userInfo,
              token: userToken,
              isLoading: false,
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('一键登录失败:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // 退出登录
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
          });
        } catch (error) {
          console.error('退出登录失败:', error);
          // 即使失败也要清除本地状态
          set({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      },

      // 检查认证状态
      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const isLoggedIn = await authService.isLoggedIn();
          if (isLoggedIn) {
            const userInfo = await authService.getUserInfo();
            set({
              isLoggedIn: true,
              user: userInfo,
              isLoading: false,
            });
          } else {
            set({
              isLoggedIn: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('检查认证状态失败:', error);
          set({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      },

      // 更新用户信息
      updateUser: (userInfo: Partial<UserInfo>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userInfo },
          });
        }
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // 存储键名
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化必要的状态
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
