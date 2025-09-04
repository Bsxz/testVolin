import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import { createAxiosProxyConfig } from '../config/proxy'; // 不再需要代理

// API配置
const API_CONFIG = {
  development: {
    BASE_URL: "http://192.168.99.25:8088", // 后端服务器地址
    TIMEOUT: 15000, // 增加超时时间
    // 不再需要代理配置
  },
  production: {
    BASE_URL: "https://your-api-domain.com/api", // 修改为你的生产环境地址
    TIMEOUT: 15000,
  },
};

// 获取当前环境配置
const getCurrentConfig = () => {
  const isDev = __DEV__;
  return isDev ? API_CONFIG.development : API_CONFIG.production;
};

// 响应数据类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 请求配置类型
interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
}

class AxiosService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const config = getCurrentConfig();

    // 打印当前配置信息
    console.log("🌐 Axios配置信息:");
    console.log("- 环境:", __DEV__ ? "development" : "production");
    console.log("- 基础URL:", config.BASE_URL);
    console.log("- 超时时间:", config.TIMEOUT);

    const axiosConfig: any = {
      baseURL: config.BASE_URL,
      timeout: config.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    // 不再需要代理配置，直接连接后端服务器

    this.axiosInstance = axios.create(axiosConfig);

    this.setupInterceptors();
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // 添加认证token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // 检查网络连接
        const netInfo = await NetInfo.fetch();
        console.log("📡 网络状态:", {
          isConnected: netInfo.isConnected,
          type: netInfo.type,
          isInternetReachable: netInfo.isInternetReachable,
        });

        if (!netInfo.isConnected) {
          throw new Error("网络连接不可用，请检查网络设置");
        }

        // 不再需要动态代理配置

        console.log(
          `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`,
          config.data
        );
        return config;
      },
      (error) => {
        console.error("[Axios Request Error]", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(
          `[Axios Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
          response.data
        );
        return response;
      },
      (error) => {
        console.error("[Axios Response Error]", error);

        // 处理不同类型的错误
        if (error.response) {
          // 服务器响应了错误状态码
          const { status, data } = error.response;
          const message = data?.message || "服务器错误";

          switch (status) {
            case 401:
              // 未授权，清除token
              this.setToken(null);
              throw new Error("登录已过期，请重新登录");
            case 403:
              throw new Error("没有权限访问");
            case 404:
              throw new Error("请求的资源不存在");
            case 500:
              throw new Error("服务器内部错误");
            default:
              throw new Error(message);
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          throw new Error("网络连接失败，请检查网络设置");
        } else {
          // 其他错误
          throw new Error(error.message || "请求失败");
        }
      }
    );
  }

  /**
   * 设置认证token
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * 获取认证token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * 发送请求
   */
  async request<T = any>(
    config: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.request(config);
      const { data } = response;

      return {
        data: data.data,
        success: data.success,
        message: data.message,
        code: data.code,
      };
    } catch (error) {
      console.error(
        `[Axios Error] ${config.method?.toUpperCase()} ${config.url}`,
        error
      );
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : "请求失败",
        code: -1,
      };
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  /**
   * PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  /**
   * 文件上传
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<{ data: T; success: boolean; message?: string; code?: number }> {
    return this.request<T>({
      ...config,
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    });
  }

  /**
   * 下载文件
   */
  async download(url: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.axiosInstance.get(url, {
      ...config,
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * 取消请求
   */
  createCancelToken() {
    return axios.CancelToken.source();
  }
}

// 创建单例实例
export const axiosService = new AxiosService();

// 便捷的请求函数
export const request = <T = any>(url: string, options: RequestConfig = {}) =>
  axiosService.request<T>({ ...options, url });

export const get = <T = any>(url: string, config?: RequestConfig) =>
  axiosService.get<T>(url, config);

export const post = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
) => axiosService.post<T>(url, data, config);

export const put = <T = any>(url: string, data?: any, config?: RequestConfig) =>
  axiosService.put<T>(url, data, config);

export const del = <T = any>(url: string, config?: RequestConfig) =>
  axiosService.delete<T>(url, config);

export const upload = <T = any>(
  url: string,
  formData: FormData,
  config?: RequestConfig
) => axiosService.upload<T>(url, formData, config);

export default axiosService;
