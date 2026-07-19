import { getClientConfig } from "../config/client";
import {
  ACCESS_CODE_PREFIX,
  ModelProvider,
  ServiceProvider,
} from "../constant";
import {
  ChatMessageTool,
  ChatMessage,
  ModelType,
  useAccessStore,
  useChatStore,
} from "../store";
import { ChatGPTApi, DalleRequestPayload } from "./platforms/openai";
import { GeminiProApi } from "./platforms/google";
import { ClaudeApi } from "./platforms/anthropic";
import { ErnieApi } from "./platforms/baidu";
import { DoubaoApi } from "./platforms/bytedance";
import { QwenApi } from "./platforms/alibaba";
import { HunyuanApi } from "./platforms/tencent";
import { MoonshotApi } from "./platforms/moonshot";
import { SparkApi } from "./platforms/iflytek";
import { DeepSeekApi } from "./platforms/deepseek";
import { XAIApi } from "./platforms/xai";
import { ChatGLMApi } from "./platforms/glm";
import { SiliconflowApi } from "./platforms/siliconflow";
import { Ai302Api } from "./platforms/ai302";

import { isVisionModel } from "@/app/utils";
export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export const Models = ["gpt-3.5-turbo", "gpt-4"] as const;
export const TTSModels = ["tts-1", "tts-1-hd"] as const;
export type ChatModel = ModelType;

export interface MultimodalContent {
  type: "text" | "image_url" | "file";
  text?: string;
  image_url?: {
    url: string;
  };
  file?: {
    name: string;
    type: string;
    url: string;
    content?: string;
  };
}

export interface MultimodalContentForAlibaba {
  text?: string;
  image?: string;
}

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

export interface LLMConfig {
  model: string;
  providerName?: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  size?: DalleRequestPayload["size"];
  quality?: DalleRequestPayload["quality"];
  style?: DalleRequestPayload["style"];
}

export interface SpeechOptions {
  model: string;
  input: string;
  voice: string;
  response_format?: string;
  speed?: number;
  onController?: (controller: AbortController) => void;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string, responseRes: Response) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
  onBeforeTool?: (tool: ChatMessageTool) => void;
  onAfterTool?: (tool: ChatMessageTool) => void;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  displayName?: string;
  available: boolean;
  provider: LLMModelProvider;
  sorted: number;
}

export interface LLMModelProvider {
  id: string;
  providerName: string;
  providerType: string;
  sorted: number;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract speech(options: SpeechOptions): Promise<ArrayBuffer>;
  abstract usage(): Promise<LLMUsage>;
  abstract models(): Promise<LLMModel[]>;
  abstract imagesGenerations(options: any): Promise<any>;
  abstract audioTranscriptions(formData: FormData): Promise<any>;
  abstract audioSpeech(options: any): Promise<any>;
}

type ProviderName = "openai" | "azure" | "claude" | "palm";

interface Model {
  name: string;
  provider: ProviderName;
  ctxlen: number;
}

interface ChatProvider {
  name: ProviderName;
  apiConfig: {
    baseUrl: string;
    apiKey: string;
    summaryModel: Model;
  };
  models: Model[];

  chat: () => void;
  usage: () => void;
}

export class ClientApi {
  public llm: LLMApi;

  constructor(provider: ModelProvider = ModelProvider.GPT) {
    switch (provider) {
      case ModelProvider.GeminiPro:
        this.llm = new GeminiProApi();
        break;
      case ModelProvider.Claude:
        this.llm = new ClaudeApi();
        break;
      case ModelProvider.Ernie:
        this.llm = new ErnieApi();
        break;
      case ModelProvider.Doubao:
        this.llm = new DoubaoApi();
        break;
      case ModelProvider.Qwen:
        this.llm = new QwenApi();
        break;
      case ModelProvider.Hunyuan:
        this.llm = new HunyuanApi();
        break;
      case ModelProvider.Moonshot:
        this.llm = new MoonshotApi();
        break;
      case ModelProvider.Iflytek:
        this.llm = new SparkApi();
        break;
      case ModelProvider.DeepSeek:
        this.llm = new DeepSeekApi();
        break;
      case ModelProvider.XAI:
        this.llm = new XAIApi();
        break;
      case ModelProvider.ChatGLM:
        this.llm = new ChatGLMApi();
        break;
      case ModelProvider.SiliconFlow:
        this.llm = new SiliconflowApi();
        break;
      case ModelProvider["302.AI"]:
        this.llm = new Ai302Api();
        break;
      default:
        this.llm = new ChatGPTApi();
    }
  }

