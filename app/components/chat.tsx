import { useDebouncedCallback } from "use-debounce";
import React, {
  Fragment,
  RefObject,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// @ts-ignore
import { useSpeechSynthesis } from "react-speech-kit";
import { useAudioRecorder } from "react-audio-voice-recorder";

import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import EditIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import LoadingButtonIcon from "../icons/loading.svg";
import PromptIcon from "../icons/prompt.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import ReloadIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import DeleteIcon from "../icons/clear.svg";
import PinIcon from "../icons/pin.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CloseIcon from "../icons/close.svg";
import CancelIcon from "../icons/cancel.svg";

import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import StyleIcon from "../icons/palette.svg";
import PluginIcon from "../icons/plugin.svg";
import ShortcutkeyIcon from "../icons/shortcutkey.svg";
import McpToolIcon from "../icons/tool.svg";
import HeadphoneIcon from "../icons/headphone.svg";
import DrawSetting from "../icons/draw-setting.svg";
import U2Icon from "../icons/U2.svg";
import U3Icon from "../icons/U3.svg";
import U4Icon from "../icons/U4.svg";
import V1Icon from "../icons/V1.svg";
import V2Icon from "../icons/V2.svg";
import V3Icon from "../icons/V3.svg";
import V4Icon from "../icons/V4.svg";
import Txt2imgIcon from "../icons/txt2img.svg";
import Img2imgIcon from "../icons/img2img.svg";
import InpaintIcon from "../icons/inpaint.svg";
import ExtrasIcon from "../icons/extras.svg";
import TranslateIcon from "../icons/translate.svg";
import UploadFileIcon from "../icons/upload-file.svg";
import VideoSettingIcom from "../icons/video.svg";
import VoiceSettingIcon from "../icons/voice-setting.svg";
import RecorderIcon from "../icons/recorder.svg";
import AppsIcon from "../icons/models.svg";
import TokenIcon from "../icons/token.svg";
import SpeekIcon from "../icons/speek.svg";
import CoinIcon from "../icons/coin.svg";
import DownloadIcon from "../icons/download.svg";

import {
  BOT_HELLO,
  ChatMessage,
  createMessage,
  DEFAULT_TOPIC,
  ModelType,
  SubmitKey,
  Theme,
  useAccessStore,
  useAppConfig,
  useChatStore,
  usePluginStore,
} from "../store";

import {
  autoGrowTextArea,
  copyToClipboard,
  countTokens,
  getMessageImages,
  getMessageTextContent,
  isDalle3,
  isMultiModel,
  isVisionModel,
  safeLocalStorage,
  getModelSizes,
  useMobileScreen,
  selectOrCopy,
  showPlugins,
} from "../utils";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { DalleQuality, DalleStyle, ModelSize } from "../typing";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./chat.module.scss";

import {
  List,
  ListItem,
  Modal,
  Selector,
  showConfirm,
  ShowLoading,
  showPrompt,
  showToast,
} from "./ui-lib";
import { useNavigate } from "react-router-dom";
import {
  CHAT_PAGE_SIZE,
  DEFAULT_TTS_ENGINE,
  ModelProvider,
  Path,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
  UNFINISHED_INPUT,
} from "../constant";
import { Avatar } from "./emoji";
import { ContextPrompts, MaskAvatar, MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "../command";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "./exporter";
import { getClientConfig } from "../config/client";
import { useAllModels } from "../utils/hooks";
import { ClientApi, MultimodalContent } from "@/app/client/api";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadProps } from "antd/es/upload/interface";
import { MidjourneyConfigModal } from "@/app/components/midjourney";
import { StableDiffusionConfigModal } from "@/app/components/stable-diffusion";
import { ImageSelect } from "@/app/components/image-select";
import { useAuthStore } from "@/app/store/auth";
import { Button, InputNumber, Tooltip, Upload } from "antd";
import { DrawConfig, useDrawConfigStore } from "@/app/store/draw-config";
import { DallEConfigModal } from "@/app/components/dall-e";
import { AudioSpeechConfigModal } from "@/app/components/audio-speech";
import { nanoid } from "nanoid";
import { uploadFileToFileServer } from "@/app/utils/upload";
import { ModelSelector } from "./model-selector";
import { ChatMessageMedias } from "@/app/components/chat-message-medias";
import { createTTSPlayer } from "../utils/audio";
import { MsEdgeTTS, OUTPUT_FORMAT } from "../utils/ms_edge_tts";
import { InpaintModal } from "@/app/components/inpaint";
import { VideoConfigModal } from "@/app/components/video";

import { RealtimeChat } from "@/app/components/realtime-chat";
import clsx from "clsx";
import { getAvailableClientsCount, isMcpEnabled } from "../mcp/actions";

const localStorage = safeLocalStorage();

const ttsPlayer = createTTSPlayer();

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

const MCPAction = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number>(0);
  const [mcpEnabled, setMcpEnabled] = useState(false);

  useEffect(() => {
    const checkMcpStatus = async () => {
      const enabled = await isMcpEnabled();
      setMcpEnabled(enabled);
      if (enabled) {
        const count = await getAvailableClientsCount();
        setCount(count);
      }
    };
    checkMcpStatus();
  }, []);

  if (!mcpEnabled) return null;

  return (
    <ChatAction
      onClick={() => navigate(Path.McpMarket)}
      text={`MCP${count ? ` (${count})` : ""}`}
      icon={<McpToolIcon />}
    />
  );
};

