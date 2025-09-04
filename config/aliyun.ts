import { Platform } from "react-native";

// 阿里云一键登录配置
export const ALIYUN_CONFIG = {
  // 阿里云控制台获取的秘钥信息
  // 使用方案Code作为AppID，配合密钥
  ANDROID_SECRET_INFO:
    "ThtEKb4Aw4UNCE3RXStDLXqPZe2b6grPKBeykKMUmQY4Sux30dp/tGPMWPDKRs418XAGhpy+9u4BesXBCb3i4nm2f+bNs0kU4Ie0IMYCTF8+3kIs8n6K1l+ecTvKObJtqeQlMpw8JvVZnviTWfbo7/G5+dHFXhjuYTB5ENqIXywpFcAAMn8qwABXCdaqbo3WEeAvH0lMHQABY1Gga4VmwLCRoWi+Tmiu3U/XnI1jsHyT6jvOq14p7Z+SIsbuSYXG/88wtLAk957fZKRZalGzDYgu99mo+TGk0FKM6TpFUYM=",
  IOS_SECRET_INFO:
    "vCVYGTVthTCNF9b7ru77zAh+XkjUJz8nhhSy1ULXAc1GIpTV04eKHXtCZArqsBX7f1EkfQ0PuLRyoN9cr+AK01ejT3GFqcRXsiLD77pEaTFSKs1AghvDc+2Sgla+RRh2zImLpjzxn+SYczO0FmmOEpZu93RJaYpSOfaqo9YiAvbv9DdWwF64Gcq1wBM3uU0cP1xmPbF4f80cSCFzP1+bpX4kbqjfhCJQV5+pp51vVjYI2H/uhPWCNZKWbGVbovOa",
  // 其他配置
  TIMEOUT: 5000, // 超时时间（毫秒）

  // UI配置 - 根据设计图调整
  UI_CONFIG: {
    // 基础配置
    lightColor: true, // 浅色主题
    statusBarHidden: false, // 显示状态栏
    navHidden: true, // 隐藏导航栏
    pageBackgroundPath: Platform.OS === "ios" ? "bg_image.png" : "bg_image",

    // Logo配置
    logoHidden: false,
    logoWidth: 132,
    logoHeight: 50,
    logoImgPath: Platform.OS === "ios" ? "logo.png" : "logo",
    logoOffsetY: 119, // Logo距离顶部的距离

    // 手机号显示配置
    numberColor: "#333333", // 黑色手机号
    numberSize: 24, // 较大字体
    numberFieldOffsetY: 258, // 手机号距离顶部的距离
    // 一键登录按钮配置
    logBtnText: "本机号码一键登录",
    logBtnTextColor: "#ffffff", // 白色文字
    logBtnTextSize: 16,
    // logBtnBackgroundPaths: 'btn_bg.png', // 绿色背景，匹配设计图
    logBtnBackgroundPath: "btn_bg",
    logBtnWidth: 279, // 按钮宽度
    logBtnHeight: 52, // 按钮高度
    logBtnOffsetY: 328, // 按钮距离顶部的距离
    // slogan
    sloganText: "",
    sloganTextSize: 0, // 隐藏slogan
    // 其他手机号选项
    switchAccText: "其他手机号",
    switchAccTextSize: 16,
    switchAccTextColor: "#333333",
    switchOffsetY: 404, // 其他手机号距离顶部的距离
    // 隐私协议配置
    privacyBefore: "同意涡灵",
    privacyEnd: "并且使用本机账号登录",
    checkboxHidden: false, // 显示复选框
    privacyState: false, // 默认未选中
    appPrivacyOneName: "《用户协议》",
    appPrivacyOneUrl: "https://your-domain.com/user-agreement",
    appPrivacyTwoName: "《隐私政策》",
    appPrivacyTwoUrl: "https://your-domain.com/privacy-policy",
    vendorPrivacyPrefix: "《",
    vendorPrivacySuffix: "》",
    privacyTextSize: 12,
    appPrivacyBaseColor: "#666666", // 灰色基础文字
    appPrivacyColor: "#333333", // 链接文字颜色

    // 复选框
    uncheckedImgPath: "unchecked",
    checkedImgPath: "checked",

    // 布局配置
    contentTopMargin: 100, // 内容顶部边距
    buttonTopMargin: 50, // 按钮顶部边距
    privacyTopMargin: 30, // 隐私协议顶部边距
  },
};

// 环境配置
export const ENV_CONFIG = {
  // 开发环境
  development: {
    APP_KEY: "LTAI5tCcXhR7yJNUscVLgDxc",
    APP_SECRET:
      "BWfCOeukSIn24U4VZTGy5sj2VgjXnWFJ7MvLpeEUr/y+pqCUfBtjE6bSZxbvpxDabGhVm/Gd/48K4jYL0csCszQOjUJBvUW8Y8y9SavzwgLXJ2Hyl6AZtQDdHQ1KkltgrL84ItiAEWndxj0okdUzySoEBxUG8/3Gf23MfndZJIUGoxDfTb/3Zcnbe/CXzdbm0kDSw7DFr305+c//tz3iVgCVUnyGflC6Na8+WrBKbrqbvqoS4JyaDDEhB29Ukp2p5kUXhe6/4jpI61TdTC0p6a6fxw2ObwAkC8IE7xvPepo=",
  },

  // 生产环境
  production: {
    APP_KEY: "LTAI5tCcXhR7yJNUscVLgDxc",
    APP_SECRET:
      "BWfCOeukSIn24U4VZTGy5sj2VgjXnWFJ7MvLpeEUr/y+pqCUfBtjE6bSZxbvpxDabGhVm/Gd/48K4jYL0csCszQOjUJBvUW8Y8y9SavzwgLXJ2Hyl6AZtQDdHQ1KkltgrL84ItiAEWndxj0okdUzySoEBxUG8/3Gf23MfndZJIUGoxDfTb/3Zcnbe/CXzdbm0kDSw7DFr305+c//tz3iVgCVUnyGflC6Na8+WrBKbrqbvqoS4JyaDDEhB29Ukp2p5kUXhe6/4jpI61TdTC0p6a6fxw2ObwAkC8IE7xvPepo=",
  },
};

// 获取当前环境配置
export const getCurrentConfig = () => {
  const isDev = __DEV__;
  return isDev ? ENV_CONFIG.development : ENV_CONFIG.production;
};
