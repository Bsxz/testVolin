import * as OnePassSDK from "react-native-aliyun-onekey";

export interface OnePassConfig {
  secretInfo: string; // 阿里云秘钥信息
}

export interface OnePassResult {
  success: boolean;
  mobile?: string;
  token?: string;
  error?: string;
  code?: number;
  message?: string; // 添加 message 属性
}

class OnePassService {
  private config: OnePassConfig | null = null;
  private isInitialized = false;

  /**
   * 初始化一键登录服务
   */
  async init(config: OnePassConfig): Promise<boolean> {
    try {
      this.config = config;
      const result = await OnePassSDK.init(config.secretInfo);
      this.isInitialized = true;
      console.log("一键登录初始化成功:", result);
      return true;
    } catch (error) {
      console.error("一键登录初始化失败:", error);
      return false;
    }
  }

  /**
   * 检查是否支持一键登录
   */
  async isSupported(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log("一键登录未初始化");
        return false;
      }

      const result = await OnePassSDK.checkEnvAvailable(1);
      console.log("检查一键登录支持状态:", result);
      return result === true;
    } catch (error) {
      console.log("检查一键登录支持状态失败:", error);
      return false;
    }
  }

  /**
   * 预取号
   */
  async prefetch(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log("一键登录未初始化");
        return false;
      }

      const result = await OnePassSDK.prefetch();
      console.log("预取号结果:", result);

      // 预取号成功时返回运营商信息（如 CTCC），失败时返回 false
      // 所以只要不是 false 就表示成功
      return result !== false;
    } catch (error) {
      console.error("预取号失败:", error);
      return false;
    }
  }

  /**
   * 启动一键登录
   */
  async startOnePass(): Promise<OnePassResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: "请先初始化一键登录配置",
        };
      }

      // 启动一键登录
      await OnePassSDK.onePass();
      console.log("一键登录已启动，等待结果...");

      // 由于 onePass 通过事件回调返回结果，这里需要等待事件
      // 暂时返回成功，实际结果通过事件监听处理
      return {
        success: true,
        message: "一键登录已启动，请查看事件回调",
      };
    } catch (error) {
      console.error("一键登录异常:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "一键登录异常",
      };
    }
  }

  /**
   * 设置UI配置
   */
  async setUIConfig(config: any): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.log("一键登录未初始化");
        return;
      }

      await OnePassSDK.setUIConfig(config);
      console.log("UI配置设置成功");
    } catch (error) {
      console.error("设置UI配置失败:", error);
    }
  }

  /**
   * 退出登录页面
   */
  async quitLoginPage(): Promise<void> {
    try {
      await OnePassSDK.quitLoginPage();
    } catch (error) {
      console.error("退出登录页面失败:", error);
    }
  }
  /**
   * 隐藏登录加载
   */
  async hideLoginLoading(): Promise<void> {
    try {
      await OnePassSDK.hideLoginLoading();
    } catch (error) {
      console.error("隐藏登录加载失败:", error);
    }
  }

  /**
   * 添加事件监听
   */
  addListener(eventName: string, callback: (data: any) => void) {
    return OnePassSDK.addListener(eventName, callback);
  }

  /**
   * 获取运营商类型
   */
  async getOperatorType(): Promise<string> {
    try {
      return await OnePassSDK.getOperatorType();
    } catch (error) {
      console.error("获取运营商类型失败:", error);
      return "未知";
    }
  }

  // 导出常量
  get EVENTS() {
    return OnePassSDK.EVENTS;
  }

  get RESULT_CODES() {
    return OnePassSDK.RESULT_CODES;
  }
}

export default new OnePassService();
