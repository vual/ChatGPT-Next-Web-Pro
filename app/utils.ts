import { useEffect, useState } from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";
import { RequestMessage } from "./client/api";
import {
  REQUEST_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS_FOR_THINKING,
  ServiceProvider,
} from "./constant";
// import { fetch as tauriFetch, ResponseType } from "@tauri-apps/api/http";
import { fetch as tauriStreamFetch } from "./utils/stream";
import { VISION_MODEL_REGEXES, EXCLUDE_VISION_MODEL_REGEXES } from "./constant";
import { useAccessStore } from "./store";
import { ModelSize } from "./typing";
import { encode } from "gpt-tokenizer";
import { RcFile } from "antd/es/upload/interface";
import { ChatMessage } from "@/app/store";

export function trimTopic(topic: string) {
  // Fix an issue where double quotes still show in the Indonesian language
  // This will remove the specified punctuation from the end of the string
  // and also trim quotes from both the start and end if they exist.
  return (
    topic
      // fix for gemini
      .replace(/^["“”*]+|["“”*]+$/g, "")
      .replace(/[，。！？”“"、,.!?*]*$/, "")
  );
}

export async function copyToClipboard(text: string) {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }

    showToast(Locale.Copy.Success);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export async function downloadAs(text: string, filename: string) {
  if (window.__TAURI__) {
    const result = await window.__TAURI__.dialog.save({
      defaultPath: `${filename}`,
      filters: [
        {
          name: `${filename.split(".").pop()} files`,
          extensions: [`${filename.split(".").pop()}`],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (result !== null) {
      try {
        await window.__TAURI__.fs.writeTextFile(result, text);
        showToast(Locale.Download.Success);
      } catch (error) {
        showToast(Locale.Download.Failed);
      }
    } else {
      showToast(Locale.Download.Failed);
    }
  } else {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

export async function compressBase64Image(imgBase64: string) {
  let result = "";
  const MAX_SIZE = 100 * 1024; // 100kb
  const promise: Promise<string> = new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imgBase64;
    image.onload = () => {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let width = image.width;
      let height = image.height;
      let quality = 0.9;
      let dataUrl;

      do {
        canvas.width = width;
        canvas.height = height;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(image, 0, 0, width, height);
        dataUrl = canvas.toDataURL("image/jpeg", quality);

        if (dataUrl.length < MAX_SIZE) break;

        if (quality > 0.5) {
          // Prioritize quality reduction
          quality -= 0.1;
        } else {
          // Then reduce the size
          width *= 0.9;
          height *= 0.9;
        }
      } while (dataUrl.length > MAX_SIZE);

      resolve(dataUrl);
    };
    image.onerror = () => reject("");
  });

  await promise.then((res: string) => {
    result = res;
  });

  return result;
}

export function readFromFile() {
  return new Promise<string>((res, rej) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        res(e.target.result);
      };
      fileReader.onerror = (e) => rej(e);
      fileReader.readAsText(file);
    };

    fileInput.click();
  });
}

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

export const MOBILE_MAX_WIDTH = 600;
export function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}

export function isFirefox() {
  return (
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)
  );
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom);
  const paddingWidth =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);

  if (!dom) {
    dom = document.createElement("span");
    dom.style.position = "absolute";
    dom.style.wordBreak = "break-word";
    dom.style.fontSize = "14px";
    dom.style.transform = "translateY(-200vh)";
    dom.style.pointerEvents = "none";
    dom.style.opacity = "0";
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }

  return dom!;
}

