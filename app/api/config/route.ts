import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  hideUserApiUrl: serverConfig.hideUserApiUrl,
  hideUserCustomModel: serverConfig.hideUserCustomModel,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  defaultModel: serverConfig.defaultModel,
  visionModels: serverConfig.visionModels,
  hideMidjourneySetting: serverConfig.hideMidjourneySetting,
  useMjImgSelfProxy: serverConfig.useMjImgSelfProxy,
  hideSdSetting: serverConfig.hideSdSetting,
  fileUploadUrl: serverConfig.fileUploadUrl,
  fileUploadKey: serverConfig.fileUploadKey,
  appTitle: serverConfig.appTitle,
  appSubTitle: serverConfig.appSubTitle,
  appIcon: serverConfig.appIcon,
  inputPlaceholder: serverConfig.inputPlaceholder,
  hideVoiceInput: serverConfig.hideVoiceInput,
  replaceMjUrlWithBaseUrl: serverConfig.replaceMjUrlWithBaseUrl,
  hideGpts: serverConfig.hideGpts,
  hideUpdateLog: serverConfig.hideUpdateLog,
  alwaysDisplayModel: serverConfig.alwaysDisplayModel,
  skipMaskPick: serverConfig.skipMaskPick,
  sendImgUrl: serverConfig.sendImgUrl,
  defaultSummarizeModel: serverConfig.defaultSummarizeModel,
  useCustomConfig: serverConfig.useCustomConfig,
  chatGeminiThroughOpenai: serverConfig.chatGeminiThroughOpenai,
  chatClaudeThroughOpenai: serverConfig.chatClaudeThroughOpenai,
  enableInjectSystemPrompts: serverConfig.enableInjectSystemPrompts,
  zhiPuApiVersion: serverConfig.zhiPuApiVersion,
  chatAllThroughOpenai: serverConfig.chatAllThroughOpenai,
  defaultMaxScreen: serverConfig.defaultMaxScreen,
  hideDiscoveryButton: serverConfig.hideDiscoveryButton,
  enable_s: serverConfig.enable_s,
  public_domain: serverConfig.s3_public_domain,
  hideMaskButton: serverConfig.hideMaskButton,
  pluginProxyUrl: serverConfig.pluginProxyUrl,
  pluginButtonCustom: serverConfig.pluginButtonCustom,
  systemSettings: serverConfig.systemSettings,
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

async function handle(req: NextRequest) {
  // 如果上传链接有鉴权key，则需要设置 FILE_UPLOAD_KEY=1，才会在浏览器直接上传
  if (serverConfig.fileUploadKey && serverConfig.fileUploadFromBrowser != "1") {
    DANGER_CONFIG.fileUploadUrl = "";
    DANGER_CONFIG.fileUploadKey = "";
  }
  return NextResponse.json(DANGER_CONFIG);
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
