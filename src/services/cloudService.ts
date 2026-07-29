import { CLOUD_ENV_ID } from "@/config/cloud";

interface WechatCloudApi {
  init(options: {
    env: string;
    traceUser?: boolean;
  }): void;
}

declare const wx: {
  cloud?: WechatCloudApi;
};

let initialized = false;

export function initCloudEnvironment(): boolean {
  // #ifdef MP-WEIXIN
  if (initialized) {
    return true;
  }

  if (typeof wx === "undefined" || !wx.cloud) {
    console.warn("WeChat CloudBase is unavailable in the current runtime.");
    return false;
  }

  wx.cloud.init({
    env: CLOUD_ENV_ID,
    traceUser: true
  });
  initialized = true;
  return true;
  // #endif

  // #ifndef MP-WEIXIN
  return false;
  // #endif
}