export function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom("__measure");
  const singleLineDom = getOrCreateMeasureDom("__single_measure", (dom) => {
    dom.innerText = "TEXT_FOR_MEASURE";
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + "px";
  measureDom.innerText = dom.value !== "" ? dom.value : "1";
  measureDom.style.fontSize = dom.style.fontSize;
  measureDom.style.fontFamily = dom.style.fontFamily;
  const endWithEmptyLine = dom.value.endsWith("\n");
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height,
  );

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

/**
 * Detects Macintosh
 */
export function isMacOS(): boolean {
  if (typeof window !== "undefined") {
    let userAgent = window.navigator.userAgent.toLocaleLowerCase();
    const macintosh = /iphone|ipad|ipod|macintosh/.test(userAgent);
    return !!macintosh;
  }
  return false;
}

export function getMessageTextContent(message: RequestMessage) {
  if (typeof message.content === "string") {
    return message.content;
  }
  let text = "";
  for (const c of message.content) {
    if (c.type === "text") {
      text += c.text + "\n";
    }
  }
  return text;
}

export function getMessageTextContentWithoutThinking(message: RequestMessage) {
  let content = "";

  if (typeof message.content === "string") {
    content = message.content;
  } else {
    for (const c of message.content) {
      if (c.type === "text") {
        content = c.text ?? "";
        break;
      }
    }
  }

  // Filter out thinking lines (starting with "> ")
  return content
    .split("\n")
    .filter((line) => !line.startsWith("> ") && line.trim() !== "")
    .join("\n")
    .trim();
}

export function getMessageImages(message: RequestMessage): string[] {
  if (typeof message.content === "string") {
    return [];
  }
  const urls: string[] = [];
  for (const c of message.content) {
    if (c.type === "image_url") {
      urls.push(c.image_url?.url ?? "");
    } else if (c.type === "file" && c.file?.type.includes("image")) {
      urls.push(c.file?.url);
    }
  }
  return urls;
}

export function getMessageFiles(message: RequestMessage) {
  if (typeof message.content === "string") {
    return [];
  }
  const files = [];
  for (const c of message.content) {
    if (c.type === "file") {
      files.push(c.file);
    }
  }
  return files;
}

export function getMessageMedias(message: ChatMessage) {
  const images = [] as string[];
  const audios = [] as string[];
  const videos = [] as string[];
  const files = [] as any[];
  if (typeof message.content === "string") {
    // 返回的内容有超链
    if (!message.streaming) {
      const lines = message.content.split("\n");
      for (const line of lines) {
        if (line.includes("http")) {
          let fileUrl = line.substring(line.indexOf("http"));
          fileUrl = fileUrl.substring(0, fileUrl.lastIndexOf(".mp") + 4);
          if (fileUrl.endsWith("mp3") && !audios.includes(fileUrl)) {
            audios.push(fileUrl);
          } else if (fileUrl.endsWith("mp4") && !videos.includes(fileUrl)) {
            videos.push(fileUrl);
          }
        }
      }
    }
    return { images, audios, videos, files };
  }
  for (const c of message.content) {
    if (c.type === "image_url" && c.image_url && c.image_url.url) {
      images.push(c.image_url.url);
    } else if (
      c.type === "file" &&
      c.file?.type.includes("image") &&
      c.file.url
    ) {
      images.push(c.file.url);
    } else if (
      c.type === "file" &&
      c.file?.type.includes("audio") &&
      c.file.url
    ) {
      audios.push(c.file.url);
    } else if (
      c.type === "file" &&
      c.file?.type.includes("video") &&
      c.file.url
    ) {
      videos.push(c.file.url);
    } else if (c.type === "file") {
      files.push(c.file);
    }
  }
  return { images, audios, videos, files };
}

export function isVisionModel(model: string) {
  const visionModels = useAccessStore.getState().visionModels;
  const envVisionModels = visionModels?.split(",").map((m) => m.trim());
  if (envVisionModels?.includes(model)) {
    return true;
  }
  return (
    !EXCLUDE_VISION_MODEL_REGEXES.some((regex) => regex.test(model)) &&
    VISION_MODEL_REGEXES.some((regex) => regex.test(model))
  );
}

export function isDalle3(model: string) {
  return "dall-e-3" === model;
}

export function getTimeoutMSByModel(model: string) {
  model = model.toLowerCase();
  if (
    model.startsWith("dall-e") ||
    model.startsWith("dalle") ||
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.includes("deepseek-r") ||
    model.includes("-thinking")
  )
    return REQUEST_TIMEOUT_MS_FOR_THINKING;
  return REQUEST_TIMEOUT_MS;
}

export function getModelSizes(model: string): ModelSize[] {
  if (isDalle3(model)) {
    return ["1024x1024", "1792x1024", "1024x1792"];
  }
  if (model.toLowerCase().includes("cogview")) {
    return [
      "1024x1024",
      "768x1344",
      "864x1152",
      "1344x768",
      "1152x864",
      "1440x720",
      "720x1440",
    ];
  }
  return [];
}

export function supportsCustomSize(model: string): boolean {
  return getModelSizes(model).length > 0;
}

export function showPlugins(provider: ServiceProvider, model: string) {
  if (
    provider == ServiceProvider.OpenAI ||
    provider == ServiceProvider.Azure ||
    provider == ServiceProvider.Moonshot ||
    provider == ServiceProvider.ChatGLM
  ) {
    return true;
  }
  if (provider == ServiceProvider.Anthropic && !model.includes("claude-2")) {
    return true;
  }
  if (provider == ServiceProvider.Google && !model.includes("vision")) {
    return true;
  }
  return false;
}

export function fetch(
  url: string,
  options?: Record<string, unknown>,
): Promise<any> {
  if (window.__TAURI__) {
    return tauriStreamFetch(url, options);
  }
  return window.fetch(url, options);
}

export function adapter(config: Record<string, unknown>) {
  const { baseURL, url, params, data: body, ...rest } = config;
  const path = baseURL ? `${baseURL}${url}` : url;
  const fetchUrl = params
    ? `${path}?${new URLSearchParams(params as any).toString()}`
    : path;
  return fetch(fetchUrl as string, { ...rest, body }).then((res) => {
    const { status, headers, statusText } = res;
    return res
      .text()
      .then((data: string) => ({ status, statusText, headers, data }));
  });
}

export function safeLocalStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} {
  let storage: Storage | null;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      storage = window.localStorage;
    } else {
      storage = null;
    }
  } catch (e) {
    console.error("localStorage is not available:", e);
    storage = null;
  }

  return {
    getItem(key: string): string | null {
      if (storage) {
        return storage.getItem(key);
      } else {
        console.warn(
          `Attempted to get item "${key}" from localStorage, but localStorage is not available.`,
        );
        return null;
      }
    },
    setItem(key: string, value: string): void {
      if (storage) {
        storage.setItem(key, value);
      } else {
        console.warn(
          `Attempted to set item "${key}" in localStorage, but localStorage is not available.`,
        );
      }
    },
    removeItem(key: string): void {
      if (storage) {
        storage.removeItem(key);
      } else {
        console.warn(
          `Attempted to remove item "${key}" from localStorage, but localStorage is not available.`,
        );
      }
    },
    clear(): void {
      if (storage) {
        storage.clear();
      } else {
        console.warn(
          "Attempted to clear localStorage, but localStorage is not available.",
        );
      }
    },
  };
}

