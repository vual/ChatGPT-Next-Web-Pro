import {
  compressBase64Image,
  getBase64,
  getBase64FromUrl,
  getFileMarkdown,
  getMessageTextContent,
  isDalle3,
  isVisionModel,
  safeLocalStorage,
  trimTopic,
} from "../utils";

import { indexedDBStorage } from "@/app/utils/indexedDB-storage";
import { nanoid } from "nanoid";
import {
  ClientApi,
  getClientApi,
  getHeaders,
  MultimodalContent,
  RequestMessage,
  useGetMidjourneySelfProxyUrl,
} from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { showToast } from "../components/ui-lib";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_MODELS,
  DEFAULT_SYSTEM_TEMPLATE,
  GEMINI_SUMMARIZE_MODEL,
  DEEPSEEK_SUMMARIZE_MODEL,
  KnowledgeCutOffDate,
  MCP_SYSTEM_TEMPLATE,
  MCP_TOOLS_TEMPLATE,
  ServiceProvider,
  StoreKey,
  SUMMARIZE_MODEL,
} from "../constant";
import Locale, { getLang } from "../locales";
import { prettyObject } from "../utils/format";
import { createPersistStore } from "../utils/store";
import { estimateTokenLength } from "../utils/token";
import { ModelConfig, ModelType, useAppConfig } from "./config";
import { useAccessStore } from "./access";
import { collectModelsWithDefaultModel } from "../utils/model";
import { createEmptyMask, Mask } from "./mask";
import { executeMcpAction, getAllTools, isMcpEnabled } from "../mcp/actions";
import { extractMcpJson, isMcpJson } from "../mcp/utils";
import { RcFile, UploadFile } from "antd/es/upload/interface";
import { DrawConfig } from "@/app/store/draw-config";
import { DrawItem, useDrawListStore } from "@/app/store/draw-list";
import { uploadFileToFileServer, uploadImageToOss } from "@/app/utils/upload";
import {
  base64ToFile,
  getFileFromUrl,
  getImageFileFromUrl,
} from "@/app/utils/fileUtil";

const localStorage = safeLocalStorage();

export type ChatMessageTool = {
  id: string;
  index?: number;
  type?: string;
  function?: {
    name: string;
    arguments?: string;
  };
  content?: string;
  isError?: boolean;
  errorMsg?: string;
};

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  model?: ModelType;
  tools?: ChatMessageTool[];
  audio_url?: string;
  isMcpResponse?: boolean;
  displayName?: string;
  avatar?: string;
  baseUrl?: string;
  apiKey?: string;
  stat?: ChatStat;
  attr?: any; // ChatMessageAttr
};

export interface ChatMessageAttr {
  action?: string;
  taskId?: string;
  status?: string;
  finished?: boolean;
  parameters?: string;
  info?: string;
  html_info?: string;
  buttons?: any;
  promptEn?: string;
}

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    attr: {} as ChatMessageAttr,
    ...override,
  };
}

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatSession {
  id: string;
  topic: string;

  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;

  mask: Mask;
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: Locale.Store.BotHello,
});

function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,

    mask: createEmptyMask(),
  };
}

function getSummarizeModel(
  currentModel: string,
  providerName: string,
): string[] {
  const accessStore = useAccessStore.getState();
  if (accessStore.defaultSummarizeModel) {
    return accessStore.defaultSummarizeModel.split("@");
  }
  // if it is using gpt-* models, force to use 4o-mini to summarize
  if (currentModel.startsWith("gpt") || currentModel.startsWith("chatgpt")) {
    const configStore = useAppConfig.getState();

    const allModel = collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    );
    const summarizeModel = allModel.find(
      (m) => m.name === SUMMARIZE_MODEL && m.available,
    );
    if (summarizeModel) {
      return [
        summarizeModel.name,
        summarizeModel.provider?.providerName as string,
      ];
    }
  }
  if (currentModel.startsWith("gemini")) {
    return [GEMINI_SUMMARIZE_MODEL, ServiceProvider.Google];
  } else if (currentModel.startsWith("deepseek-")) {
    return [DEEPSEEK_SUMMARIZE_MODEL, ServiceProvider.DeepSeek];
  }

  return [currentModel, providerName];
}

const ChatFetchTaskPool: Record<string, any> = {};
const DrawUploadTaskArr: string[] = [];

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce(
    (pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)),
    0,
  );
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const cutoff =
    KnowledgeCutOffDate[modelConfig.model] ?? KnowledgeCutOffDate.default;
  // Find the model in the DEFAULT_MODELS array that matches the modelConfig.model
  const modelInfo = DEFAULT_MODELS.find((m) => m.name === modelConfig.model);

  var serviceProvider = "OpenAI";
  if (modelInfo) {
    // TODO: auto detect the providerName from the modelConfig.model

    // Directly use the providerName from the modelInfo
    serviceProvider = modelInfo.provider.providerName;
  }

  const vars = {
    ServiceProvider: serviceProvider,
    cutoff,
    model: modelConfig.model,
    time: new Date().toString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // remove duplicate
  if (input.startsWith(output)) {
    output = "";
  }

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    const regex = new RegExp(`{{${name}}}`, "g");
    output = output.replace(regex, value.toString()); // Ensure value is a string
  });

  return output;
}

async function getMcpSystemPrompt(): Promise<string> {
  const tools = await getAllTools();

  let toolsStr = "";

  tools.forEach((i) => {
    // error client has no tools
    if (!i.tools) return;

    toolsStr += MCP_TOOLS_TEMPLATE.replace(
      "{{ clientId }}",
      i.clientId,
    ).replace(
      "{{ tools }}",
      i.tools.tools.map((p: object) => JSON.stringify(p, null, 2)).join("\n"),
    );
  });

  return MCP_SYSTEM_TEMPLATE.replace("{{ MCP_TOOLS }}", toolsStr);
}

async function getFileArr(uploadFiles: UploadFile[]) {
  if (!uploadFiles || uploadFiles.length < 1) {
    return [];
  }
  const accessStore = useAccessStore.getState();
  const fileArr = [] as any[];
  for (const file of uploadFiles) {
    let url = "";
    if (file.response && file.response.fileUrl) {
      url = file.response.fileUrl;
    } else if (file.response && file.response.data && file.response.data.url) {
      url = file.response.data.url;
    } else {
      const dataStr = JSON.stringify(file.response);
      if (dataStr.includes("http")) {
        url = dataStr.substring(dataStr.indexOf("http"));
        url = url.substring(0, url.indexOf('"'));
      }
    }
    let imgBase64 = "";
    if (file.type?.includes("image") && !accessStore.sendImgUrl) {
      imgBase64 = await getBase64(file.originFileObj as RcFile);
    }
    const fileParam = {
      name: file.name,
      type: file.type,
      url: url,
      base64: imgBase64,
      fileObj: file.originFileObj,
    };
    fileArr.push(fileParam);
  }
  return fileArr;
}