  config() {}

  prompts() {}

  masks() {}

  async share(messages: ChatMessage[], avatarUrl: string | null = null) {
    const msgs = messages
      .map((m) => ({
        from: m.role === "user" ? "human" : "gpt",
        value: m.content,
      }))
      .concat([
        {
          from: "human",
          value:
            "Share from [ChatGPT Next Web Pro]: https://github.com/vual/ChatGPT-Next-Web-Pro",
        },
      ]);
    // 敬告二开开发者们，为了开源大模型的发展，请不要修改上述消息，此消息用于后续数据清洗使用
    // Please do not modify this message

    console.log("[Share]", messages, msgs);
    const clientConfig = getClientConfig();
    const proxyUrl = "/sharegpt";
    const rawUrl = "https://sharegpt.com/api/conversations";
    const shareUrl = clientConfig?.isApp ? rawUrl : proxyUrl;
    const res = await fetch(shareUrl, {
      body: JSON.stringify({
        avatarUrl,
        items: msgs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const resJson = await res.json();
    console.log("[Share]", resJson);
    if (resJson.id) {
      return `https://shareg.pt/${resJson.id}`;
    }
  }
}

export function getBearerToken(
  apiKey: string,
  noBearer: boolean = false,
): string {
  return validString(apiKey)
    ? `${noBearer ? "" : "Bearer "}${apiKey.trim()}`
    : "";
}

export function validString(x: string): boolean {
  return x?.length > 0;
}

export function getHeaders(props?: any, ignoreHeaders: boolean = false) {
  const accessStore = useAccessStore.getState();
  const chatStore = useChatStore.getState();
  let headers: Record<string, string> = {};
  if (!ignoreHeaders) {
    headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  const clientConfig = getClientConfig();

  const modelConfig = chatStore.currentSession().mask.modelConfig;
  function getConfig() {
    const isGoogle = modelConfig.providerName === ServiceProvider.Google;
    const isAzure = modelConfig.providerName === ServiceProvider.Azure;
    const isAnthropic = modelConfig.providerName === ServiceProvider.Anthropic;
    const isBaidu = modelConfig.providerName == ServiceProvider.Baidu;
    const isByteDance = modelConfig.providerName === ServiceProvider.ByteDance;
    const isAlibaba = modelConfig.providerName === ServiceProvider.Alibaba;
    const isMoonshot = modelConfig.providerName === ServiceProvider.Moonshot;
    const isIflytek = modelConfig.providerName === ServiceProvider.Iflytek;
    const isDeepSeek = modelConfig.providerName === ServiceProvider.DeepSeek;
    const isXAI = modelConfig.providerName === ServiceProvider.XAI;
    const isChatGLM = modelConfig.providerName === ServiceProvider.ChatGLM;
    const isSiliconFlow =
      modelConfig.providerName === ServiceProvider.SiliconFlow;
    const isAI302 = modelConfig.providerName === ServiceProvider["302.AI"];
    const isEnabledAccessControl = accessStore.enabledAccessControl();
    const apiKey = isGoogle
      ? accessStore.googleApiKey
      : isAzure
      ? accessStore.azureApiKey
      : isAnthropic
      ? accessStore.anthropicApiKey
      : isByteDance
      ? accessStore.bytedanceApiKey
      : isAlibaba
      ? accessStore.alibabaApiKey
      : isMoonshot
      ? accessStore.moonshotApiKey
      : isXAI
      ? accessStore.xaiApiKey
      : isDeepSeek
      ? accessStore.deepseekApiKey
      : isChatGLM
      ? accessStore.chatglmApiKey
      : isSiliconFlow
      ? accessStore.siliconflowApiKey
      : isIflytek
      ? accessStore.iflytekApiKey && accessStore.iflytekApiSecret
        ? accessStore.iflytekApiKey + ":" + accessStore.iflytekApiSecret
        : ""
      : isAI302
      ? accessStore.ai302ApiKey
      : accessStore.openaiApiKey;

    if (accessStore.chatAllThroughOpenai) {
      return {
        isGoogle: false,
        isAzure: false,
        isAnthropic: false,
        isBaidu: false,
        isByteDance: false,
        isAlibaba: false,
        isMoonshot: false,
        isIflytek: false,
        isDeepSeek: false,
        isXAI: false,
        isChatGLM: false,
        isSiliconFlow: false,
        isAI302: false,
        apiKey: accessStore.openaiApiKey,
        isEnabledAccessControl,
      };
    }

    return {
      isGoogle,
      isAzure,
      isAnthropic,
      isBaidu,
      isByteDance,
      isAlibaba,
      isMoonshot,
      isIflytek,
      isDeepSeek,
      isXAI,
      isChatGLM,
      isSiliconFlow,
      isAI302,
      apiKey,
      isEnabledAccessControl,
    };
  }

  function getAuthHeader(): string {
    return isAzure
      ? "api-key"
      : isAnthropic
        ? "x-api-key"
        : isGoogle
          ? "x-goog-api-key"
          : "Authorization";
  }

  const {
    isGoogle,
    isAzure,
    isAnthropic,
    isBaidu,
    isByteDance,
    isAlibaba,
    isMoonshot,
    isIflytek,
    isDeepSeek,
    isXAI,
    isChatGLM,
    isSiliconFlow,
    isAI302,
    apiKey,
    isEnabledAccessControl,
  } = getConfig();
  // when using baidu api in app, not set auth header
  if (isBaidu && clientConfig?.isApp) return headers;

  const authHeader = getAuthHeader();

  const bearerToken = getBearerToken(
    apiKey,
    isAzure || isAnthropic || isGoogle,
  );

  if (bearerToken && !accessStore.hideUserApiKey) {
    headers[authHeader] = bearerToken;
  } else if (isEnabledAccessControl && validString(accessStore.accessCode)) {
    headers["Authorization"] = getBearerToken(
      ACCESS_CODE_PREFIX + accessStore.accessCode,
    );
  }

  if (!props?.customUrl) {
    headers["model"] = encodeURI(modelConfig.model);

    if (
      !accessStore.hideMidjourneySetting &&
      validString(accessStore.midjourneyProxyUrl)
    ) {
      headers["midjourney-proxy-url"] = accessStore.midjourneyProxyUrl;
    } else if (
      accessStore.replaceMjUrlWithBaseUrl == "1" &&
      validString(accessStore.openaiUrl) &&
      accessStore.openaiUrl.startsWith("http")
    ) {
      headers["midjourney-proxy-url"] = accessStore.openaiUrl;
    }

    if (
      !accessStore.hideMidjourneySetting &&
      validString(accessStore.midjourneyProxySecret)
    ) {
      headers["midjourney-proxy-secret"] = accessStore.midjourneyProxySecret;
    } else if (
      accessStore.replaceMjUrlWithBaseUrl == "1" &&
      validString(apiKey)
    ) {
      headers["midjourney-proxy-secret"] = apiKey;
    }

    if (!accessStore.hideSdSetting && validString(accessStore.sdProxyUrl)) {
      headers["sd-proxy-url"] = accessStore.sdProxyUrl;
    }

    if (accessStore.lumaProxyUrl) {
      headers["luma-proxy-url"] = accessStore.lumaProxyUrl;
    }
    if (accessStore.lumaApiKey) {
      headers["luma-api-key"] = accessStore.lumaApiKey;
    }
  }

  return headers;
}

export function getClientApi(provider: ServiceProvider): ClientApi {
  const accessStore = useAccessStore.getState();
  if (accessStore.chatAllThroughOpenai) {
    return new ClientApi(ModelProvider.GPT);
  }
  switch (provider) {
    case ServiceProvider.Google:
      return new ClientApi(ModelProvider.GeminiPro);
    case ServiceProvider.Anthropic:
      return new ClientApi(ModelProvider.Claude);
    case ServiceProvider.Baidu:
      return new ClientApi(ModelProvider.Ernie);
    case ServiceProvider.ByteDance:
      return new ClientApi(ModelProvider.Doubao);
    case ServiceProvider.Alibaba:
      return new ClientApi(ModelProvider.Qwen);
    case ServiceProvider.Tencent:
      return new ClientApi(ModelProvider.Hunyuan);
    case ServiceProvider.Moonshot:
      return new ClientApi(ModelProvider.Moonshot);
    case ServiceProvider.Iflytek:
      return new ClientApi(ModelProvider.Iflytek);
    case ServiceProvider.DeepSeek:
      return new ClientApi(ModelProvider.DeepSeek);
    case ServiceProvider.XAI:
      return new ClientApi(ModelProvider.XAI);
    case ServiceProvider.ChatGLM:
      return new ClientApi(ModelProvider.ChatGLM);
    case ServiceProvider.SiliconFlow:
      return new ClientApi(ModelProvider.SiliconFlow);
    case ServiceProvider["302.AI"]:
      return new ClientApi(ModelProvider["302.AI"]);
    default:
      return new ClientApi(ModelProvider.GPT);
  }
}

export function getHeadersNoCT(props?: any) {
  const headers = getHeaders(props);
  const newHeaders: Record<string, string> = {};
  for (const key in headers) {
    if (key != "Content-Type") {
      newHeaders[key] = headers[key];
    }
  }

  return newHeaders;
}

export function getHeadersForUpload() {
  const accessStore = useAccessStore.getState();
  // 浏览器直接上传，headers需要拼上key
  if (accessStore.fileUploadKey) {
    const headers = getHeadersNoCT({ customUrl: true });
    headers["Authorization"] = "Bearer " + accessStore.fileUploadKey;
    return headers;
  } else {
    return getHeadersNoCT();
  }
}

export function getUploadUrl(fileType: string) {
  const accessStore = useAccessStore.getState();
  return accessStore.fileUploadUrl
    ? accessStore.fileUploadUrl
    : "/api/upload-oss?fileType=" + fileType;
}

export function useGetMidjourneySelfProxyUrl(url: string) {
  const accessStore = useAccessStore.getState();
  if (
    accessStore.useMjImgSelfProxy &&
    url.indexOf("https://cdn.discordapp.com") > 0
  ) {
    url = url.replace("https://cdn.discordapp.com", "/api/cnd-discordapp");
    if (accessStore.accessCode) {
      url +=
        (url.includes("?") ? "&" : "?") +
        "Authorization=" +
        accessStore.accessCode;
    }
  }
  return url;
}

export function buildMessages(messages: RequestMessage[], model: string) {
  const sendMessages = [] as RequestMessage[];
  messages.forEach((msg: RequestMessage) => {
    if (msg.content instanceof Array) {
      // 判断消息里是否有file
      const hasFile = msg.content.some(
        (m: MultimodalContent) => m.type == "file",
      );
      // 没有file，且模型是vision或claude，则直接传过去。
      if (!hasFile && isVisionModel(model)) {
        sendMessages.push(msg);
      } else {
        let text = "";
        let fileUrls = "";
        let base64 = "";
        msg.content.forEach((item: any) => {
          if (item.type == "text") {
            text += item.text;
          } else if (
            item.type == "image_url" &&
            item.image_url &&
            item.image_url.url
          ) {
            if (item.image_url.url.startsWith("http")) {
              fileUrls += item.image_url.url + "\n";
            } else {
              base64 += item.image_url.url + "\n";
            }
          } else if (item.type == "file") {
            if (item.file.content) {
              fileUrls +=
                "#" + item.file.name + "\n" + item.file.content + "\n";
            } else {
              fileUrls += item.file.url + "\n";
            }
          }
        });
        sendMessages.push({
          ...msg,
          content: text + (fileUrls || base64 ? "\n" + fileUrls + base64 : ""),
        });
      }
    } else if (typeof msg.content == "string") {
      sendMessages.push(msg);
    } else {
      sendMessages.push({ ...msg, content: JSON.stringify(msg.content) });
    }
  });

  return sendMessages;
}
