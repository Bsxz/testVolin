import axiosService, { get, post, put } from "../utils/axios";

// 用户登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
}

// 一键登录请求参数
export interface OnePassLoginRequest {
  token: string;
  mobile?: string;
  operatorType?: string;
  // 可能需要的其他参数
  deviceId?: string;
  platform?: string;
}

// 用户信息 - 匹配后端返回格式
export interface UserInfo {
  uid: number;
  userId: number;
  mobile: string;
  nickName: string;
  avatar: string;
  status: number;
  createTime: number;
  lastLoginTime: number | null;
  hasController: boolean;
}

// 后端响应格式
export interface BackendResponse<T = any> {
  success: boolean;
  code: number;
  data: T;
}

// 登录响应 - 匹配后端格式
export interface LoginResponse extends BackendResponse<UserInfo> {
  data: UserInfo & { token: string };
}

// 一键登录验证响应 - 匹配后端格式
export interface OnePassVerifyResponse
  extends BackendResponse<UserInfo & { token: string }> {
  data: UserInfo & { token: string };
}

class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    ONEPASS_VERIFY: "/volin/login/oneClick", // 一键登录接口
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",
    USER_INFO: "/auth/user",
    UPDATE_PROFILE: "/auth/profile",
  };

  /**
   * 用户名密码登录
   */
  async login(credentials: LoginRequest) {
    const { data, success } = await post(
      this.AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if (success && data.token) {
      // 设置token到axios实例
      axiosService.setToken(data.token);
      await this.saveTokenToStorage(data.token);
    }

    return { data, success };
  }

  /**
   * 一键登录验证
   */
  async verifyOnePassLogin(onePassData: OnePassLoginRequest) {
    const response = await post<OnePassVerifyResponse>(
      this.AUTH_ENDPOINTS.ONEPASS_VERIFY,
      onePassData
    );

    if (response.success && (response.data as any)?.token) {
      // 设置token到axios实例
      axiosService.setToken((response.data as any).token);
      await this.saveTokenToStorage((response.data as any).token);
    }

    return response;
  }

  /**
   * 刷新token
   */
  async refreshToken() {
    const refreshToken = await this.getRefreshTokenFromStorage();
    if (!refreshToken) {
      throw new Error("没有可用的刷新token");
    }

    const { data, success } = await post(this.AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken,
    });

    if (success && data.token) {
      axiosService.setToken(data.token);
      await this.saveTokenToStorage(data.token);
    }

    return { data, success };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    const { data, success } = await get(this.AUTH_ENDPOINTS.USER_INFO);

    if (success) {
      return data;
    }

    throw new Error("获取用户信息失败");
  }

  /**
   * 更新用户资料
   */
  async updateProfile(profileData: Partial<UserInfo>) {
    const { data, success } = await put(
      this.AUTH_ENDPOINTS.UPDATE_PROFILE,
      profileData
    );

    if (success) {
      return data;
    }

    throw new Error("更新用户资料失败");
  }

  /**
   * 退出登录
   */
  async logout() {
    const { data, success } = await post(this.AUTH_ENDPOINTS.LOGOUT);

    // 清除本地token
    await this.clearTokensFromStorage();
    axiosService.setToken(null);

    return { data, success };
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getTokenFromStorage();
      if (!token) {
        return false;
      }

      // 设置token到axios实例
      axiosService.setToken(token);

      // 验证token是否有效
      await this.getUserInfo();
      return true;
    } catch (error) {
      console.error("检查登录状态失败:", error);
      // 如果验证失败，清除无效token
      await this.clearTokensFromStorage();
      axiosService.setToken(null);
      return false;
    }
  }

  /**
   * 保存token到本地存储
   */
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("保存token失败:", error);
    }
  }

  /**
   * 从本地存储获取token
   */
  private async getTokenFromStorage(): Promise<string | null> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("获取token失败:", error);
      return null;
    }
  }

  /**
   * 从本地存储获取刷新token
   */
  private async getRefreshTokenFromStorage(): Promise<string | null> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem("refresh_token");
    } catch (error) {
      console.error("获取刷新token失败:", error);
      return null;
    }
  }

  /**
   * 清除本地存储的tokens
   */
  private async clearTokensFromStorage(): Promise<void> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.multiRemove(["auth_token", "refresh_token"]);
    } catch (error) {
      console.error("清除tokens失败:", error);
    }
  }
}

// 创建单例实例
export const authService = new AuthService();
export default authService;