async function getUserContent(
  userInput: string,
  fileArr: any,
  modelConfig: ModelConfig,
) {
  const content = fillTemplateWith(userInput, modelConfig);
  const model = modelConfig.model as string;
  const accessStore = useAccessStore.getState();

  if (fileArr.length > 0) {
    const sendUserContent = [] as MultimodalContent[]; // 发送出去的用户内容
    const saveUserContent = [] as MultimodalContent[]; // 保存的用户内容
    let msg: MultimodalContent = { type: "text", text: content };
    sendUserContent.push(msg);
    saveUserContent.push(msg);
    for (const file of fileArr) {
      // 如果是gpt4-vision，或者claude模型，claude模型目前是根据中转接口来定的报文格式，以后要改成官方报文格式
      if (file.type.includes("image") && isVisionModel(model)) {
        if (file.url && file.url.startsWith("http")) {
          msg = { type: "image_url", image_url: { url: file.url } };
          // 保存的消息是保存文件链接
          saveUserContent.push(msg);
          // 发送则需要判断是否发送链接
          if (accessStore.sendImgUrl) {
            sendUserContent.push(msg);
          } else if (file.base64) {
            sendUserContent.push({
              type: "image_url",
              image_url: { url: file.base64 },
            });
          }
        } else if (file.base64) {
          // 发送出去是原图，提高识别率。
          sendUserContent.push({
            type: "image_url",
            image_url: { url: file.base64 },
          });
          // 如果是base64，则需要压缩到100k以内保存。
          saveUserContent.push({
            type: "image_url",
            image_url: { url: await compressBase64Image(file.base64) },
          });
        }
      } else {
        sendUserContent.push({
          type: "file",
          file: {
            name: file.name,
            type: file.type,
            url: file.url,
            // content: await getFileMarkdown(file.fileObj, null, null)
          },
        });
        saveUserContent.push({
          type: "file",
          file: {
            name: file.name,
            type: file.type,
            url: file.url,
          },
        });
      }
    }
    return { sendUserContent, saveUserContent };
  }

  return { sendUserContent: content, saveUserContent: content };
}

async function getResendUserContent(
  content: string | MultimodalContent[],
  modelConfig: ModelConfig,
) {
  const accessStore = useAccessStore.getState();
  const model = modelConfig.model as string;

  if (isVisionModel(model) && content instanceof Array) {
    const sendUserContent = [] as MultimodalContent[]; // 发送出去的用户内容
    const saveUserContent = [] as MultimodalContent[]; // 保存的用户内容
    for (const msg of content) {
      if (msg.type == "text") {
        sendUserContent.push(msg);
        saveUserContent.push(msg);
      } else if (msg.type == "image_url") {
        // 保存不变
        saveUserContent.push(msg);
        // 发出去的要判断是否url, 如果是url，但是不让发送url，则需要获取base64
        if (msg.image_url?.url.startsWith("http") && !accessStore.sendImgUrl) {
          const imageData = await getBase64FromUrl(msg.image_url.url);
          sendUserContent.push({
            type: "image_url",
            image_url: { url: imageData.base64 },
          });
        } else {
          sendUserContent.push(msg);
        }
      }
    }

    return { sendUserContent, saveUserContent };
  }

  return { sendUserContent: content, saveUserContent: content };
}

function getMjParams(config: DrawConfig) {
  let params = " ";
  if (config.mj.engine == "Niji") {
    params += "--niji ";
  }
  if (config.mj.engineVersion != "default") {
    params += "--v " + config.mj.engineVersion + " ";
  }
  params += "--ar " + config.mj.size + " ";
  params += "--q " + config.mj.quality + " ";
  if (
    config.mj.quality == "2" &&
    config.mj.engine != "Niji" &&
    parseFloat(config.mj.engineVersion) < 6
  ) {
    params += "--hd ";
  }
  if (config.mj.chaos > 0) {
    params += "--c " + config.mj.chaos + " ";
  }
  if (config.mj.stylize != 100) {
    params += "--s " + config.mj.stylize + " ";
  }
  if (config.mj.tile) {
    params += "--tile ";
  }
  if (config.mj.seed != -1) {
    params += "--seed " + config.mj.seed + " ";
  }
  return params;
}

const DEFAULT_CHAT_STATE = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
  lastInput: "",
};