export function SessionConfigModel(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.Config.Reset}
            onClick={async () => {
              if (await showConfirm(Locale.Memory.ResetConfirm)) {
                chatStore.updateTargetSession(
                  session,
                  (session) => (session.memoryPrompt = ""),
                );
              }
            }}
          />,
          <IconButton
            key="copy"
            icon={<CopyIcon />}
            bordered
            text={Locale.Chat.Config.SaveAs}
            onClick={() => {
              navigate(Path.Masks);
              setTimeout(() => {
                maskStore.create(session.mask);
              }, 500);
            }}
          />,
        ]}
      >
        <MaskConfig
          mask={session.mask}
          updateMask={(updater) => {
            const mask = { ...session.mask };
            updater(mask);
            chatStore.updateTargetSession(
              session,
              (session) => (session.mask = mask),
            );
          }}
          shouldSyncFromGlobal
          extraListItems={
            session.mask.modelConfig.sendMemory ? (
              <ListItem
                className="copyable"
                title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
              ></ListItem>
            ) : (
              <></>
            )
          }
        ></MaskConfig>
      </Modal>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={styles["prompt-toast"]} key="prompt-toast">
      {props.showToast && context.length > 0 && (
        <div
          className={clsx(styles["prompt-toast-inner"], "clickable")}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={styles["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;
  const isComposing = useRef(false);

  useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true;
    };
    const onCompositionEnd = () => {
      isComposing.current = false;
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);

    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Fix Chinese input method "Enter" on Safari
    if (e.keyCode == 229) return false;
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
      return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export type RenderPrompt = Pick<Prompt, "title" | "content">;

export function PromptHints(props: {
  prompts: RenderPrompt[];
  onPromptSelect: (prompt: RenderPrompt) => void;
}) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={clsx(styles["prompt-hint"], {
            [styles["prompt-hint-selected"]]: i === selectIndex,
          })}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function ClearContextDivider() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  return (
    <div
      className={styles["clear-context"]}
      onClick={() =>
        chatStore.updateTargetSession(
          session,
          (session) => (session.clearContextIndex = undefined),
        )
      }
    >
      <div className={styles["clear-context-tips"]}>{Locale.Context.Clear}</div>
      <div className={styles["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

export function ChatAction(props: {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
  alwaysDisplayText?: boolean;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  useEffect(() => {
    if (props.alwaysDisplayText) {
      updateWidth();
    }
  }, [props.text]);

  return (
    <div
      className={clsx(styles["chat-input-action"], "clickable")}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${
            props.alwaysDisplayText ? width.full : width.icon
          }px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      <div
        className={[
          styles["text"],
          props.alwaysDisplayText ? styles["text-always"] : "",
        ].join(" ")}
        ref={textRef}
      >
        {props.text}
      </div>
    </div>
  );
}

function useScrollToBottom(
  scrollRef: RefObject<HTMLDivElement>,
  detach: boolean = false,
  messages: ChatMessage[],
) {
  // for auto-scroll
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollDomToBottom = useCallback(() => {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }, [scrollRef]);

  // auto scroll
  useEffect(() => {
    if (autoScroll && !detach) {
      scrollDomToBottom();
    }
  });

  // auto scroll when messages length changes
  const lastMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > lastMessagesLength.current && !detach) {
      scrollDomToBottom();
    }
    lastMessagesLength.current = messages.length;
  }, [messages.length, detach, scrollDomToBottom]);

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}

export function ChatActions(props: {
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  setShowShortcutKeyModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUserInput: (input: string) => void;
  setShowChatSidePanel: React.Dispatch<React.SetStateAction<boolean>>;
  translate: () => void;
  upload: () => void;
  uploadImages: UploadFile[];
  setUploadImages: (uploadImages: UploadFile[]) => void;
  uploadMaskImages: UploadFile[];
  setUploadMaskImages: (uploadMaskImages: UploadFile[]) => void;
  tokens: number;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();
  const pluginStore = usePluginStore();
  const session = chatStore.currentSession();

  // switch themes
  const theme = config.theme;

  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const currentModel = session.mask.modelConfig.model;
  const currentProviderName =
    session.mask.modelConfig?.providerName || ServiceProvider.OpenAI;
  const currentDisplayName = session.mask.modelConfig.displayName;
  const allModels = useAllModels();
  const models = useMemo(() => {
    const filteredModels = allModels.filter((m) => m.available);
    const defaultModel = filteredModels.find((m) => m.isDefault);

    if (defaultModel) {
      const arr = [
        defaultModel,
        ...filteredModels.filter((m) => m !== defaultModel),
      ];
      return arr;
    } else {
      return filteredModels;
    }
  }, [allModels]);
  const currentModelName = useMemo(() => {
    const model = models.find(
      (m) =>
        m.name == currentModel &&
        m?.provider?.providerName == currentProviderName,
    );
    return model?.displayName ?? "";
  }, [models, currentModel, currentProviderName]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const accessStore = useAccessStore();

  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const modelSizes = getModelSizes(currentModel);
  const dalle3Qualitys: DalleQuality[] = ["standard", "hd"];
  const dalle3Styles: DalleStyle[] = ["vivid", "natural"];
  const currentSize =
    session.mask.modelConfig?.size ?? ("1024x1024" as ModelSize);
  const currentQuality = session.mask.modelConfig?.quality ?? "standard";
  const currentStyle = session.mask.modelConfig?.style ?? "vivid";

  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    // if current model is not available
    // switch to first available model
    const isUnavailableModel = !models.some((m) => m.name === currentModel);
    if (
      isUnavailableModel &&
      models.length > 0 &&
      !accessStore.gpts.includes(currentModel)
    ) {
      let nextModel = models.find((model) => model.isDefault) || models[0];
      chatStore.updateTargetSession(session, (session) => {
        session.mask.modelConfig.model = nextModel.name;
        session.mask.modelConfig.displayName = nextModel.displayName;
        session.mask.modelConfig.providerName = nextModel?.provider
          ?.providerName as ServiceProvider;
      });
      showToast(nextModel.displayName ?? nextModel.name);
    }
  }, [chatStore, currentModel, models, session]);

  const [clearContext, setClearContext] = useState(false);
  useEffect(() => {
    if (
      session.clearContextIndex != undefined &&
      session.clearContextIndex == session.messages.length
    ) {
      setClearContext(true);
    } else {
      setClearContext(false);
    }
  }, []);

  const [showDrawConfigModal, setShowDrawConfigModal] = useState(false);
  const [showSpeechConfigModal, setShowSpeechConfigModal] = useState(false);
  const [showUploadAction, setShowUploadAction] = useState(false);
  const [showVideoAction, setShowVideoAction] = useState(false);

  useEffect(() => {
    if (currentModel != "midjourney" && currentModel != "stable-diffusion") {
      setShowUploadAction(true);
    } else {
      setShowUploadAction(false);
    }
  }, [currentModel]);

  return (
    <div className={styles["chat-input-actions"]}>
      <>
        {couldStop && (
          <ChatAction
            onClick={stopAll}
            text={Locale.Chat.InputActions.Stop}
            icon={<StopIcon />}
          />
        )}
        {!props.hitBottom && (
          <ChatAction
            onClick={props.scrollToBottom}
            text={Locale.Chat.InputActions.ToBottom}
            icon={<BottomIcon />}
          />
        )}
        {props.hitBottom && (
          <ChatAction
            onClick={props.showPromptModal}
            text={Locale.Chat.InputActions.Settings}
            icon={<SettingsIcon />}
          />
        )}

        {/*<ChatAction*/}
        {/*  onClick={nextTheme}*/}
        {/*  text={Locale.Chat.InputActions.Theme[theme]}*/}
        {/*  icon={*/}
        {/*    <>*/}
        {/*      {theme === Theme.Auto ? (*/}
        {/*        <AutoIcon />*/}
        {/*      ) : theme === Theme.Light ? (*/}
        {/*        <LightIcon />*/}
        {/*      ) : theme === Theme.Dark ? (*/}
        {/*        <DarkIcon />*/}
        {/*      ) : null}*/}
        {/*    </>*/}
        {/*  }*/}
        {/*/>*/}

        <ChatAction
          onClick={props.showPromptHints}
          text={Locale.Chat.InputActions.Prompt}
          icon={<PromptIcon />}
        />

        {/*<ChatAction*/}
        {/*  onClick={() => {*/}
        {/*    navigate(Path.Masks);*/}
        {/*  }}*/}
        {/*  text={Locale.Chat.InputActions.Masks}*/}
        {/*  icon={<MaskIcon />}*/}
        {/*/>*/}

        <ChatAction
          text={
            clearContext
              ? Locale.Chat.InputActions.Revert
              : Locale.Chat.InputActions.Clear
          }
          icon={<BreakIcon />}
          onClick={() => {
            chatStore.updateTargetSession(session, (session) => {
              if (session.clearContextIndex === session.messages.length) {
                session.clearContextIndex = undefined;
                setClearContext(false);
              } else {
                session.clearContextIndex = session.messages.length;
                session.memoryPrompt = ""; // will clear memory
                setClearContext(true);
              }
            });
          }}
        />

        <ChatAction
          onClick={() => setShowModelSelector(true)}
          text={currentDisplayName ? currentDisplayName : currentModelName}
          icon={<AppsIcon />}
          alwaysDisplayText={accessStore.alwaysDisplayModel}
        />

        {showModelSelector && (
          <ModelSelector
            currentModel={currentModel + "@" + currentProviderName}
            updateCurrentModel={(
              model: string,
              displayName: string,
              avatar: string,
              providerName: string,
            ) => {
              if (
                model != currentModel ||
                providerName != currentProviderName
              ) {
                chatStore.updateTargetSession(session, (session) => {
                  session.mask.modelConfig.model = model as ModelType;
                  session.mask.modelConfig.displayName = displayName;
                  session.mask.modelConfig.avatar = avatar;
                  session.mask.modelConfig.providerName =
                    providerName as ServiceProvider;
                  session.mask.syncGlobalConfig = false;
                });
                displayName ? showToast(displayName) : null;
              }
            }}
            onClose={() => setShowModelSelector(false)}
          />
        )}

        {showQualitySelector && (
          <Selector
            defaultSelectedValue={currentQuality}
            items={dalle3Qualitys.map((m) => ({
              title: m,
              value: m,
            }))}
            onClose={() => setShowQualitySelector(false)}
            onSelection={(q) => {
              if (q.length === 0) return;
              const quality = q[0];
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.quality = quality;
              });
              showToast(quality);
            }}
          />
        )}

        {isDalle3(currentModel) && (
          <ChatAction
            onClick={() => setShowStyleSelector(true)}
            text={currentStyle}
            icon={<StyleIcon />}
          />
        )}

        {showStyleSelector && (
          <Selector
            defaultSelectedValue={currentStyle}
            items={dalle3Styles.map((m) => ({
              title: m,
              value: m,
            }))}
            onClose={() => setShowStyleSelector(false)}
            onSelection={(s) => {
              if (s.length === 0) return;
              const style = s[0];
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.style = style;
              });
              showToast(style);
            }}
          />
        )}

        {showPlugins(currentProviderName, currentModel) && (
          <ChatAction
            onClick={() => {
              if (pluginStore.getAll().length == 0) {
                navigate(Path.Plugins);
              } else {
                setShowPluginSelector(true);
              }
            }}
            text={Locale.Plugin.Name}
            icon={<PluginIcon />}
          />
        )}
        {showPluginSelector && (
          <Selector
            multiple
            defaultSelectedValue={chatStore.currentSession().mask?.plugin}
            items={pluginStore.getAll().map((item) => ({
              title: `${item?.title}@${item?.version}`,
              value: item?.id,
            }))}
            onClose={() => setShowPluginSelector(false)}
            onSelection={(s) => {
              chatStore.updateTargetSession(session, (session) => {
                session.mask.plugin = s as string[];
              });
            }}
          />
        )}

        {!isMobileScreen && (
          <ChatAction
            onClick={() => props.setShowShortcutKeyModal(true)}
            text={Locale.Chat.ShortcutKey.Title}
            icon={<ShortcutkeyIcon />}
          />
        )}
        {!isMobileScreen && <MCPAction />}

        <ChatAction
          onClick={() => props.translate()}
          text={Locale.Chat.InputActions.Translate}
          icon={<TranslateIcon />}
        />

        {showUploadAction && (
          <ChatAction
            onClick={() => props.upload()}
            text={Locale.Chat.InputActions.Upload}
            icon={<UploadFileIcon />}
          />
        )}

        {(currentModel.includes("dall-e") ||
          currentModel.includes("gpt-image") ||
          currentModel == "midjourney" ||
          currentModel == "stable-diffusion") && (
          <ChatAction
            onClick={() => setShowDrawConfigModal(true)}
            text={Locale.Chat.InputActions.DrawSettings}
            icon={<DrawSetting />}
          />
        )}

        {showDrawConfigModal && (
          <>
            {(currentModel.includes("dall-e") ||
              currentModel.includes("gpt-image")) && (
              <DallEConfigModal
                uploadImages={props.uploadImages}
                setUploadImages={props.setUploadImages}
                onClose={() => setShowDrawConfigModal(false)}
              />
            )}
            {currentModel == "midjourney" && (
              <MidjourneyConfigModal
                uploadImages={props.uploadImages}
                setUploadImages={props.setUploadImages}
                onClose={() => setShowDrawConfigModal(false)}
              />
            )}
            {currentModel == "stable-diffusion" && (
              <StableDiffusionConfigModal
                uploadImages={props.uploadImages}
                setUploadImages={props.setUploadImages}
                uploadMaskImages={props.uploadMaskImages}
                setUploadMaskImages={props.setUploadMaskImages}
                onClose={() => setShowDrawConfigModal(false)}
              />
            )}
          </>
        )}

        {currentModel.includes("tts") && (
          <ChatAction
            onClick={() => setShowSpeechConfigModal(true)}
            text={Locale.Chat.Config.SpeechSettings}
            icon={<VoiceSettingIcon />}
          />
        )}

        {showSpeechConfigModal && (
          <AudioSpeechConfigModal
            onClose={() => setShowSpeechConfigModal(false)}
          />
        )}

        {currentModel.startsWith("luma") && (
          <ChatAction
            onClick={() => setShowVideoAction(true)}
            text={Locale.Chat.InputActions.VideoSetting}
            icon={<VideoSettingIcom />}
          />
        )}

        {showVideoAction && (
          <VideoConfigModal
            uploadImages={props.uploadImages}
            setUploadImages={props.setUploadImages}
            onClose={() => setShowVideoAction(false)}
          />
        )}

        <ChatAction
          onClick={() => {}}
          text={props.tokens + ""}
          icon={<CoinIcon />}
          alwaysDisplayText={props.tokens > 0}
        />
      </>
      <div className={styles["chat-input-actions-end"]}>
        {config.realtimeConfig.enable && (
          <ChatAction
            onClick={() => props.setShowChatSidePanel(true)}
            text={"Realtime Chat"}
            icon={<HeadphoneIcon />}
          />
        )}
      </div>
    </div>
  );
}