export function getOperationId(operation: {
  operationId?: string;
  method: string;
  path: string;
}) {
  // pattern '^[a-zA-Z0-9_-]+$'
  return (
    operation?.operationId ||
    `${operation.method.toUpperCase()}${operation.path.replaceAll("/", "_")}`
  );
}

export function clientUpdate() {
  // this a wild for updating client app
  return window.__TAURI__?.updater
    .checkUpdate()
    .then((updateResult) => {
      if (updateResult.shouldUpdate) {
        window.__TAURI__?.updater
          .installUpdate()
          .then((result) => {
            showToast(Locale.Settings.Update.Success);
          })
          .catch((e) => {
            console.error("[Install Update Error]", e);
            showToast(Locale.Settings.Update.Failed);
          });
      }
    })
    .catch((e) => {
      console.error("[Check Update Error]", e);
      showToast(Locale.Settings.Update.Failed);
    });
}

// https://gist.github.com/iwill/a83038623ba4fef6abb9efca87ae9ccb
export function semverCompare(a: string, b: string) {
  if (a.startsWith(b + "-")) return -1;
  if (b.startsWith(a + "-")) return 1;
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "case",
    caseFirst: "upper",
  });
}

export function isMultiModel(model: string) {
  const keywords = ["claude", "gpt-4o"];

  return keywords.some((keyword) => model.includes(keyword));
}

export function getBase64FromUrlByCanvas(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，避免了文档冗余和污染
    let Img = new Image();
    Img.src = url;
    Img.crossOrigin = "Anonymous";
    Img.onload = () => {
      // 要先确保图片完整获取到，这是个异步事件
      let dataURL = "";
      let canvas = document.createElement("canvas"); // 创建canvas元素
      let width = Img.width; // 确保canvas的尺寸和图片一样
      let height = Img.height;
      canvas.width = width || 0;
      canvas.height = height || 0;
      let ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(Img, 0, 0, width, height); // 将图片绘制到canvas中
      dataURL = canvas.toDataURL("image/png"); // 转换图片为dataURL
      resolve(dataURL);
    };
  });
}

export async function getBase64FromUrl(url: string) {
  let type = "";
  let base64 = "";
  await fetch(url, {
    method: "get",
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      type = blob.type;
      return blobToBase64(blob);
    })
    .then((res) => (base64 = res));

  return { type, base64 };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve("");
    };
  });
}

export async function getFileFromUrl(fileUrl: string, fileName: string) {
  let fileObj = undefined;
  await fetch(fileUrl, { method: "get", body: null })
    .then((response) => response.blob())
    .then((blob) => {
      fileObj = new File([blob], fileName);
    });

  return fileObj;
}

export function getBase64(file: RcFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function countTokens(text: string = "") {
  return encode(text).length;
}

export async function getFileMarkdown(file: File, url: string, name: string) {
  try {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (url) {
      formData.append("url", url);
      formData.append("name", name);
    }
    const res = await fetch("/api/file", { body: formData, method: "POST" });
    const resJson = await res.json();
    return resJson?.text ?? "";
  } catch (e) {
    console.log(e);
  }
  return "";
}