export const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      forkSession() {
        // 获取当前会话
        const currentSession = get().currentSession();
        if (!currentSession) return;

        const newSession = createEmptySession();

        newSession.topic = currentSession.topic;
        // 深拷贝消息
        newSession.messages = currentSession.messages.map((msg) => ({
          ...msg,
          id: nanoid(), // 生成新的消息 ID
        }));
        newSession.mask = {
          ...currentSession.mask,
          modelConfig: {
            ...currentSession.mask.modelConfig,
          },
        };

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [newSession, ...state.sessions],
        }));
      },

      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      newSession(mask?: Mask) {
        const session = createEmptySession();

        if (mask) {
          const config = useAppConfig.getState();
          const globalModelConfig = config.modelConfig;

          session.mask = {
            ...mask,
            modelConfig: {
              ...globalModelConfig,
              ...mask.modelConfig,
            },
          };
          session.topic = mask.name;
        }

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      deleteSession(index: number) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));

        showToast(
          Locale.Home.DeleteToast,
          {
            text: Locale.Home.Revert,
            onClick() {
              set(() => restoreState);
            },
          },
          5000,
        );
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      onNewMessage(message: ChatMessage, targetSession: ChatSession) {
        get().updateTargetSession(targetSession, (session) => {
          session.messages = session.messages.concat();
          session.lastUpdate = Date.now();
        });

        get().updateStat(message, targetSession);

        get().checkMcpJson(message);

        get().summarizeSession(false, targetSession);
      },

      async onUserInput(content: any, extAttr?: any, isMcpResponse?: boolean) {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;
        const drawConfig = extAttr.drawConfig;
        const accessStore = useAccessStore.getState();

        if (
          modelConfig.model == "midjourney" &&
          drawConfig.mj.mode != "IMAGINE" &&
          !content
        ) {
          content = `${drawConfig.mj.mode}`;
          extAttr.uploadImages.forEach((img: UploadFile, index: number) => {
            content += `::[${index + 1}]${img.name}`;
          });
        }

        if (
          modelConfig.model == "stable-diffusion" &&
          (drawConfig.sd.api_mode == "extras" ||
            drawConfig.sd.api_mode == "pngInfo")
        ) {
          if (content.trim() != "") {
            content += "\n";
          }
          extAttr.uploadImages.forEach((file: UploadFile) => {
            content += file.name + "\n";
          });
        }

        const tempMsg: ChatMessage = createMessage({
          role: "user",
          content: Locale.Chat.Processing,
        });
        get().updateTargetSession(session, (session) => {
          session.messages = session.messages.concat([tempMsg]);
        });

        const fileArr = await getFileArr(extAttr.uploadFiles);
        extAttr?.setUploadFiles([]); // 删除文件
        // 组装用户发送和保存的内容，如果是base64内容，则压缩后保存, 压缩到100k内。
        const { sendUserContent, saveUserContent } = extAttr?.resend
          ? await getResendUserContent(content, modelConfig)
          : await getUserContent(content, fileArr, modelConfig);
        console.log("[User Input] after pretreatment: ", sendUserContent);
        console.log("[User Input] after pretreatment: ", saveUserContent);

        const userMessage: ChatMessage = createMessage({
          role: "user",
          content: sendUserContent,
          isMcpResponse,
          model: modelConfig.model,
          stat: {
            tokenCount: extAttr?.tokenCount ?? 0,
            charCount: extAttr?.charCount ?? 0,
          } as ChatStat,
        });
        const { baseUrl, apiKey } = accessStore.getCustomUrlAndKey(
          modelConfig.model,
        );
        if (baseUrl) {
          userMessage.baseUrl = baseUrl;
        }
        if (apiKey) {
          userMessage.apiKey = apiKey;
        }

        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
          displayName: modelConfig.displayName,
          avatar: modelConfig.avatar,
        });

        // get recent messages
        const recentMessages = await get().getMessagesWithMemory();
        const sendMessages = recentMessages
          .concat(userMessage)
          .filter((m) => m.content !== Locale.Chat.Processing);
        const messageIndex = session.messages.length + 1;
        // 处理消息里的文件
        for (const msg of sendMessages) {
          if (msg.content instanceof Array) {
            for (const item of msg.content) {
              if (item.type == "file" && item.file?.url && !item.file.content) {
                item.file.content = await getFileMarkdown(
                  null as any,
                  item.file.url,
                  item.file.name,
                );
              }
            }
          }
        }

        if (modelConfig.model == "midjourney") {
          userMessage.attr.action = drawConfig.mj.mode;
        } else if (modelConfig.model == "stable-diffusion") {
          userMessage.attr.action = drawConfig.sd.api_mode;
        }

        // save user's and bot's message
        get().updateTargetSession(session, (session) => {
          // 临时消息，需要先删除
          const tempMsgIndex = session.messages.findIndex(
            (m) => m.content === Locale.Chat.Processing,
          );
          if (tempMsgIndex >= 0) {
            session.messages.splice(tempMsgIndex, 1);
          }
          const savedUserMessage = {
            ...userMessage,
            content: saveUserContent,
          };
          session.messages = session.messages.concat([
            savedUserMessage,
            botMessage,
          ]);
        });

        // midjourney 请求
        if (modelConfig.model == "midjourney") {
          return this.fetchMidjourney(content, botMessage, extAttr);
        }
        // stable-diffusion 请求
        else if (modelConfig.model == "stable-diffusion") {
          return this.fetchStableDiffusion(content, botMessage, extAttr);
        } else if (modelConfig.model.startsWith("luma")) {
          return this.fetchLuma(content, botMessage, extAttr);
        }
        // imagesGenerations
        else if (
          modelConfig.model.includes("dall-e") ||
          modelConfig.model.includes("gpt-image")
        ) {
          return this.imagesGenerations(content, botMessage, extAttr);
        }
        // whisper, audioTranscriptions
        else if (modelConfig.model.includes("whisper")) {
          return this.audioTranscriptions(
            sendUserContent,
            botMessage,
            extAttr,
            fileArr,
          );
        }
        // speech
        else if (modelConfig.model.includes("tts")) {
          return this.audioSpeech(content, botMessage, extAttr);
        }
        const api: ClientApi = getClientApi(modelConfig.providerName);
        // make request
        // openai 请求
        api.llm.chat({
          messages: sendMessages,
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            get().updateTargetSession(session, (session) => {
              session.messages = session.messages.concat();
            });
          },
          async onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;
              botMessage.date = new Date().toLocaleString();
              get().onNewMessage(botMessage, session);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
          },
          onBeforeTool(tool: ChatMessageTool) {
            (botMessage.tools = botMessage?.tools || []).push(tool);
            get().updateTargetSession(session, (session) => {
              session.messages = session.messages.concat();
            });
          },
          onAfterTool(tool: ChatMessageTool) {
            botMessage?.tools?.forEach((t, i, tools) => {
              if (tool.id == t.id) {
                tools[i] = { ...tool };
              }
            });
            get().updateTargetSession(session, (session) => {
              session.messages = session.messages.concat();
            });
          },
          onError(error) {
            const isAborted = error.message?.includes?.("aborted");
            botMessage.content +=
              "\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateTargetSession(session, (session) => {
              session.messages = session.messages.concat();
            });
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
        });
      },

      getMemoryPrompt() {
        const session = get().currentSession();

        if (session.memoryPrompt.length) {
          return {
            role: "system",
            content: Locale.Store.Prompt.History(session.memoryPrompt),
            date: "",
          } as ChatMessage;
        }
      },

      async getMessagesWithMemory() {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;
        const clearContextIndex = session.clearContextIndex ?? 0;
        const messages = session.messages.slice();
        const totalMessageCount = session.messages.length;

        // in-context prompts
        const contextPrompts = session.mask.context.slice();

        // system prompts, to get close to OpenAI Web ChatGPT
        const shouldInjectSystemPrompts =
          modelConfig.enableInjectSystemPrompts &&
          (session.mask.modelConfig.model.startsWith("gpt-") ||
            session.mask.modelConfig.model.startsWith("chatgpt-"));

        const mcpEnabled = await isMcpEnabled();
        const mcpSystemPrompt = mcpEnabled ? await getMcpSystemPrompt() : "";

        var systemPrompts: ChatMessage[] = [];

        if (shouldInjectSystemPrompts) {
          systemPrompts = [
            createMessage({
              role: "system",
              content:
                fillTemplateWith("", {
                  ...modelConfig,
                  template: DEFAULT_SYSTEM_TEMPLATE,
                }) + mcpSystemPrompt,
            }),
          ];
        } else if (mcpEnabled) {
          systemPrompts = [
            createMessage({
              role: "system",
              content: mcpSystemPrompt,
            }),
          ];
        }

        if (shouldInjectSystemPrompts || mcpEnabled) {
          console.log(
            "[Global System Prompt] ",
            systemPrompts.at(0)?.content ?? "empty",
          );
        }
        const memoryPrompt = get().getMemoryPrompt();
        // long term memory
        const shouldSendLongTermMemory =
          modelConfig.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 &&
          session.lastSummarizeIndex > clearContextIndex;
        const longTermMemoryPrompts =
          shouldSendLongTermMemory && memoryPrompt ? [memoryPrompt] : [];
        const longTermMemoryStartIndex = session.lastSummarizeIndex;

        // short term memory
        const shortTermMemoryStartIndex = Math.max(
          0,
          totalMessageCount - modelConfig.historyMessageCount,
        );

        // lets concat send messages, including 4 parts:
        // 0. system prompt: to get close to OpenAI Web ChatGPT
        // 1. long term memory: summarized memory messages
        // 2. pre-defined in-context prompts
        // 3. short term memory: latest n messages
        // 4. newest input message
        const memoryStartIndex = shouldSendLongTermMemory
          ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
          : shortTermMemoryStartIndex;
        // and if user has cleared history messages, we should exclude the memory too.
        const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
        const maxTokenThreshold = modelConfig.max_tokens;

        // get recent messages as much as possible
        const reversedRecentMessages = [];
        for (
          let i = totalMessageCount - 1, tokenCount = 0;
          i >= contextStartIndex && tokenCount < maxTokenThreshold;
          i -= 1
        ) {
          const msg = messages[i];
          if (!msg || msg.isError) continue;
          tokenCount += estimateTokenLength(getMessageTextContent(msg));
          reversedRecentMessages.push(msg);
        }
        // concat all messages
        const recentMessages = [
          ...systemPrompts,
          ...longTermMemoryPrompts,
          ...contextPrompts,
          ...reversedRecentMessages.reverse(),
        ];

        return recentMessages;
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession(session: ChatSession) {
        get().updateTargetSession(session, (session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },

      summarizeSession(
        refreshTitle: boolean = false,
        targetSession: ChatSession,
      ) {
        const config = useAppConfig.getState();
        const session = targetSession;
        const modelConfig = session.mask.modelConfig;
        const accessStore = useAccessStore.getState();
        // skip summarize when using dalle3?
        if (isDalle3(modelConfig.model)) {
          return;
        }

        // if not config compressModel, then using getSummarizeModel
        const [model, providerName] = modelConfig.compressModel
          ? [modelConfig.compressModel, modelConfig.compressProviderName]
          : getSummarizeModel(
              session.mask.modelConfig.model,
              session.mask.modelConfig.providerName,
            );
        const api: ClientApi = getClientApi(providerName as ServiceProvider);

        // remove error messages if any
        const messages = session.messages;

        // should summarize topic after chating more than 50 words
        const SUMMARIZE_MIN_LEN = 50;
        if (
          (config.enableAutoGenerateTitle &&
            session.topic === DEFAULT_TOPIC &&
            countMessages(messages) >= SUMMARIZE_MIN_LEN) ||
          refreshTitle
        ) {
          const startIndex = Math.max(
            0,
            messages.length - modelConfig.historyMessageCount,
          );
          const topicMessages = messages
            .slice(
              startIndex < messages.length ? startIndex : messages.length - 1,
              messages.length,
            )
            .concat(
              createMessage({
                role: "user",
                content: Locale.Store.Prompt.Topic,
              }),
            );
          api.llm.chat({
            messages: topicMessages,
            config: {
              model,
              stream: false,
              providerName,
            },
            onFinish(message, responseRes) {
              if (responseRes?.status === 200) {
                get().updateTargetSession(
                  session,
                  (session) =>
                    (session.topic =
                      message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
                );
              }
            },
          });
        }
        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMsgs = messages
          .filter((msg) => !msg.isError)
          .slice(summarizeIndex);

        const historyMsgLength = countMessages(toBeSummarizedMsgs);

        if (historyMsgLength > (modelConfig?.max_tokens || 4000)) {
          const n = toBeSummarizedMsgs.length;
          toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
            Math.max(0, n - modelConfig.historyMessageCount),
          );
        }
        const memoryPrompt = get().getMemoryPrompt();
        if (memoryPrompt) {
          // add memory prompt
          toBeSummarizedMsgs.unshift(memoryPrompt);
        }

        const lastSummarizeIndex = session.messages.length;

        console.log(
          "[Chat History] ",
          toBeSummarizedMsgs,
          historyMsgLength,
          modelConfig.compressMessageLengthThreshold,
        );

        if (
          historyMsgLength > modelConfig.compressMessageLengthThreshold &&
          modelConfig.sendMemory
        ) {
          /** Destruct max_tokens while summarizing
           * this param is just shit
           **/
          const { max_tokens, ...modelcfg } = modelConfig;
          api.llm.chat({
            messages: toBeSummarizedMsgs.concat(
              createMessage({
                role: "system",
                content: Locale.Store.Prompt.Summarize,
                date: "",
              }),
            ),
            config: {
              ...modelcfg,
              stream: true,
              model,
              providerName,
            },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message, responseRes) {
              if (responseRes?.status === 200) {
                console.log("[Memory] ", message);
                get().updateTargetSession(session, (session) => {
                  session.lastSummarizeIndex = lastSummarizeIndex;
                  session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
                });
              }
            },
            onError(err) {
              console.error("[Summarize] ", err);
            },
          });
        }
      },

      updateStat(message: ChatMessage, session: ChatSession) {
        get().updateTargetSession(session, (session) => {
          session.stat.charCount += JSON.stringify(message.content).length;
          // TODO: should update chat count and word count
        });
      },
      updateTargetSession(
        targetSession: ChatSession,
        updater: (session: ChatSession) => void,
      ) {
        const sessions = get().sessions;
        const index = sessions.findIndex((s) => s.id === targetSession.id);
        if (index < 0) return;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },
      async clearAllData() {
        await indexedDBStorage.clear();
        localStorage.clear();
        location.reload();
      },
      setLastInput(lastInput: string) {
        set({
          lastInput,
        });
      },

      /** check if the message contains MCP JSON and execute the MCP action */
      checkMcpJson(message: ChatMessage) {
        const mcpEnabled = isMcpEnabled();
        if (!mcpEnabled) return;
        const content = getMessageTextContent(message);
        if (isMcpJson(content)) {
          try {
            const mcpRequest = extractMcpJson(content);
            if (mcpRequest) {
              console.debug("[MCP Request]", mcpRequest);

              executeMcpAction(mcpRequest.clientId, mcpRequest.mcp)
                .then((result) => {
                  console.log("[MCP Response]", result);
                  const mcpResponse =
                    typeof result === "object"
                      ? JSON.stringify(result)
                      : String(result);
                  get().onUserInput(
                    `\`\`\`json:mcp-response:${mcpRequest.clientId}\n${mcpResponse}\n\`\`\``,
                    [],
                    true,
                  );
                })
                .catch((error) => showToast("MCP execution failed", error));
            }
          } catch (error) {
            console.error("[Check MCP JSON]", error);
          }
        }
      },

      async fetchMidjourney(
        content: string,
        botMessage: ChatMessage,
        extAttr?: any,
      ) {
        const session = get().currentSession();
        const messageIndex = session.messages.length + 1;
        const drawConfig = extAttr.drawConfig;
        const botType =
          drawConfig.mj.engine == "Niji" ? "NIJI_JOURNEY" : "MID_JOURNEY";
        const base64Array: string[] = [];
        if (extAttr.uploadImages.length > 0) {
          for (const imgFile of extAttr.uploadImages) {
            const imgBase64 = await getBase64(imgFile.originFileObj as RcFile);
            base64Array.push(imgBase64 as string);
          }
          extAttr.setUploadImages([]);
        }
        botMessage.model = "midjourney";
        extAttr.sessionId = session.id;

        const startFn = async () => {
          const prompt = content.trim();
          const params = getMjParams(drawConfig);
          let action: string = "IMAGINE";
          const firstSplitIndex = prompt.indexOf("::");
          if (firstSplitIndex > 0) {
            if (prompt.includes("##")) {
              action = "ACTION";
            } else {
              action = prompt.substring(0, firstSplitIndex);
            }
          }
          console.log(action);
          if (
            ![
              "UPSCALE",
              "VARIATION",
              "IMAGINE",
              "DESCRIBE",
              "BLEND",
              "REROLL",
              "ACTION",
              "INSIGHTFACE",
            ].includes(action)
          ) {
            botMessage.content = Locale.Midjourney.TaskErrUnknownType;
            botMessage.streaming = false;
            return;
          }
          botMessage.attr.action = action;
          let actionIndex: any = null;
          let actionUseTaskId: any = null;
          if (
            action === "VARIATION" ||
            action == "UPSCALE" ||
            action == "REROLL"
          ) {
            actionIndex = parseInt(
              prompt.substring(firstSplitIndex + 2, firstSplitIndex + 3),
            );
            actionUseTaskId = prompt.substring(firstSplitIndex + 5);
          }
          try {
            let res = null;
            const reqFn = (path: string, method: string, body?: any) => {
              return fetch("/api/midjourney/" + path, {
                method: method,
                headers: getHeaders(),
                body: body,
              });
            };
            switch (action) {
              case "IMAGINE": {
                res = await reqFn(
                  "submit/imagine",
                  "POST",
                  JSON.stringify({
                    prompt: prompt + params,
                    base64: base64Array[0] ?? null,
                    botType,
                  }),
                );
                break;
              }
              case "DESCRIBE": {
                res = await reqFn(
                  "submit/describe",
                  "POST",
                  JSON.stringify({
                    base64: base64Array[0],
                    botType,
                  }),
                );
                break;
              }
              case "BLEND": {
                res = await reqFn(
                  "submit/blend",
                  "POST",
                  JSON.stringify({ base64Array, botType }),
                );
                break;
              }
              case "UPSCALE":
              case "VARIATION":
              case "REROLL": {
                res = await reqFn(
                  "submit/change",
                  "POST",
                  JSON.stringify({
                    action: action,
                    index: actionIndex,
                    taskId: actionUseTaskId,
                  }),
                );
                break;
              }
              case "ACTION": {
                const split = prompt.split("##");
                res = await reqFn(
                  "submit/action",
                  "post",
                  JSON.stringify({
                    customId: split[0],
                    taskId: split[1],
                  }),
                );
                if (
                  res.ok &&
                  (split[0].includes("CustomZoom") ||
                    split[0].includes("Inpaint"))
                ) {
                  const resJson = await res.json();
                  res = await reqFn(
                    "submit/modal",
                    "post",
                    JSON.stringify({
                      taskId: resJson.result,
                      prompt: extAttr.prompt,
                      maskBase64: extAttr.maskBase64,
                    }),
                  );
                }
                break;
              }
              case "INSIGHTFACE": {
                res = await reqFn(
                  "insight-face/swap",
                  "POST",
                  JSON.stringify({
                    sourceBase64: base64Array[0],
                    targetBase64: base64Array[1],
                  }),
                );
                break;
              }
              default:
            }
            if (res == null) {
              botMessage.content =
                Locale.Midjourney.TaskErrNotSupportType(action);
              botMessage.streaming = false;
              return;
            }
            if (!res.ok) {
              const text = await res.text();
              throw new Error(
                `\n${Locale.Midjourney.StatusCode(
                  res.status,
                )}\n${Locale.Midjourney.RespBody(
                  text || Locale.Midjourney.None,
                )}`,
              );
            }
            const resJson = await res.json();
            if (
              res.status < 200 ||
              res.status >= 300 ||
              (resJson.code != 1 && resJson.code != 22)
            ) {
              botMessage.content = Locale.Midjourney.TaskSubmitErr(
                resJson?.msg ||
                  resJson?.error ||
                  resJson?.description ||
                  Locale.Midjourney.UnknownError,
              );
            } else {
              const taskId: string = resJson.result;
              const prefixContent = Locale.Midjourney.TaskPrefix(
                prompt,
                taskId,
              );
              botMessage.content =
                prefixContent +
                  `[${new Date().toLocaleString()}] - ${
                    Locale.Midjourney.TaskSubmitOk
                  }: ` +
                  resJson?.description || Locale.Midjourney.PleaseWait;
              botMessage.attr.taskId = taskId;
              botMessage.attr.status = resJson.status;
              extAttr.prompt = prompt;
              this.fetchMidjourneyStatus(botMessage, extAttr);
            }
          } catch (e: any) {
            console.error(e);
            botMessage.content = Locale.Midjourney.TaskSubmitErr(
              e?.error || e?.message || Locale.Midjourney.UnknownError,
            );
          } finally {
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );
            botMessage.streaming = false;
          }
        };
        await startFn();
        get().onNewMessage(botMessage, session);
        extAttr?.setAutoScroll(true);
      },

      fetchMidjourneyStatus(botMessage: ChatMessage, extAttr?: any) {
        const taskId = botMessage?.attr?.taskId;
        if (
          !taskId ||
          ["SUCCESS", "FAILURE"].includes(botMessage?.attr?.status) ||
          ChatFetchTaskPool[taskId]
        ) {
          return;
        }
        ChatFetchTaskPool[taskId] = setTimeout(async () => {
          ChatFetchTaskPool[taskId] = null;
          const statusRes = await fetch(
            `/api/midjourney/task/${taskId}/fetch`,
            {
              method: "GET",
              headers: getHeaders(),
            },
          );
          const statusResJson = await statusRes.json();
          if (statusRes.status < 200 || statusRes.status >= 300) {
            botMessage.content =
              Locale.Midjourney.TaskStatusFetchFail +
                ": " +
                (statusResJson?.error || statusResJson?.description) ||
              Locale.Midjourney.UnknownReason;
          } else {
            let isFinished = false;
            let prefixContent = "";
            if (statusResJson.prompt) {
              prefixContent = Locale.Midjourney.TaskPrefix(
                statusResJson.prompt,
                taskId,
              );
            } else if (extAttr.prompt) {
              if (
                !extAttr.prompt.startsWith("**画面描述:**") &&
                !extAttr.prompt.startsWith("**Prompt:**")
              ) {
                prefixContent = Locale.Midjourney.TaskPrefix(
                  extAttr.prompt,
                  taskId,
                );
              } else {
                let endIndex = extAttr.prompt.indexOf(
                  Locale.Midjourney.TaskStatus,
                );
                if (endIndex > 0) {
                  prefixContent = extAttr.prompt.substring(0, endIndex);
                } else {
                  prefixContent = extAttr.prompt;
                }
              }
            }
            let content = "";
            switch (statusResJson?.status) {
              case "SUCCESS":
                content = statusResJson.imageUrl;
                isFinished = true;
                if (
                  statusResJson.imageUrl &&
                  !DrawUploadTaskArr.includes(taskId)
                ) {
                  DrawUploadTaskArr.push(taskId);
                  let imgUrl = useGetMidjourneySelfProxyUrl(
                    statusResJson.imageUrl,
                  );
                  if (useAccessStore.getState().enable_s) {
                    const imgUrls = await uploadImageToOss(imgUrl, null);
                    imgUrl = imgUrls ? imgUrls[0] : imgUrl;
                  }
                  if (statusResJson.action === "DESCRIBE") {
                    const resultPrompt = statusResJson.prompt
                      ? statusResJson.prompt
                      : statusResJson.promptEn;
                    prefixContent += `\n${resultPrompt}`;
                  }
                  const mContent = [] as MultimodalContent[];
                  mContent.push({ type: "text", text: prefixContent });
                  mContent.push({
                    type: "image_url",
                    image_url: { url: imgUrl },
                  });
                  botMessage.content = mContent;
                  botMessage.attr.promptEn = statusResJson.promptEn;

                  if (
                    statusResJson.buttons &&
                    statusResJson.buttons.length > 0
                  ) {
                    botMessage.attr.buttons = statusResJson.buttons;
                  }

                  // 存入store
                  const drawListStore = useDrawListStore.getState();
                  const drawItem = {
                    sessionId: extAttr.sessionId,
                    msgId: botMessage.id,
                    model: "midjourney",
                    action: botMessage.attr.action,
                    date: botMessage.date,
                    prompt: statusResJson.prompt ?? extAttr.prompt ?? "",
                    imgUrl: imgUrl,
                    mj: {
                      taskId: botMessage.attr.taskId,
                      discordUrl: statusResJson.imageUrl,
                    },
                  } as DrawItem;
                  drawListStore.addItem(drawItem);
                }

                break;
              case "FAILURE":
                content =
                  statusResJson.failReason || Locale.Midjourney.UnknownReason;
                isFinished = true;
                botMessage.content =
                  prefixContent +
                  `**${
                    Locale.Midjourney.TaskStatus
                  }:** [${new Date().toLocaleString()}] - ${content}`;
                break;
              case "NOT_START":
                content = Locale.Midjourney.TaskNotStart;
                break;
              case "IN_PROGRESS":
                content = Locale.Midjourney.TaskProgressTip(
                  statusResJson.progress,
                );
                break;
              case "SUBMITTED":
                content = Locale.Midjourney.TaskRemoteSubmit;
                break;
              default:
                content = statusResJson.status ?? Locale.Midjourney.None;
            }
            botMessage.attr.status = statusResJson.status;
            if (isFinished) {
              botMessage.attr.finished = true;
            } else {
              const textContent =
                prefixContent +
                `**${
                  Locale.Midjourney.TaskStatus
                }:** [${new Date().toLocaleString()}] - ${content}`;
              if (
                statusResJson.status === "IN_PROGRESS" &&
                statusResJson.imageUrl
              ) {
                let imgUrl = useGetMidjourneySelfProxyUrl(
                  statusResJson.imageUrl,
                );
                imgUrl += "?ts=" + new Date().getTime();
                const mContent = [] as MultimodalContent[];
                mContent.push({ type: "text", text: textContent });
                mContent.push({
                  type: "image_url",
                  image_url: { url: imgUrl },
                });
                botMessage.content = mContent;
              }
              this.fetchMidjourneyStatus(botMessage, extAttr);
            }
            set(() => ({}));
            if (isFinished) {
              extAttr?.setAutoScroll(true);
            }
          }
        }, 5000);
      },

      async fetchLuma(content: string, botMessage: ChatMessage, extAttr?: any) {
        const session = get().currentSession();
        const messageIndex = session.messages.length + 1;
        const drawConfig = extAttr.drawConfig;
        const params = {
          user_prompt: content,
          aspect_ratio: drawConfig.luma.aspect_ratio,
          expand_prompt: drawConfig.luma.expand_prompt,
          image_url: "",
          image_end_url: "",
          loop: false,
        };
        if (extAttr.uploadImages.length > 0) {
          for (let i = 0; i < extAttr.uploadImages.length; i++) {
            const imgFile = extAttr.uploadImages[i];
            const imgBase64 = imgFile.url
              ? imgFile.url
              : await getBase64(imgFile.originFileObj as RcFile);
            if (i == 0) {
              params.image_url = imgBase64;
            } else if (i == 1) {
              params.image_end_url = imgBase64;
            }
          }
          extAttr.setUploadImages([]);
        }

        const accessStore = useAccessStore.getState();
        let url = accessStore.lumaProxyUrl
          ? accessStore.lumaProxyUrl
          : "/api/luma";
        if (url.endsWith("/")) {
          url = url.slice(0, -1);
        }

        const headers =
          accessStore.lumaProxyUrl && accessStore.lumaApiKey
            ? {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: "Bearer " + accessStore.lumaApiKey,
              }
            : getHeaders();

        const res = await fetch(url + "/luma/generations_sync", {
          method: "post",
          headers,
          body: JSON.stringify(params),
        });

        if (res.ok) {
          const resJson = await res.json();
          botMessage.attr.taskId = resJson.id;
          botMessage.attr.status = "SUBMIT";
          botMessage.attr.fetchTimes = 0;
          botMessage.content =
            Locale.Video.SubmitSuccess + "\nTaskId: " + resJson.id;
          this.fetchLumaTasks(botMessage, extAttr);
        } else {
          botMessage.content =
            Locale.Video.SubmitError + "\n" + JSON.stringify(res);
          botMessage.streaming = false;
          botMessage.attr.status = "FAILURE";
        }

        get().onNewMessage(botMessage, get().currentSession());
        extAttr?.setAutoScroll(true);
      },

      async fetchLumaTasks(botMessage: ChatMessage, extAttr: any) {
        const taskId = botMessage?.attr?.taskId;
        if (
          !taskId ||
          ["SUCCESS", "FAILURE"].includes(botMessage?.attr?.status) ||
          ChatFetchTaskPool[taskId]
        ) {
          return;
        }
        ChatFetchTaskPool[taskId] = setTimeout(async () => {
          ChatFetchTaskPool[taskId] = null;
          const accessStore = useAccessStore.getState();
          let url = accessStore.lumaProxyUrl
            ? accessStore.lumaProxyUrl
            : "/api/luma";
          if (url.endsWith("/")) {
            url = url.slice(0, -1);
          }

          const headers =
            accessStore.lumaProxyUrl && accessStore.lumaApiKey
              ? {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: "Bearer " + accessStore.lumaApiKey,
                }
              : getHeaders();

          const res = await fetch(url + "/luma/generations/" + taskId, {
            method: "get",
            headers,
          });

          botMessage.attr.fetchTimes += 1;

          if (res.ok) {
            const resJson = await res.json();
            console.log(resJson);
            if (botMessage.attr.fetchTimes > 50) {
              botMessage.attr.status = "FAILURE";
              botMessage.attr.finished = true;
              botMessage.streaming = false;
              botMessage.content = Locale.Video.TaskTimeOut;
            } else if (resJson.state != "completed") {
              this.fetchLumaTasks(botMessage, extAttr);
            } else if (resJson.video) {
              botMessage.attr.status = "SUCCESS";
              botMessage.attr.finished = true;
              botMessage.attr.download_url = resJson.video.download_url;
              const mContent = [] as MultimodalContent[];
              mContent.push({ type: "text", text: resJson.prompt });
              mContent.push({
                type: "file",
                file: { name: "", type: "video", url: resJson.video.url },
              });
              botMessage.content = mContent;
              botMessage.streaming = false;

              // 获取无水印链接
              // try {
              //   fetch(
              //     url + "/luma/generations/" + taskId + "/download_video_url",
              //     {
              //       method: "get",
              //       headers,
              //     },
              //   )
              //     .then((res) => res.json())
              //     .then((res) => {
              //       if (res.url) {
              //         botMessage.attr.download_url_hd = res.url;
              //         set(() => ({}));
              //       }
              //     });
              // } catch (e) {
              //   console.log(e);
              // }

              set(() => ({}));
              if (botMessage.attr.finished) {
                get().onNewMessage(botMessage, get().currentSession());
              }
              extAttr?.setAutoScroll(true);
            }
          }
        }, 5000);
      },

      async fetchStableDiffusion(
        content: string,
        botMessage: ChatMessage,
        extAttr?: any,
      ) {
        const session = get().currentSession();
        const messageIndex = session.messages.length + 1;
        const drawConfig = extAttr.drawConfig;
        const action = drawConfig.sd.api_mode;
        const params = JSON.parse(JSON.stringify(drawConfig.sd));
        params.prompt = content;
        const n_index = content.indexOf(" &N ");
        if (n_index > 0) {
          params.prompt = content.substring(0, n_index);
          params.negative_prompt = content.substring(n_index + 4);
        }

        if (params.enable_hr) {
          params.hr_prompt = params.prompt;
          params.hr_negative_prompt = params.negative_prompt;
        }
        const imageBase64Arr = [] as string[];
        const imageList = [] as any[];
        if (extAttr.uploadImages.length > 0) {
          for (const imgFile of extAttr.uploadImages) {
            const imgBase64 = imgFile.url
              ? (await getBase64FromUrl(imgFile.url)).base64
              : await getBase64(imgFile.originFileObj as RcFile);
            imageBase64Arr.push(imgBase64);

            if (action == "extras") {
              const image = {
                name: imgFile.name,
                data: imgBase64,
              };
              imageList.push(image);
            }
          }
          extAttr.setUploadImages([]);
        }

        // lora
        if (
          drawConfig.sd.lora.length > 0 &&
          (action == "txt2img" || action == "img2img")
        ) {
          drawConfig.sd.lora.forEach((lora: any, index: number) => {
            params.prompt += "<lora:" + lora.name + ":" + lora.weight + ">";
          });
        }

        botMessage.model = "stable-diffusion";

        const startTask = async () => {
          botMessage.attr.action = action;
          botMessage.attr.status = "PROGRESS";
          try {
            let res = null;
            const sdReq = (path: string, method: string, body?: any) => {
              return fetch("/api/stable-diffusion/" + path, {
                method: method,
                headers: getHeaders(),
                body: body,
              });
            };

            switch (action) {
              case "txt2img": {
                res = await sdReq("txt2img", "POST", JSON.stringify(params));
                break;
              }
              case "img2img": {
                params.init_images = imageBase64Arr;
                if (extAttr.uploadMaskImages.length > 0) {
                  const imgBase64 = await getBase64(
                    extAttr.uploadMaskImages[0].originFileObj as RcFile,
                  );
                  params.mask = imgBase64 as string;
                  extAttr.setUploadMaskImages([]);
                }
                res = await sdReq("img2img", "POST", JSON.stringify(params));
                break;
              }
              case "extras": {
                params.imageList = imageList;
                res = await sdReq(
                  "extra-batch-images",
                  "POST",
                  JSON.stringify(params),
                );
                break;
              }
              case "pngInfo": {
                res = await sdReq(
                  "png-info",
                  "POST",
                  JSON.stringify({ image: imageBase64Arr[0] }),
                );
                break;
              }
            }

            if (res == null) {
              botMessage.content =
                Locale.Midjourney.TaskErrNotSupportType(action);
              botMessage.streaming = false;
              return;
            }
            if (!res.ok) {
              const text = await res.text();
              throw new Error(
                `\n${Locale.Midjourney.StatusCode(
                  res.status,
                )}\n${Locale.Midjourney.RespBody(
                  text || Locale.Midjourney.None,
                )}`,
              );
            }
            const resJson = await res.json();

            if (res.status == 200) {
              if (resJson.imgUrlArr) {
                botMessage.attr.parameters = resJson.parameters ?? "";
                botMessage.attr.info = resJson.info ?? "";
                botMessage.attr.html_info = resJson.html_info ?? "";
                const mContent = [] as MultimodalContent[];
                if (resJson.imgUrlArr.length > 0) {
                  botMessage.attr.status = "SUCCESS";
                  mContent.push({ type: "text", text: "" });
                  resJson.imgUrlArr.forEach((imgUrl: string, index: number) => {
                    mContent.push({
                      type: "image_url",
                      image_url: { url: imgUrl },
                    });
                  });
                } else if (resJson.images.length > 0) {
                  const imgUrlArr = await uploadImageToOss(
                    null,
                    resJson.images,
                  );
                  imgUrlArr.forEach((imgUrl: string, index: number) => {
                    mContent.push({
                      type: "image_url",
                      image_url: { url: imgUrl },
                    });
                  });
                } else if (resJson.image.length > 0) {
                  const imgUrlArr = await uploadImageToOss(null, [
                    resJson.image,
                  ]);
                  imgUrlArr.forEach((imgUrl: string, index: number) => {
                    mContent.push({
                      type: "image_url",
                      image_url: { url: imgUrl },
                    });
                  });
                } else {
                  botMessage.attr.status = "ERROR";
                  mContent.push({
                    type: "text",
                    text: "Response Data is None!",
                  });
                }
                botMessage.content = mContent;

                // 存入store
                const drawListStore = useDrawListStore.getState();
                resJson.imgUrlArr.forEach((imgUrl: string) => {
                  const drawItem = {
                    sessionId: session.id,
                    msgId: botMessage.id,
                    model: "stable-diffusion",
                    action: action,
                    date: botMessage.date,
                    prompt: content,
                    imgUrl: imgUrl,
                    sd: {
                      parameters: resJson.parameters ?? "",
                      info: resJson.info ?? "",
                      html_info: resJson.html_info ?? "",
                    },
                  } as DrawItem;
                  drawListStore.addItem(drawItem);
                });
              } else if (action == "pngInfo") {
                let imgUrlArr = [] as string[];
                await uploadImageToOss(null, imageBase64Arr).then((res) => {
                  imgUrlArr = res;
                });
                botMessage.attr.parameters = resJson.items.parameters ?? "";
                botMessage.attr.info = resJson.info ?? "";
                let prefixContent = `**Info:** ${resJson.info}\n**Parameters:** ${resJson.items.parameters}\n`;
                const mContent = [] as MultimodalContent[];
                mContent.push({ type: "text", text: prefixContent });
                if (imgUrlArr.length > 0) {
                  botMessage.attr.status = "SUCCESS";
                  imgUrlArr.forEach((imgUrl, index) => {
                    mContent.push({
                      type: "image_url",
                      image_url: { url: imgUrl },
                    });
                  });
                } else {
                  botMessage.attr.status = "ERROR";
                }
                botMessage.content = mContent;
              } else {
                botMessage.content = botMessage.content =
                  Locale.Midjourney.TaskSubmitErr(JSON.stringify(resJson));
              }
            } else {
              botMessage.content = botMessage.content =
                Locale.Midjourney.TaskSubmitErr(JSON.stringify(resJson));
            }
          } catch (e: any) {
            console.error(e);
            botMessage.attr.status = "ERROR";
            botMessage.content = Locale.Midjourney.TaskSubmitErr(
              e?.error || e?.message || Locale.Midjourney.UnknownError,
            );
          } finally {
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );
            botMessage.streaming = false;
            botMessage.attr.finished = true;
          }
        };

        await startTask();
        get().onNewMessage(botMessage, session);
        extAttr?.setAutoScroll(true);
      },

      translate(userInput: string, setUserInput: any, setShowLoading: any) {
        if (!userInput || userInput.trim() == "") {
          showToast(Locale.Chat.InputActions.InputTips);
          return;
        }
        setShowLoading(true);
        const session = get().currentSession();
        const messages = [] as ChatMessage[];
        const topicMessages = messages.concat(
          createMessage({
            role: "system",
            content: Locale.Chat.InputActions.TranslateTo,
          }),
          createMessage({
            role: "user",
            content: userInput,
          }),
        );
        const modelConfig = session.mask.modelConfig;
        // if not config compressModel, then using getSummarizeModel
        const [model, providerName] = modelConfig.compressModel
          ? [modelConfig.compressModel, modelConfig.compressProviderName]
          : getSummarizeModel(
              session.mask.modelConfig.model,
              session.mask.modelConfig.providerName,
            );
        var api = getClientApi(ServiceProvider.OpenAI);
        api.llm.chat({
          messages: topicMessages,
          config: {
            model,
            providerName,
          },
          onFinish(message) {
            if (message.length > 0) {
              message = message
                .replace("Translate the user input to English:", "")
                .replace("Translate to English:", "")
                .replace("Translate to:", "");
              setUserInput(message);
            } else {
              showToast(Locale.Chat.InputActions.TranslateError);
            }
            setShowLoading(false);
          },
          onError(error) {
            console.log(error);
            showToast(Locale.Chat.InputActions.TranslateError);
            setShowLoading(false);
          },
        });
      },

      async imagesGenerations(
        content: any,
        botMessage: ChatMessage,
        extAttr: any,
      ) {
        let prompt = content;
        if (content instanceof Array) {
          prompt = content[0].text;
        }

        let options = {
          model: botMessage.model,
          prompt: prompt,
          ...extAttr.drawConfig.dall,
        };
        if (options.model !== "dall-e-3") {
          delete options.style;
          delete options.response_format;
        }
        if (extAttr.isEdit) {
          // 重绘的时候
          prompt = extAttr.prompt;
          options = {
            ...options,
            prompt: prompt,
            image: extAttr.image.startsWith("http")
              ? await getImageFileFromUrl(extAttr.image)
              : await base64ToFile(extAttr.image, "original.png"),
            mask: await base64ToFile(extAttr.maskBase64, "mask.png"),
            isEdit: true,
          };
        }
        let resJson: any;
        var api: ClientApi = getClientApi(ServiceProvider.OpenAI);
        await api.llm
          .imagesGenerations(options)
          .then((res) => res.json())
          .then((res) => {
            resJson = res;
          });

        if (
          resJson.data &&
          resJson.data instanceof Array &&
          resJson.data.length > 0
        ) {
          // 存入store
          const drawListStore = useDrawListStore.getState();
          const session = get().currentSession();

          let promptContent = "";
          const imgContent = [] as any[];
          for (let i = 0; i < resJson.data.length; i++) {
            const item = resJson.data[i];
            promptContent +=
              (promptContent != "" ? "\n" : "") +
              (i + 1) +
              "." +
              item.revised_prompt;

            // 图片上传到oss
            let urlArr = [] as string[];
            let imgBase64 = "";
            if (item.url) {
              urlArr = await uploadImageToOss(item.url, []);
            } else if (item.b64_json) {
              urlArr = await uploadImageToOss("", [item.b64_json]);
              imgBase64 = item.b64_json.startsWith("data")
                ? item.b64_json
                : "data:image/png;base64," + item.b64_json;
            }
            const imgUrl =
              urlArr.length > 0 ? urlArr[0] : (item.url ?? imgBase64 ?? "");
            imgContent.push({
              type: "image_url",
              image_url: { url: imgUrl },
            });

            const drawItem = {
              sessionId: session.id,
              msgId: botMessage.id,
              model: botMessage.model,
              action: "generations",
              date: botMessage.date,
              prompt: content,
              imgUrl: imgUrl,
            } as DrawItem;
            drawListStore.addItem(drawItem);
          }

          imgContent.unshift({
            type: "text",
            text: Locale.Dall.RevisedPrompt(promptContent),
          });
          botMessage.content = imgContent;
          botMessage.attr.status = "SUCCESS";
        } else {
          botMessage.attr.status = "ERROR";
          botMessage.content =
            Locale.Dall.FetchImageError + "\n\n" + prettyObject(resJson);
        }
        botMessage.streaming = false;
        botMessage.attr.finished = true;

        get().onNewMessage(botMessage, get().currentSession());
        extAttr?.setAutoScroll(true);
      },

      async audioTranscriptions(
        userContent: any,
        botMessage: ChatMessage,
        extAttr: any,
        fileArr: any[],
      ) {
        let prompt = "";
        let fileObj = [] as File[];
        if (fileArr.length > 0) {
          fileArr.forEach((file) => {
            fileObj.push(file.fileObj as File);
          });
        }
        for (const content of userContent) {
          if (content.type == "text") {
            prompt += content.text;
          } else if (
            content.type == "file" &&
            content.file.url &&
            fileArr.length < 1
          ) {
            const file = await getFileFromUrl(
              content.file.url,
              content.file.name,
            );
            if (file != undefined) {
              fileObj.push(file);
            }
          }
        }
        let formData = new FormData();
        formData.append("model", botMessage.model as string);
        formData.append("prompt", prompt);
        fileObj.forEach((file: File) => {
          formData.append("file", file);
        });

        let resJson: any;
        var api: ClientApi = getClientApi(ServiceProvider.OpenAI);
        await api.llm
          .audioTranscriptions(formData)
          .then((res) => res.json())
          .then((res) => {
            resJson = res;
          });

        botMessage.streaming = false;
        botMessage.content = resJson.text
          ? resJson.text
          : prettyObject(resJson);

        get().onNewMessage(botMessage, get().currentSession());
        extAttr?.setAutoScroll(true);
      },

      async audioSpeech(content: any, botMessage: ChatMessage, extAttr: any) {
        const config = useAppConfig.getState();
        const options = {
          model: botMessage.model,
          input: content,
          ...config.speech,
        };
        try {
          const fileName = nanoid() + "." + config.speech.response_format;
          let fileType = "";
          const formdata = new FormData();
          var api: ClientApi = getClientApi(ServiceProvider.OpenAI);
          await api.llm
            .audioSpeech(options)
            .then((res) => res.blob())
            .then((blob) => {
              if (blob.size > 0) {
                fileType = blob.type;
                const file = new File([blob], fileName);
                formdata.append("file", file);
              }
            });
          // 把文件上传到oss
          if (fileType && formdata.has("file")) {
            const fileUrl = await uploadFileToFileServer(formdata);
            botMessage.content = [
              {
                type: "file",
                file: { name: fileName, type: fileType, url: fileUrl },
              },
            ];
          } else {
            botMessage.content = Locale.Chat.Speech.FetchAudioError;
          }
        } catch (err) {
          console.log(err);
          botMessage.content = prettyObject(err);
        }

        botMessage.streaming = false;
        get().onNewMessage(botMessage, get().currentSession());
        extAttr?.setAutoScroll(true);
      },
    };

    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 3.3,
    migrate(persistedState, version) {
      const state = persistedState as any;
      const newState = JSON.parse(
        JSON.stringify(state),
      ) as typeof DEFAULT_CHAT_STATE;

      if (version < 2) {
        newState.sessions = [];

        const oldSessions = state.sessions;
        for (const oldSession of oldSessions) {
          const newSession = createEmptySession();
          newSession.topic = oldSession.topic;
          newSession.messages = [...oldSession.messages];
          newSession.mask.modelConfig.sendMemory = true;
          newSession.mask.modelConfig.historyMessageCount = 4;
          newSession.mask.modelConfig.compressMessageLengthThreshold = 1000;
          newState.sessions.push(newSession);
        }
      }

      if (version < 3) {
        // migrate id to nanoid
        newState.sessions.forEach((s) => {
          s.id = nanoid();
          s.messages.forEach((m) => (m.id = nanoid()));
        });
      }

      // Enable `enableInjectSystemPrompts` attribute for old sessions.
      // Resolve issue of old sessions not automatically enabling.
      if (version < 3.1) {
        newState.sessions.forEach((s) => {
          if (
            // Exclude those already set by user
            !s.mask.modelConfig.hasOwnProperty("enableInjectSystemPrompts")
          ) {
            // Because users may have changed this configuration,
            // the user's current configuration is used instead of the default
            const config = useAppConfig.getState();
            s.mask.modelConfig.enableInjectSystemPrompts =
              config.modelConfig.enableInjectSystemPrompts;
          }
        });
      }

      // add default summarize model for every session
      if (version < 3.2) {
        newState.sessions.forEach((s) => {
          const config = useAppConfig.getState();
          s.mask.modelConfig.compressModel = config.modelConfig.compressModel;
          s.mask.modelConfig.compressProviderName =
            config.modelConfig.compressProviderName;
        });
      }
      // revert default summarize model for every session
      if (version < 3.3) {
        newState.sessions.forEach((s) => {
          const config = useAppConfig.getState();
          s.mask.modelConfig.compressModel = "";
          s.mask.modelConfig.compressProviderName = "";
        });
      }

      return newState as any;
    },
  },
);