export function CustomZoomModal(props: {
  message: ChatMessage;
  customId: string;
  doSubmit: (action: string, mjExt: any) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1.8);
  let prompt = props.message.attr.promptEn;

  const onValueChange = (value: number | null) => {
    setZoom(value ? value : 1.8);
  };

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Midjourney.CustomZoom}
        onClose={props.onClose}
        actions={[
          <IconButton
            text={Locale.UI.Cancel}
            icon={<CancelIcon />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.UI.Confirm}
            icon={<ConfirmIcon />}
            key="ok"
            onClick={() => {
              const index = prompt.indexOf("--zoom");
              if (index > 0) {
                prompt =
                  prompt.substring(0, index + 6) +
                  " " +
                  zoom +
                  " " +
                  prompt.substring(index + 10);
              } else {
                prompt += " --zoom " + zoom;
              }
              props.doSubmit(props.customId, { prompt, maskBase64: "" });
              props.onClose();
            }}
          />,
        ]}
      >
        <InputNumber
          value={zoom}
          min={1.0}
          max={2.0}
          step={0.1}
          onChange={onValueChange}
          style={{ width: 300 }}
        ></InputNumber>
      </Modal>
    </div>
  );
}

export function MidjourneyActions(props: {
  doSubmit: (action: string) => void;
  message: ChatMessage;
  showCustomZoomModal: (show: boolean) => void;
  showInpaintModal: (show: boolean) => void;
  setCustomId: (customId: string) => void;
  setCurrentMsg: (msg: ChatMessage) => void;
}) {
  let middle = 0;
  let buttons = props.message.attr.buttons || ([] as any[]);
  if (buttons && buttons.length > 0) {
    middle = Math.ceil(buttons.length / 2);
  }
  const taskId = props.message.attr.taskId;

  const doAction = (btn: any) => {
    if (btn.customId.includes("CustomZoom")) {
      props.setCustomId(btn.customId + "##" + taskId);
      props.setCurrentMsg(props.message);
      props.showCustomZoomModal(true);
    } else if (
      btn.customId.includes("Inpaint") &&
      btn.label.includes("Region")
    ) {
      props.setCustomId(btn.customId + "##" + taskId);
      props.setCurrentMsg(props.message);
      props.showInpaintModal(true);
    } else {
      props.doSubmit(btn.customId + "##" + taskId);
    }
  };

  return (
    <>
      {buttons.length > 0 ? (
        <>
          <div className={styles["chat-input-actions-row"]}>
            {buttons.slice(0, middle).map((item: any, index: number) => (
              <ChatAction
                key={index}
                text={item.label}
                icon={item.emoji}
                alwaysDisplayText={!item.emoji && item.label.length < 3}
                onClick={() => doAction(item)}
              />
            ))}
          </div>
          <div className={styles["chat-input-actions-row"]}>
            {buttons.slice(middle).map((item: any, index: number) => (
              <ChatAction
                key={index}
                text={item.label}
                icon={item.emoji}
                alwaysDisplayText={!item.emoji && item.label.length < 3}
                onClick={() => doAction(item)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles["chat-input-actions-row"]}>
            <ChatAction
              text={Locale.Chat.Actions.Upscale + "1"}
              icon={<U2Icon />}
              onClick={() => props.doSubmit("UPSCALE::1::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Upscale + "2"}
              icon={<U2Icon />}
              onClick={() => props.doSubmit("UPSCALE::2::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Upscale + "3"}
              icon={<U3Icon />}
              onClick={() => props.doSubmit("UPSCALE::3::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Upscale + "4"}
              icon={<U4Icon />}
              onClick={() => props.doSubmit("UPSCALE::4::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Retry}
              icon={<ResetIcon />}
              onClick={() => props.doSubmit("REROLL::1::" + taskId)}
            />
          </div>
          <div className={styles["chat-input-actions-row"]}>
            <ChatAction
              text={Locale.Chat.Actions.Variation + "1"}
              icon={<V1Icon />}
              onClick={() => props.doSubmit("VARIATION::1::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Variation + "2"}
              icon={<V2Icon />}
              onClick={() => props.doSubmit("VARIATION::2::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Variation + "3"}
              icon={<V3Icon />}
              onClick={() => props.doSubmit("VARIATION::3::" + taskId)}
            />
            <ChatAction
              text={Locale.Chat.Actions.Variation + "4"}
              icon={<V4Icon />}
              onClick={() => props.doSubmit("VARIATION::4::" + taskId)}
            />
          </div>
        </>
      )}
    </>
  );
}

export function StableDiffusionActions(props: {
  message: ChatMessage;
  showDrawConfigModal: (show: boolean) => void;
  showImgSelectModal: (show: boolean) => void;
  setImgUrlArr: (imgUrlArr: string[]) => void;
  setUploadImages: (uploadImages: UploadFile[]) => void;
}) {
  const drawConfigStore = useDrawConfigStore();

  const copyParamsAndShowModal = (mode: string) => {
    drawConfigStore.update((config: DrawConfig) => {
      config.sd = Object.assign(config.sd, props.message.attr.parameters);
      if (mode == "inpaint") {
        config.sd.api_mode = "img2img";
        config.sd.mode = 2;
      } else {
        config.sd.api_mode = mode;
      }
    });

    const imgUrlArr = getMessageImages(props.message);

    if (imgUrlArr.length == 1 || mode == "extras") {
      const imgFileArr = [] as UploadFile[];
      imgUrlArr.forEach((imgUrl: string, index: number) => {
        let fileName = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
        if (fileName.indexOf("?") > 0) {
          fileName = fileName.split("?")[0];
        }
        const file = {
          uid: index + "",
          name: fileName,
          status: "done",
          url: imgUrl,
        } as UploadFile;
        imgFileArr.push(file);
      });

      props.setUploadImages(imgFileArr);
    }

    if (imgUrlArr.length <= 1 || mode == "extras") {
      props.showDrawConfigModal(true);
    } else {
      props.setImgUrlArr(imgUrlArr);
      props.showImgSelectModal(true);
    }
  };

  return (
    <div className={styles["chat-input-actions-row"]}>
      <ChatAction
        text={Locale.StableDiffusion.Txt2ImgAction}
        icon={<Txt2imgIcon />}
        onClick={() => copyParamsAndShowModal("txt2img")}
      />
      <ChatAction
        text={Locale.StableDiffusion.Img2ImgAction}
        icon={<Img2imgIcon />}
        onClick={() => copyParamsAndShowModal("img2img")}
      />
      <ChatAction
        text={Locale.StableDiffusion.InpaintAction}
        icon={<InpaintIcon />}
        onClick={() => copyParamsAndShowModal("inpaint")}
      />
      <ChatAction
        text={Locale.StableDiffusion.ExtrasAction}
        icon={<ExtrasIcon />}
        onClick={() => copyParamsAndShowModal("extras")}
      />
    </div>
  );
}

export function LumaActions(props: { message: ChatMessage }) {
  return (
    <div className={styles["chat-input-actions-row"]}>
      <ChatAction
        text={Locale.Video.Download}
        icon={<DownloadIcon />}
        onClick={() => {
          const link = document.createElement("a");
          link.download = new Date().getTime() + ".mp4";
          link.href = props.message.attr.download_url_hd
            ? props.message.attr.download_url_hd
            : props.message.attr.download_url;
          link.target = "_blank";
          link.click();
        }}
      />
      {/*<ChatAction*/}
      {/*  text={Locale.Video.Continue}*/}
      {/*  icon={<ContinueIcon />}*/}
      {/*  onClick={() => {}}*/}
      {/*/>*/}
    </div>
  );
}

export function EditMessageModal(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const [messages, setMessages] = useState(session.messages.slice());

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.EditMessage.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            text={Locale.UI.Cancel}
            icon={<CancelIcon />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.UI.Confirm}
            icon={<ConfirmIcon />}
            key="ok"
            onClick={() => {
              chatStore.updateTargetSession(
                session,
                (session) => (session.messages = messages),
              );
              props.onClose();
            }}
          />,
        ]}
      >
        <List>
          <ListItem
            title={Locale.Chat.EditMessage.Topic.Title}
            subTitle={Locale.Chat.EditMessage.Topic.SubTitle}
          >
            <input
              type="text"
              value={session.topic}
              onInput={(e) =>
                chatStore.updateTargetSession(
                  session,
                  (session) => (session.topic = e.currentTarget.value),
                )
              }
            ></input>
          </ListItem>
        </List>
        <ContextPrompts
          context={messages}
          updateContext={(updater) => {
            const newMessages = messages.slice();
            updater(newMessages);
            setMessages(newMessages);
          }}
        />
      </Modal>
    </div>
  );
}

export function DeleteImageButton(props: { deleteImage: () => void }) {
  return (
    <div className={styles["delete-image"]} onClick={props.deleteImage}>
      <DeleteIcon />
    </div>
  );
}

export function ShortcutKeyModal(props: { onClose: () => void }) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcuts = [
    {
      title: Locale.Chat.ShortcutKey.newChat,
      keys: isMac ? ["⌘", "Shift", "O"] : ["Ctrl", "Shift", "O"],
    },
    { title: Locale.Chat.ShortcutKey.focusInput, keys: ["Shift", "Esc"] },
    {
      title: Locale.Chat.ShortcutKey.copyLastCode,
      keys: isMac ? ["⌘", "Shift", ";"] : ["Ctrl", "Shift", ";"],
    },
    {
      title: Locale.Chat.ShortcutKey.copyLastMessage,
      keys: isMac ? ["⌘", "Shift", "C"] : ["Ctrl", "Shift", "C"],
    },
    {
      title: Locale.Chat.ShortcutKey.showShortcutKey,
      keys: isMac ? ["⌘", "/"] : ["Ctrl", "/"],
    },
    {
      title: Locale.Chat.ShortcutKey.clearContext,
      keys: isMac
        ? ["⌘", "Shift", "backspace"]
        : ["Ctrl", "Shift", "backspace"],
    },
  ];
  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.ShortcutKey.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            type="primary"
            text={Locale.UI.Confirm}
            icon={<ConfirmIcon />}
            key="ok"
            onClick={() => {
              props.onClose();
            }}
          />,
        ]}
      >
        <div className={styles["shortcut-key-container"]}>
          <div className={styles["shortcut-key-grid"]}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className={styles["shortcut-key-item"]}>
                <div className={styles["shortcut-key-title"]}>
                  {shortcut.title}
                </div>
                <div className={styles["shortcut-key-keys"]}>
                  {shortcut.keys.map((key, i) => (
                    <div key={i} className={styles["shortcut-key"]}>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ChatContainer() {
  type RenderMessage = ChatMessage & { preview?: boolean };

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const fontSize = config.fontSize;
  const fontFamily = config.fontFamily;
  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  const drawConfig = useDrawConfigStore();

  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = scrollRef?.current
    ? Math.abs(
        scrollRef.current.scrollHeight -
          (scrollRef.current.scrollTop + scrollRef.current.clientHeight),
      ) <= 1
    : false;
  const isAttachWithTop = useMemo(() => {
    const lastMessage = scrollRef.current?.lastElementChild as HTMLElement;
    // if scrolllRef is not ready or no message, return false
    if (!scrollRef?.current || !lastMessage) return false;
    const topDistance =
      lastMessage!.getBoundingClientRect().top -
      scrollRef.current.getBoundingClientRect().top;
    // leave some space for user question
    return topDistance < 100;
  }, [scrollRef?.current?.scrollHeight]);

  const isTyping = userInput !== "";

  // if user is typing, should auto scroll to bottom
  // if user is not typing, should auto scroll to bottom only if already at bottom
  const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(
    scrollRef,
    (isScrolledToBottom || isAttachWithTop) && !isTyping,
    session.messages,
  );
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  const authStore = useAuthStore();

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<RenderPrompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      const matchedPrompts = promptStore.search(text);
      setPromptHints(matchedPrompts);
    },
    100,
    { leading: true, trailing: true },
  );

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  useEffect(() => {
    startTransition(() => {
      setTokenCount(countTokens(userInput));
    });
  }, [userInput]);

  // chat commands shortcuts
  const chatCommands = useChatCommand({
    new: () => chatStore.newSession(),
    newm: () => navigate(Path.NewChat),
    prev: () => chatStore.nextSession(-1),
    next: () => chatStore.nextSession(1),
    clear: () =>
      chatStore.updateTargetSession(
        session,
        (session) => (session.clearContextIndex = session.messages.length),
      ),
    fork: () => chatStore.forkSession(),
    del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
  });

  const [uploadImages, setUploadImages] = useState([] as UploadFile[]);
  const [uploadMaskImages, setUploadMaskImages] = useState([] as UploadFile[]);
  const [uploadFiles, setUploadFiles] = useState([] as UploadFile[]);
  const exAttr = {
    drawConfig,
    setAutoScroll,
    uploadFiles,
    setUploadFiles,
    uploadImages,
    setUploadImages,
    uploadMaskImages,
    setUploadMaskImages,
  };
  const uploadAction = () => {
    document.getElementById("chat-file-select-upload")?.click();
  };

  const getAcceptFileType = (model: string) => {
    if (isMultiModel(model)) {
      return "*";
    } else if (isVisionModel(model)) {
      return ".png, .jpg, .jpeg, .webp, .gif";
    } else if (model.includes("whisper")) {
      return ".flac, .mp3, .mp4, .mpeg, .mpga, .m4a, .ogg, .wav, .webm";
    }
    return "*";
  };

  const uploadFileAction = async (file: File) => {
    showToast(Locale.Chat.InputActions.Uploading);
    const uploadFile = {
      uid: nanoid(),
      name: file.name,
      size: file.size,
      type: file.type,
      originFileObj: file,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      status: "uploading",
      response: {
        fileUrl: "",
      },
    } as UploadFile;

    uploadFiles.push(uploadFile);
    setUploadFiles([...uploadFiles]);
    // 上传文件
    const formData = new FormData();
    formData.append("file", file);
    let fileUrl = await uploadFileToFileServer(formData);
    // 更新文件状态
    const existingFileIndex = uploadFiles.findIndex(
      (f) => f.uid === uploadFile.uid,
    );
    if (existingFileIndex >= 0) {
      uploadFiles.splice(existingFileIndex, 1);
    }
    uploadFile.status = "done";
    uploadFile.response.fileUrl = fileUrl;
    uploadFiles.push(uploadFile);
    setUploadFiles([...uploadFiles]);
    if (fileUrl) {
      showToast(Locale.Chat.InputActions.UploadSuccess);
    } else {
      showToast(Locale.Chat.InputActions.UploadError);
    }
    return "";
  };
  const uploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    event,
  }) => {
    const newList = [] as UploadFile[];
    for (const file of newFileList) {
      if (file.status == "error") {
        file.response = "";
      }
      newList.push(file);
    }
    setUploadFiles(newList);
  };

  const getPlaceHolder = () => {
    if (currentModel == "midjourney" && drawConfig.mj.mode != "IMAGINE") {
      return Locale.Midjourney.InputDisabled;
    } else if (currentModel == "stable-diffusion") {
      Locale.StableDiffusion.InputTips;
    } else if (accessStore.inputPlaceholder) {
      return accessStore.inputPlaceholder;
    }

    return Locale.Chat.Input(submitKey);
  };

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (text.match(ChatCommandPrefix)) {
      setPromptHints(chatCommands.search(text));
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  const doSubmit = (userInput: string, mjEx?: any) => {
    if (currentModel == "midjourney") {
      if (drawConfig.mj.mode == "IMAGINE" && userInput == "") {
        showToast(Locale.Midjourney.NeedInputUseImgPrompt);
        return;
      } else if (
        (drawConfig.mj.mode == "BLEND" ||
          drawConfig.mj.mode == "INSIGHTFACE") &&
        uploadImages.length < 2
      ) {
        showToast(Locale.Midjourney.NeedUploadImg(2));
        return;
      } else if (drawConfig.mj.mode == "DESCRIBE" && uploadImages.length < 1) {
        showToast(Locale.Midjourney.NeedUploadImg(1));
        return;
      }
    } else if (currentModel == "stable-diffusion") {
      if (drawConfig.sd.api_mode != "txt2img" && uploadImages.length < 1) {
        showToast(Locale.StableDiffusion.NeedUploadImg);
        return;
      }
    } else if (currentModel.includes("whisper")) {
      if (uploadFiles.length != 1) {
        showToast(Locale.Chat.InputActions.NeedUpload(1));
        return;
      }
    } else if (userInput.trim() === "") {
      showToast(Locale.Chat.InputActions.InputTips);
      return;
    }
    const matchCommand = chatCommands.match(userInput);
    if (matchCommand.matched) {
      setUserInput("");
      setPromptHints([]);
      matchCommand.invoke();
      return;
    }
    if (currentModel != "midjourney" && currentModel != "stable-diffusion") {
      setIsLoading(true);
    }
    const mjParam = mjEx ? mjEx : {};

    chatStore
      .onUserInput(userInput, {
        ...exAttr,
        tokenCount,
        charCount: userInput.length,
        ...mjParam,
      })
      .then(() => setIsLoading(false));
    chatStore.setLastInput(userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  const onPromptSelect = (prompt: RenderPrompt) => {
    setTimeout(() => {
      setPromptHints([]);

      const matchedChatCommand = chatCommands.match(prompt.content);
      if (matchedChatCommand.matched) {
        // if user is selecting a chat command, just trigger it
        matchedChatCommand.invoke();
        setUserInput("");
      } else {
        // or fill the prompt
        setUserInput(prompt.content);
      }
      inputRef.current?.focus();
    }, 30);
  };

  // stop response
  const onUserStop = (messageId: string) => {
    ChatControllerPool.stop(session.id, messageId);
  };

  useEffect(() => {
    chatStore.updateTargetSession(session, (session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });

      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        console.log("[Mask] syncing from global, name = ", session.mask.name);
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(chatStore.lastInput ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, getMessageTextContent(message))) {
      if (userInput.length === 0) {
        setUserInput(getMessageTextContent(message));
      }

      e.preventDefault();
    }
  };

  const deleteMessage = (msgId?: string) => {
    chatStore.updateTargetSession(
      session,
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
    );
  };

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
  };

  const onResend = (message: ChatMessage) => {
    // when it is resending a message
    // 1. for a user's message, find the next bot response
    // 2. for a bot's message, find the last user's input
    // 3. delete original user input and bot's message
    // 4. resend the user's input
    if (
      message.model == "stable-diffusion" &&
      message.attr?.action != "txt2img"
    ) {
      showToast(Locale.StableDiffusion.ResendTips);
      return;
    }

    const resendingIndex = session.messages.findIndex(
      (m) => m.id === message.id,
    );

    if (resendingIndex < 0 || resendingIndex >= session.messages.length) {
      console.error("[Chat] failed to find resending message", message);
      return;
    }

    let userMessage: ChatMessage | undefined;
    let botMessage: ChatMessage | undefined;

    if (message.role === "assistant") {
      // if it is resending a bot's message, find the user input for it
      botMessage = message;
      for (let i = resendingIndex; i >= 0; i -= 1) {
        if (session.messages[i].role === "user") {
          userMessage = session.messages[i];
          break;
        }
      }
    } else if (message.role === "user") {
      // if it is resending a user's input, find the bot's response
      userMessage = message;
      for (let i = resendingIndex; i < session.messages.length; i += 1) {
        if (session.messages[i].role === "assistant") {
          botMessage = session.messages[i];
          break;
        }
      }
    }

    if (userMessage === undefined) {
      console.error("[Chat] failed to resend", message);
      return;
    }

    // delete the original messages
    deleteMessage(userMessage.id);
    deleteMessage(botMessage?.id);

    // resend the message
    if (currentModel != "midjourney" && currentModel != "stable-diffusion") {
      setIsLoading(true);
    }
    const msgText = getMessageTextContent(userMessage);
    const tokens = countTokens(msgText);
    chatStore
      .onUserInput(userMessage.content, {
        ...exAttr,
        tokenCount: tokens,
        charCount: msgText.length,
        resend: true,
      })
      .then(() => setIsLoading(false));
    inputRef.current?.focus();
  };

  const onPinMessage = (message: ChatMessage) => {
    chatStore.updateTargetSession(session, (session) =>
      session.mask.context.push(message),
    );

    showToast(Locale.Chat.Actions.PinToastContent, {
      text: Locale.Chat.Actions.PinToastAction,
      onClick: () => {
        setShowPromptModal(true);
      },
    });
  };

  const accessStore = useAccessStore();
  const [speechStatus, setSpeechStatus] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);

  async function openaiSpeech(text: string) {
    if (speechStatus) {
      ttsPlayer.stop();
      setSpeechStatus(false);
    } else {
      var api: ClientApi;
      api = new ClientApi(ModelProvider.GPT);
      const config = useAppConfig.getState();
      setSpeechLoading(true);
      ttsPlayer.init();
      let audioBuffer: ArrayBuffer;
      const { markdownToTxt } = require("markdown-to-txt");
      const textContent = markdownToTxt(text);
      if (config.ttsConfig.engine !== DEFAULT_TTS_ENGINE) {
        const edgeVoiceName = accessStore.edgeVoiceName();
        const tts = new MsEdgeTTS();
        await tts.setMetadata(
          edgeVoiceName,
          OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
        );
        audioBuffer = await tts.toArrayBuffer(textContent);
      } else {
        audioBuffer = await api.llm.speech({
          model: config.ttsConfig.model,
          input: textContent,
          voice: config.ttsConfig.voice,
          speed: config.ttsConfig.speed,
        });
      }
      setSpeechStatus(true);
      ttsPlayer
        .play(audioBuffer, () => {
          setSpeechStatus(false);
        })
        .catch((e) => {
          console.error("[OpenAI Speech]", e);
          showToast(prettyObject(e));
          setSpeechStatus(false);
        })
        .finally(() => setSpeechLoading(false));
    }
  }

  const context: RenderMessage[] = useMemo(() => {
    return session.mask.hideContext ? [] : session.mask.context.slice();
  }, [session.mask.context, session.mask.hideContext]);

  if (
    context.length === 0 &&
    accessStore.systemSettings?.systemPrompt &&
    !context.some(
      (msg) =>
        msg.role === "assistant" &&
        msg.content === accessStore.systemSettings.systemPrompt,
    )
  ) {
    const hello = createMessage({
      role: "assistant",
      content: accessStore.systemSettings.systemPrompt as string,
    });
    context.push(hello);
  }

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // preview messages
  const renderMessages = useMemo(() => {
    return (
      context
        .concat(session.messages as RenderMessage[])
        // .concat(
        //   isLoading
        //     ? [
        //         {
        //           ...createMessage({
        //             role: "assistant",
        //             content: "……",
        //           }),
        //           preview: true,
        //         },
        //       ]
        //     : [],
        // )
        .concat(
          userInput.length > 0 && config.sendPreviewBubble
            ? [
                {
                  ...createMessage({
                    role: "user",
                    content: userInput,
                  }),
                  preview: true,
                },
              ]
            : [],
        )
    );
  }, [
    config.sendPreviewBubble,
    context,
    isLoading,
    session.messages,
    userInput,
  ]);

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );

  function setMsgRenderIndex(newIndex: number) {
    newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
    newIndex = Math.max(0, newIndex);
    _setMsgRenderIndex(newIndex);
  }

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom =
      bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex(nextPageMsgIndex);
    }

    setHitBottom(isHitBottom);
    setAutoScroll(isHitBottom);
  };

  function scrollToBottom() {
    setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
    scrollDomToBottom();
  }

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length - msgRenderIndex
      : -1;

  const [showPromptModal, setShowPromptModal] = useState(false);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  const [showDrawConfigModal, setShowDrawConfigModal] = useState(false);
  const [showImgSelectModal, setShowImgSelectModal] = useState(false);
  const [imgUrlArr, setImgUrlArr] = useState([] as string[]);
  const [showLoading, setShowLoading] = useState(false);

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
    code: (text) => {
      if (accessStore.disableFastLink) return;
      console.log("[Command] got code from url: ", text);
      showConfirm(Locale.URLCommand.Code + `code = ${text}`).then((res) => {
        if (res) {
          accessStore.update((access) => (access.accessCode = text));
        }
      });
    },
    settings: (text) => {
      if (accessStore.disableFastLink) return;

      try {
        const payload = JSON.parse(text) as {
          key?: string;
          url?: string;
          customModels?: string;
          replaceCurrentModel?: boolean;
          mjUrl?: string;
          mjKey?: string;
        };

        console.log("[Command] got settings from url: ", payload);

        if (
          payload.key ||
          payload.url ||
          payload.customModels ||
          payload.mjUrl
        ) {
          showConfirm(
            Locale.URLCommand.Settings +
              `\n${JSON.stringify(payload, null, 4)}`,
          ).then((res) => {
            if (!res) return;
            if (payload.key) {
              accessStore.update(
                (access) => (access.openaiApiKey = payload.key!),
              );
            }
            if (payload.url) {
              accessStore.update((access) => (access.openaiUrl = payload.url!));
            }
            accessStore.update((access) => (access.useCustomConfig = true));
            if (payload.customModels) {
              accessStore.update((access) => {
                if (access.customModels) {
                  let models = access.customModels.split(",");
                  let addModels = payload.customModels?.split(",") as string[];
                  models = models.concat(addModels);
                  let modelSet = new Set(models);
                  models = Array.from(modelSet);
                  access.customModels = models.join(",");
                } else {
                  access.customModels = payload.customModels!;
                }
              });
            }
            if (payload.replaceCurrentModel && payload.customModels) {
              const models = payload.customModels.split(",");
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.model = models[0] as ModelType;
                session.mask.syncGlobalConfig = false;
              });
            }
            if (payload.mjUrl) {
              accessStore.updateMidjourneyProxyUrl(payload.mjUrl);
            }
            if (payload.mjKey) {
              accessStore.updateMidjourneyProxySecret(payload.mjKey);
            }
          });
        }
      } catch {
        console.error("[Command] failed to get settings from url: ", text);
      }
    },
  });

  // edit / insert message modal
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  messages?.forEach((msg) => {
    if (msg.model === "midjourney" && msg.attr.taskId && !msg.attr.finished) {
      chatStore.fetchMidjourneyStatus(msg, {
        setAutoScroll,
        sessionId: session.id,
        prompt: getMessageTextContent(msg),
      });
    } else if (
      msg.model?.startsWith("luma") &&
      msg.attr.taskId &&
      !msg.attr.finished
    ) {
      chatStore.fetchLumaTasks(msg, { setAutoScroll });
    }
  });

  // remember unfinished input
  useEffect(() => {
    // try to load from local storage
    const key = UNFINISHED_INPUT(session.id);
    const mayBeUnfinishedInput = localStorage.getItem(key);
    if (mayBeUnfinishedInput && userInput.length === 0) {
      setUserInput(mayBeUnfinishedInput);
      localStorage.removeItem(key);
    }

    const dom = inputRef.current;
    return () => {
      localStorage.setItem(key, dom?.value ?? "");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = (event.clipboardData || window?.clipboardData).items;
      for (const item of Array.from(items)) {
        if (item.kind != "file") return;
        const file = item.getAsFile() as File;
        const fileType = file.name.substring(file.name.lastIndexOf(".") + 1);
        const acceptFileType = getAcceptFileType(currentModel);
        if (!acceptFileType) {
          showToast(Locale.Chat.InputActions.UploadPermision);
          return;
        }
        if (acceptFileType != "*" && !acceptFileType.includes(fileType)) {
          showToast(Locale.Chat.InputActions.UploadType(acceptFileType));
          return;
        }
        await uploadFileAction(file);
      }
    },
    [uploadFiles, chatStore],
  );

  const { speak, speaking, cancel, voices } = useSpeechSynthesis();
  const speakContent = (content: any) => {
    let text = content;
    if (typeof content != "string") {
      text = "";
      content.forEach((msg: any) => {
        if (msg.type == "text") {
          text += msg.text + "\n";
        }
      });
    }
    if (text) {
      const voice = voices.filter((v: any) => v.name == config.tts.voice)[0];
      speak({ text: text, voice });
    }
  };

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime,
  } = useAudioRecorder();

  useEffect(() => {
    if (!recordingBlob) return;
    const fileName =
      nanoid() + "." + recordingBlob.type.split(";")[0].split("/")[1];
    const file = new File([recordingBlob], fileName);
    const formData = new FormData();
    formData.append("file", file);

    setShowLoading(true);

    // 语音文件上传到oss
    // fileUploadFromBrowser(formData)
    //   .then((fileUrl) => {
    //     const uploadFile = {
    //       uid: nanoid(),
    //       name: file.name,
    //       size: file.size,
    //       type: recordingBlob.type,
    //       originFileObj: file,
    //       lastModified: file.lastModified,
    //       lastModifiedDate: new Date(file.lastModified),
    //       status: "done",
    //       response: {
    //         fileUrl: fileUrl,
    //       },
    //     } as UploadFile;
    //     uploadFiles.push(uploadFile);
    //     setUploadFiles([...uploadFiles]);
    //   });

    // 发送到openai进行语音转文字
    formData.append("model", "whisper-1");
    const api = new ClientApi(ModelProvider.GPT);
    api.llm
      .audioTranscriptions(formData)
      .then((res) => res.json())
      .then((res) => {
        if (res.text) {
          setUserInput(res.text);
        } else {
          showToast(Locale.Chat.Speech.ToTextError);
        }
      })
      .finally(() => setShowLoading(false));
  }, [recordingBlob]);

  // 快捷键 shortcut keys
  const [showShortcutKeyModal, setShowShortcutKeyModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 打开新聊天 command + shift + o
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "o"
      ) {
        event.preventDefault();
        setTimeout(() => {
          chatStore.newSession();
          navigate(Path.Chat);
        }, 10);
      }
      // 聚焦聊天输入 shift + esc
      else if (event.shiftKey && event.key.toLowerCase() === "escape") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      // 复制最后一个代码块 command + shift + ;
      else if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.code === "Semicolon"
      ) {
        event.preventDefault();
        const copyCodeButton =
          document.querySelectorAll<HTMLElement>(".copy-code-button");
        if (copyCodeButton.length > 0) {
          copyCodeButton[copyCodeButton.length - 1].click();
        }
      }
      // 复制最后一个回复 command + shift + c
      else if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();
        const lastNonUserMessage = messages
          .filter((message) => message.role !== "user")
          .pop();
        if (lastNonUserMessage) {
          const lastMessageContent = getMessageTextContent(lastNonUserMessage);
          copyToClipboard(lastMessageContent);
        }
      }
      // 展示快捷键 command + /
      else if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setShowShortcutKeyModal(true);
      }
      // 清除上下文 command + shift + backspace
      else if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "backspace"
      ) {
        event.preventDefault();
        chatStore.updateTargetSession(session, (session) => {
          if (session.clearContextIndex === session.messages.length) {
            session.clearContextIndex = undefined;
          } else {
            session.clearContextIndex = session.messages.length;
            session.memoryPrompt = ""; // will clear memory
          }
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [messages, chatStore, navigate, session]);

  const [showChatSidePanel, setShowChatSidePanel] = useState(false);

  const [customZoomModal, setCustomZoomModal] = useState(false);
  const [inpaintModal, setInpaintModal] = useState(false);
  const [customId, setCustomId] = useState("");
  const [currentMsg, setCurrentMsg] = useState<ChatMessage>({} as ChatMessage);

  return (
    <>
      <div className={styles.chat} key={session.id}>
        <div className="window-header" data-tauri-drag-region>
          {isMobileScreen && (
            <div className="window-actions">
              <div className={"window-action-button"}>
                <IconButton
                  icon={<ReturnIcon />}
                  bordered
                  title={Locale.Chat.Actions.ChatList}
                  onClick={() => navigate(Path.Home)}
                />
              </div>
            </div>
          )}

          <div
            className={clsx("window-header-title", styles["chat-body-title"])}
          >
            <div
              className={clsx(
                "window-header-main-title",
                styles["chat-body-main-title"],
              )}
              onClickCapture={() => setIsEditingMessage(true)}
            >
              {!session.topic ? DEFAULT_TOPIC : session.topic}
            </div>
            <div className="window-header-sub-title">
              {Locale.Chat.SubTitle(session.messages.length)}
            </div>
          </div>
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<ReloadIcon />}
                bordered
                title={Locale.Chat.Actions.RefreshTitle}
                onClick={() => {
                  showToast(Locale.Chat.Actions.RefreshToast);
                  chatStore.summarizeSession(true, session);
                }}
              />
            </div>
            {!isMobileScreen && (
              <div className="window-action-button">
                <IconButton
                  icon={<RenameIcon />}
                  bordered
                  title={Locale.Chat.EditMessage.Title}
                  aria={Locale.Chat.EditMessage.Title}
                  onClick={() => setIsEditingMessage(true)}
                />
              </div>
            )}
            <div className="window-action-button">
              <IconButton
                icon={<ExportIcon />}
                bordered
                title={Locale.Chat.Actions.Export}
                onClick={() => {
                  setShowExport(true);
                }}
              />
            </div>
            {showMaxIcon && (
              <div className="window-action-button">
                <IconButton
                  icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                  bordered
                  title={Locale.Chat.Actions.FullScreen}
                  aria={Locale.Chat.Actions.FullScreen}
                  onClick={() => {
                    config.update(
                      (config) => (config.tightBorder = !config.tightBorder),
                    );
                  }}
                />
              </div>
            )}
          </div>

          <PromptToast
            showToast={!hitBottom}
            showModal={showPromptModal}
            setShowModal={setShowPromptModal}
          />
        </div>
        <div className={styles["chat-main"]}>
          <div className={styles["chat-body-container"]}>
            <div
              className={styles["chat-body"]}
              ref={scrollRef}
              onScroll={(e) => onChatBodyScroll(e.currentTarget)}
              onMouseDown={() => inputRef.current?.blur()}
              onTouchStart={() => {
                inputRef.current?.blur();
                setAutoScroll(false);
              }}
            >
              {messages
                // TODO
                // .filter((m) => !m.isMcpResponse)
                .map((message, i) => {
                  const isUser = message.role === "user";
                  const isContext = i < context.length;
                  const showActions =
                    i > 0 &&
                    !(message.preview || message.content.length === 0) &&
                    !isContext;
                  const showTyping = message.preview || message.streaming;

                  const shouldShowClearContextDivider =
                    i === clearContextIndex - 1;

                  let showCommonActions =
                    message.content != Locale.Chat.Processing;
                  // if (
                  //   !isUser &&
                  //   (message.model == "midjourney" ||
                  //     message.model == "stable-diffussion")
                  // ) {
                  //   showCommonActions = false;
                  // }

                  return (
                    <Fragment key={message.id}>
                      <div
                        className={
                          isUser
                            ? styles["chat-message-user"]
                            : [
                                styles["chat-message"],
                                message.model == "midjourney"
                                  ? styles["chat-model-mj"]
                                  : "",
                              ].join(" ")
                        }
                      >
                        <div className={styles["chat-message-container"]}>
                          <div className={styles["chat-message-header"]}>
                            <div
                              className={
                                styles["chat-message-header-avatar-date"]
                              }
                            >
                              {isUser && showTyping && (
                                <div className={styles["chat-message-status"]}>
                                  {Locale.Chat.Typing}
                                </div>
                              )}
                              {isUser && !showTyping && (
                                <div
                                  className={
                                    styles["chat-message-action-name-date"]
                                  }
                                >
                                  <div
                                    className={
                                      styles["chat-message-action-name"]
                                    }
                                  >
                                    {config.nickname}
                                  </div>
                                  <div
                                    className={
                                      styles["chat-message-action-date"]
                                    }
                                  >
                                    {isContext
                                      ? Locale.Chat.IsContext
                                      : message.date.toLocaleString()}
                                  </div>
                                </div>
                              )}
                              <div className={styles["chat-message-avatar"]}>
                                <div className={styles["chat-message-edit"]}>
                                  <IconButton
                                    icon={<EditIcon />}
                                    aria={Locale.Chat.Actions.Edit}
                                    onClick={async () => {
                                      const newMessage = await showPrompt(
                                        Locale.Chat.Actions.Edit,
                                        getMessageTextContent(message),
                                        10,
                                      );
                                      chatStore.updateTargetSession(
                                        session,
                                        (session) => {
                                          const m = session.mask.context
                                            .concat(session.messages)
                                            .find((m) => m.id === message.id);
                                          if (m) {
                                            if (m.content instanceof Array) {
                                              const newContent =
                                                [] as MultimodalContent[];
                                              newContent.push({
                                                type: "text",
                                                text: newMessage,
                                              });
                                              m.content.forEach((item) => {
                                                if (item.type != "text") {
                                                  newContent.push(item);
                                                }
                                              });
                                              m.content = newContent;
                                            } else {
                                              m.content = newMessage;
                                            }
                                          }
                                        },
                                      );
                                    }}
                                  ></IconButton>
                                </div>
                                {isUser ? (
                                  <Avatar avatar={config.avatar} />
                                ) : (
                                  <>
                                    {["system"].includes(message.role) ? (
                                      <Avatar avatar="2699-fe0f" />
                                    ) : (
                                      <MaskAvatar
                                        avatar={session.mask.avatar}
                                        model={
                                          message.model ||
                                          session.mask.modelConfig.model
                                        }
                                        modelAvatar={message.avatar}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {!isUser && !showTyping && (
                              <div
                                className={
                                  styles["chat-message-action-name-date"]
                                }
                              >
                                <div
                                  className={styles["chat-message-action-name"]}
                                >
                                  {message.displayName
                                    ? message.displayName
                                    : message.model}
                                </div>
                                <div
                                  className={styles["chat-message-action-date"]}
                                >
                                  {isContext
                                    ? Locale.Chat.IsContext
                                    : message.date.toLocaleString()}
                                </div>
                              </div>
                            )}
                            {showCommonActions && (
                              <div className={styles["chat-message-actions-h"]}>
                                <div className={styles["chat-input-actions"]}>
                                  {message.streaming ? (
                                    <ChatAction
                                      text={Locale.Chat.Actions.Stop}
                                      icon={<StopIcon />}
                                      onClick={() =>
                                        onUserStop(message.id ?? i)
                                      }
                                    />
                                  ) : (
                                    <>
                                      <ChatAction
                                        text={Locale.Chat.Actions.Retry}
                                        icon={<ResetIcon />}
                                        onClick={() => onResend(message)}
                                      />

                                      <ChatAction
                                        text={Locale.Chat.Actions.Delete}
                                        icon={<DeleteIcon />}
                                        onClick={() =>
                                          onDelete(message.id ?? i)
                                        }
                                      />

                                      <ChatAction
                                        text={Locale.Chat.Actions.Pin}
                                        icon={<PinIcon />}
                                        onClick={() => onPinMessage(message)}
                                      />
                                      <ChatAction
                                        text={Locale.Chat.Actions.Copy}
                                        icon={<CopyIcon />}
                                        onClick={() =>
                                          copyToClipboard(
                                            getMessageTextContent(message),
                                          )
                                        }
                                      />
                                      {config.ttsConfig.enable && (
                                        <ChatAction
                                          text={
                                            speechStatus
                                              ? Locale.Chat.Actions.StopSpeech
                                              : Locale.Chat.Actions.Speech
                                          }
                                          icon={
                                            speechStatus ? (
                                              <StopIcon />
                                            ) : (
                                              <SpeekIcon />
                                            )
                                          }
                                          onClick={() =>
                                            openaiSpeech(
                                              getMessageTextContent(message),
                                            )
                                          }
                                        />
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {message?.tools?.length == 0 && showTyping && (
                            <div className={styles["chat-message-status"]}>
                              {Locale.Chat.Typing}
                            </div>
                          )}
                          {/*@ts-ignore*/}
                          {message?.tools?.length > 0 && (
                            <div className={styles["chat-message-tools"]}>
                              {message?.tools?.map((tool) => (
                                <div
                                  key={tool.id}
                                  title={tool?.errorMsg}
                                  className={styles["chat-message-tool"]}
                                >
                                  {tool.isError === false ? (
                                    <ConfirmIcon />
                                  ) : tool.isError === true ? (
                                    <CloseIcon />
                                  ) : (
                                    <LoadingButtonIcon />
                                  )}
                                  <span>{tool?.function?.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className={styles["chat-message-item"]}>
                            <Markdown
                              key={message.streaming ? "loading" : "done"}
                              content={getMessageTextContent(message)}
                              loading={
                                (message.preview || message.streaming) &&
                                message.content.length === 0 &&
                                !isUser
                              }
                              onContextMenu={(e) => onRightClick(e, message)}
                              onDoubleClickCapture={() => {
                                if (!isMobileScreen) return;
                                setUserInput(getMessageTextContent(message));
                              }}
                              fontSize={fontSize}
                              fontFamily={fontFamily}
                              parentRef={scrollRef}
                              defaultShow={i >= messages.length - 10}
                            />
                            <ChatMessageMedias message={message} />
                          </div>
                          {message?.audio_url && (
                            <div className={styles["chat-message-audio"]}>
                              <audio src={message.audio_url} controls />
                            </div>
                          )}

                          {showActions &&
                            (message.model == "midjourney" ||
                              message.model == "stable-diffusion" ||
                              message.model == "luma" ||
                              message.model?.includes("gpt-image")) && (
                              <div
                                className={[
                                  styles["chat-message-actions"],
                                  isUser
                                    ? styles["chat-message-actions-user"]
                                    : "",
                                  message.attr?.finished &&
                                  message.attr?.status == "SUCCESS" &&
                                  ([
                                    "VARIATION",
                                    "IMAGINE",
                                    "BLEND",
                                    "ACTION",
                                    "INSIGHTFACE",
                                  ].includes(message.attr?.action) ||
                                    message.model?.startsWith("luma"))
                                    ? styles["chat-message-actions-mj"]
                                    : "",
                                  message.attr?.finished &&
                                  message.attr?.status == "SUCCESS" &&
                                  [
                                    "txt2img",
                                    "img2img",
                                    "extras",
                                    "pngInfo",
                                  ].includes(message.attr?.action)
                                    ? styles["chat-message-actions-sd"]
                                    : "",
                                ].join(" ")}
                              >
                                <div
                                  className={styles["chat-input-actions"]}
                                  style={{
                                    marginTop: 10,
                                    marginBottom: 0,
                                  }}
                                >
                                  {/* midjourney 操作按钮*/}
                                  {message.model == "midjourney" &&
                                    message.attr?.finished &&
                                    message.attr?.status == "SUCCESS" &&
                                    [
                                      "VARIATION",
                                      "IMAGINE",
                                      "BLEND",
                                      "ACTION",
                                      "INSIGHTFACE",
                                    ].includes(message.attr?.action) && (
                                      <MidjourneyActions
                                        doSubmit={doSubmit}
                                        message={message}
                                        showCustomZoomModal={setCustomZoomModal}
                                        showInpaintModal={setInpaintModal}
                                        setCustomId={setCustomId}
                                        setCurrentMsg={setCurrentMsg}
                                      />
                                    )}

                                  {/* stable-diffusion 操作按钮 */}
                                  {message.model == "stable-diffusion" &&
                                    message.attr?.finished &&
                                    message.attr?.status == "SUCCESS" && (
                                      <StableDiffusionActions
                                        message={message}
                                        showDrawConfigModal={
                                          setShowDrawConfigModal
                                        }
                                        showImgSelectModal={
                                          setShowImgSelectModal
                                        }
                                        setImgUrlArr={setImgUrlArr}
                                        setUploadImages={setUploadImages}
                                      />
                                    )}

                                  {/* luma 操作按钮 */}
                                  {message.model?.startsWith("luma") &&
                                    message.attr?.finished &&
                                    message.attr?.status == "SUCCESS" && (
                                      <LumaActions message={message} />
                                    )}

                                  {/* gpt-image 重绘按钮*/}
                                  {message.model?.includes("gpt-image") &&
                                    message.attr?.finished &&
                                    message.attr?.status == "SUCCESS" && (
                                      <ChatAction
                                        text={"Vary Region"}
                                        icon={<span>🖌️</span>}
                                        onClick={() => {
                                          setInpaintModal(true);
                                          setCurrentMsg(message);
                                          setCustomId("gpt-image");
                                        }}
                                      />
                                    )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                      {shouldShowClearContextDivider && <ClearContextDivider />}
                    </Fragment>
                  );
                })}
            </div>

            <div className={styles["chat-input-panel"]}>
              <PromptHints
                prompts={promptHints}
                onPromptSelect={onPromptSelect}
              />

              <ChatActions
                showPromptModal={() => setShowPromptModal(true)}
                scrollToBottom={scrollToBottom}
                hitBottom={hitBottom}
                showPromptHints={() => {
                  // Click again to close
                  if (promptHints.length > 0) {
                    setPromptHints([]);
                    return;
                  }
                  inputRef.current?.focus();
                  setUserInput("/");
                  onSearch("");
                }}
                setShowShortcutKeyModal={setShowShortcutKeyModal}
                setUserInput={setUserInput}
                setShowChatSidePanel={setShowChatSidePanel}
                translate={() =>
                  chatStore.translate(userInput, setUserInput, setShowLoading)
                }
                upload={uploadAction}
                uploadImages={uploadImages}
                setUploadImages={setUploadImages}
                uploadMaskImages={uploadMaskImages}
                setUploadMaskImages={setUploadMaskImages}
                tokens={tokenCount}
              />
              <Upload
                action={uploadFileAction}
                accept={getAcceptFileType(currentModel)}
                listType="picture"
                fileList={uploadFiles}
                className="chat-upload-list"
                multiple
              >
                <Button
                  id="chat-file-select-upload"
                  style={{ display: "none" }}
                />
              </Upload>
              <div className={styles["chat-input-panel-inner"]}>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  className={styles["chat-input"]}
                  placeholder={getPlaceHolder()}
                  onInput={(e) => onInput(e.currentTarget.value)}
                  value={userInput}
                  onKeyDown={onInputKeyDown}
                  onFocus={scrollToBottom}
                  onClick={scrollToBottom}
                  onPaste={handlePaste}
                  rows={inputRows}
                  autoFocus={autoFocus}
                  style={{
                    fontSize: config.fontSize,
                    fontFamily: config.fontFamily,
                  }}
                  disabled={
                    currentModel == "midjourney" &&
                    drawConfig.mj.mode != "IMAGINE"
                  }
                />
                <div>
                  <div
                    className={styles["chat-input-token"]}
                    style={{ display: "none" }}
                  >
                    <span>({tokenCount})</span>
                    <TokenIcon />
                  </div>
                  <div>
                    {accessStore.hideVoiceInput != "1" && (
                      <Tooltip
                        title={
                          Locale.Chat.Speech.Recording + recordingTime + "s"
                        }
                        trigger={"click"}
                        color={"gold"}
                      >
                        <IconButton
                          icon={isRecording ? <StopIcon /> : <RecorderIcon />}
                          className={styles["chat-voice-input"]}
                          onClick={() => {
                            isRecording ? stopRecording() : startRecording();
                          }}
                        />
                      </Tooltip>
                    )}
                    <IconButton
                      icon={<SendWhiteIcon />}
                      text={Locale.Chat.Send}
                      className={styles["chat-input-send"]}
                      type="primary"
                      onClick={() => doSubmit(userInput)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={clsx(styles["chat-side-panel"], {
              [styles["mobile"]]: isMobileScreen,
              [styles["chat-side-panel-show"]]: showChatSidePanel,
            })}
          >
            {showChatSidePanel && (
              <RealtimeChat
                onClose={() => {
                  setShowChatSidePanel(false);
                }}
                onStartVoice={async () => {
                  console.log("start voice");
                }}
              />
            )}
          </div>
        </div>
      </div>
      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}

      {isEditingMessage && (
        <EditMessageModal
          onClose={() => {
            setIsEditingMessage(false);
          }}
        />
      )}

      {showShortcutKeyModal && (
        <ShortcutKeyModal onClose={() => setShowShortcutKeyModal(false)} />
      )}

      {showDrawConfigModal && (
        <StableDiffusionConfigModal
          uploadImages={uploadImages}
          setUploadImages={setUploadImages}
          uploadMaskImages={uploadMaskImages}
          setUploadMaskImages={setUploadMaskImages}
          onClose={() => setShowDrawConfigModal(false)}
        />
      )}

      {showImgSelectModal && (
        <ImageSelect
          imgUrlArr={imgUrlArr}
          setShowDrawConfigModal={setShowDrawConfigModal}
          setUploadImages={setUploadImages}
          onClose={() => setShowImgSelectModal(false)}
        />
      )}

      {customZoomModal && (
        <CustomZoomModal
          message={currentMsg}
          customId={customId}
          doSubmit={doSubmit}
          onClose={() => setCustomZoomModal(false)}
        />
      )}

      {inpaintModal && (
        <InpaintModal
          message={currentMsg}
          customId={customId}
          doSubmit={doSubmit}
          onClose={() => setInpaintModal(false)}
        />
      )}

      {showLoading && <ShowLoading tip={Locale.Chat.InputActions.Waiting} />}
    </>
  );
}

export function Chat() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  return <ChatContainer key={session.id}></ChatContainer>;
}
