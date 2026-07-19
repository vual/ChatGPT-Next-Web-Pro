export const OWNER = "AnnYun";
export const REPO = "ChatGPT-Next-Web-Pro";
export const REPO_URL = `https://github.com/vual/ChatGPT-Next-Web-Pro`;
export const PLUGINS_REPO_URL = `https://github.com/ChatGPTNextWeb/NextChat-Awesome-Plugins`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/vual/ChatGPT-Next-Web-Pro/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/vual/ChatGPT-Next-Web-Pro/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const STABILITY_BASE_URL = "https://api.stability.ai";

export const OPENAI_BASE_URL = "https://api.openai.com";
export const ANTHROPIC_BASE_URL = "https://api.anthropic.com";

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";

export const BAIDU_BASE_URL = "https://aip.baidubce.com";
export const BAIDU_OATUH_URL = `${BAIDU_BASE_URL}/oauth/2.0/token`;

export const BYTEDANCE_BASE_URL = "https://ark.cn-beijing.volces.com";

export const ALIBABA_BASE_URL = "https://dashscope.aliyuncs.com/api/";

export const TENCENT_BASE_URL = "https://hunyuan.tencentcloudapi.com";

export const MOONSHOT_BASE_URL = "https://api.moonshot.ai";
export const IFLYTEK_BASE_URL = "https://spark-api-open.xf-yun.com";

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export const XAI_BASE_URL = "https://api.x.ai";

export const CHATGLM_BASE_URL = "https://open.bigmodel.cn";

export const SILICONFLOW_BASE_URL = "https://api.siliconflow.cn";

export const AI302_BASE_URL = "https://api.302.ai";

export const CACHE_URL_PREFIX = "/api/cache";
export const UPLOAD_URL = `${CACHE_URL_PREFIX}/upload`;

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Plugins = "/plugins",
  Auth = "/auth",
  Sd = "/sd",
  SdNew = "/sd-new",
  Mj = "/mj",
  MjNew = "/mj-new",
  Artifacts = "/artifacts",
  SearchChat = "/search-chat",
  McpMarket = "/mcp-market",
  Login = "/login",
  DrawList = "/draw-list",
}

export enum ApiPath {
  Cors = "",
  Azure = "/api/azure",
  OpenAI = "/api/openai",
  Anthropic = "/api/anthropic",
  Google = "/api/google",
  Baidu = "/api/baidu",
  ByteDance = "/api/bytedance",
  Alibaba = "/api/alibaba",
  Tencent = "/api/tencent",
  Moonshot = "/api/moonshot",
  Iflytek = "/api/iflytek",
  Stability = "/api/stability",
  Artifacts = "/api/artifacts",
  XAI = "/api/xai",
  ChatGLM = "/api/chatglm",
  DeepSeek = "/api/deepseek",
  SiliconFlow = "/api/siliconflow",
  "302.AI" = "/api/302ai",
  Midjourney = "/api/midjourney",
}

export enum SlotID {
  AppBody = "app-body",
  CustomModel = "custom-model",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Plugin = "chat-next-web-plugin",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
  SdList = "sd-list",
  Mcp = "mcp-store",
  DrawConfig = "draw-config",
  DrawList = "draw-list",
  Auth = "auth-store",
  MjList = "mj-list",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "chatgpt-next-web";

export const REQUEST_TIMEOUT_MS = 60000;
export const REQUEST_TIMEOUT_MS_FOR_THINKING = REQUEST_TIMEOUT_MS * 5;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export enum ServiceProvider {
  OpenAI = "OpenAI",
  Azure = "Azure",
  Google = "Google",
  Anthropic = "Anthropic",
  Baidu = "Baidu",
  ByteDance = "ByteDance",
  Alibaba = "Alibaba",
  Tencent = "Tencent",
  Moonshot = "Moonshot",
  Stability = "Stability",
  Iflytek = "Iflytek",
  XAI = "XAI",
  ChatGLM = "ChatGLM",
  DeepSeek = "DeepSeek",
  SiliconFlow = "SiliconFlow",
  "302.AI" = "302.AI",
}

// Google API safety settings, see https://ai.google.dev/gemini-api/docs/safety-settings
// BLOCK_NONE will not block any content, and BLOCK_ONLY_HIGH will block only high-risk content.
export enum GoogleSafetySettingsThreshold {
  BLOCK_NONE = "BLOCK_NONE",
  BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
  BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
  BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
}

export enum ModelProvider {
  Stability = "Stability",
  GPT = "GPT",
  GeminiPro = "GeminiPro",
  Claude = "Claude",
  Ernie = "Ernie",
  Doubao = "Doubao",
  Qwen = "Qwen",
  Hunyuan = "Hunyuan",
  Moonshot = "Moonshot",
  Iflytek = "Iflytek",
  XAI = "XAI",
  ChatGLM = "ChatGLM",
  DeepSeek = "DeepSeek",
  SiliconFlow = "SiliconFlow",
  "302.AI" = "302.AI",
}

export const Stability = {
  GeneratePath: "v2beta/stable-image/generate",
  ExampleEndpoint: "https://api.stability.ai",
};

export const MJProxy = {
  ImaginePath: "submit/imagine",
  BlendPath: "submit/blend",
  DescribePath: "submit/describe",
  ModalPath: "submit/modal",
  ActionPath: "submit/action",
  GetTaskById: "task/{id}/fetch",
  GetTaskSeedById: "task/{id}/image-seed",
  ExampleEndpoint: "https://example.com/mj",
};

export const Anthropic = {
  ChatPath: "v1/messages",
  ChatPath1: "v1/complete",
  ExampleEndpoint: "https://api.anthropic.com",
  Vision: "2023-06-01",
};

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  SpeechPath: "v1/audio/speech",
  ImagePath: "v1/images/generations",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
  ImagesGenerationsPath: "v1/images/generations",
  ImagesEditPath: "v1/images/edits",
  AudioTranscriptionsPath: "v1/audio/transcriptions",
  AudioSpeechPath: "v1/audio/speech",
};

export const Azure = {
  ChatPath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/chat/completions?api-version=${apiVersion}`,
  // https://<your_resource_name>.openai.azure.com/openai/deployments/<your_deployment_name>/images/generations?api-version=<api_version>
  ImagePath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/images/generations?api-version=${apiVersion}`,
  ExampleEndpoint: "https://{resource-url}/openai",
};

export const Google = {
  ExampleEndpoint: "https://generativelanguage.googleapis.com/",
  ChatPath: (modelName: string) =>
    `v1beta/models/${modelName}:streamGenerateContent`,
};

export const Baidu = {
  ExampleEndpoint: BAIDU_BASE_URL,
  ChatPath: (modelName: string) => {
    let endpoint = modelName;
    if (modelName === "ernie-4.0-8k") {
      endpoint = "completions_pro";
    }
    if (modelName === "ernie-4.0-8k-preview-0518") {
      endpoint = "completions_adv_pro";
    }
    if (modelName === "ernie-3.5-8k") {
      endpoint = "completions";
    }
    if (modelName === "ernie-speed-8k") {
      endpoint = "ernie_speed";
    }
    return `rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${endpoint}`;
  },
};

export const ByteDance = {
  ExampleEndpoint: "https://ark.cn-beijing.volces.com/api/",
  ChatPath: "api/v3/chat/completions",
};

export const Alibaba = {
  ExampleEndpoint: ALIBABA_BASE_URL,
  ChatPath: (modelName: string) => {
    if (modelName.includes("vl") || modelName.includes("omni")) {
      return "v1/services/aigc/multimodal-generation/generation";
    }
    return `v1/services/aigc/text-generation/generation`;
  },
};

export const Tencent = {
  ExampleEndpoint: TENCENT_BASE_URL,
};

export const Moonshot = {
  ExampleEndpoint: MOONSHOT_BASE_URL,
  ChatPath: "v1/chat/completions",
};

export const Iflytek = {
  ExampleEndpoint: IFLYTEK_BASE_URL,
  ChatPath: "v1/chat/completions",
};

export const DeepSeek = {
  ExampleEndpoint: DEEPSEEK_BASE_URL,
  ChatPath: "chat/completions",
};

export const XAI = {
  ExampleEndpoint: XAI_BASE_URL,
  ChatPath: "v1/chat/completions",
};

export const ChatGLM = {
  ExampleEndpoint: CHATGLM_BASE_URL,
  ChatPath: "api/paas/v4/chat/completions",
  ImagePath: "api/paas/v4/images/generations",
  VideoPath: "api/paas/v4/videos/generations",
};

export const SiliconFlow = {
  ExampleEndpoint: SILICONFLOW_BASE_URL,
  ChatPath: "v1/chat/completions",
  ListModelPath: "v1/models?&sub_type=chat",
};

export const AI302 = {
  ExampleEndpoint: AI302_BASE_URL,
  ChatPath: "v1/chat/completions",
  EmbeddingsPath: "jina/v1/embeddings",
  ListModelPath: "v1/models?llm=1",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
// export const DEFAULT_SYSTEM_TEMPLATE = `
// You are ChatGPT, a large language model trained by {{ServiceProvider}}.
// Knowledge cutoff: {{cutoff}}
// Current model: {{model}}
// Current time: {{time}}
// Latex inline: $x^2$
// Latex block: $$e=mc^2$$
// `;
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: \\(x^2\\) 
Latex block: $$e=mc^2$$
`;

export const MCP_TOOLS_TEMPLATE = `
[clientId]
{{ clientId }}
[tools]
{{ tools }}
`;

export const MCP_SYSTEM_TEMPLATE = `
You are an AI assistant with access to system tools. Your role is to help users by combining natural language understanding with tool operations when needed.

1. AVAILABLE TOOLS:
{{ MCP_TOOLS }}

2. WHEN TO USE TOOLS:
   - ALWAYS USE TOOLS when they can help answer user questions
   - DO NOT just describe what you could do - TAKE ACTION immediately
   - If you're not sure whether to use a tool, USE IT
   - Common triggers for tool use:
     * Questions about files or directories
     * Requests to check, list, or manipulate system resources
     * Any query that can be answered with available tools

3. HOW TO USE TOOLS:
   A. Tool Call Format:
      - Use markdown code blocks with format: \`\`\`json:mcp:{clientId}\`\`\`
      - Always include:
        * method: "tools/call"（Only this method is supported）
        * params: 
          - name: must match an available primitive name
          - arguments: required parameters for the primitive

   B. Response Format:
      - Tool responses will come as user messages
      - Format: \`\`\`json:mcp-response:{clientId}\`\`\`
      - Wait for response before making another tool call

   C. Important Rules:
      - Only use tools/call method
      - Only ONE tool call per message
      - ALWAYS TAKE ACTION instead of just describing what you could do
      - Include the correct clientId in code block language tag
      - Verify arguments match the primitive's requirements

4. INTERACTION FLOW:
   A. When user makes a request:
      - IMMEDIATELY use appropriate tool if available
      - DO NOT ask if user wants you to use the tool
      - DO NOT just describe what you could do
   B. After receiving tool response:
      - Explain results clearly
      - Take next appropriate action if needed
   C. If tools fail:
      - Explain the error
      - Try alternative approach immediately

5. EXAMPLE INTERACTION:

  good example:

   \`\`\`json:mcp:filesystem
   {
     "method": "tools/call",
     "params": {
       "name": "list_allowed_directories",
       "arguments": {}
     }
   }
   \`\`\`"


  \`\`\`json:mcp-response:filesystem
  {
  "method": "tools/call",
  "params": {
    "name": "write_file",
    "arguments": {
      "path": "/Users/river/dev/nextchat/test/joke.txt",
      "content": "为什么数学书总是感到忧伤？因为它有太多的问题。"
    }
  }
  }
\`\`\`

   follwing is the wrong! mcp json example:

   \`\`\`json:mcp:filesystem
   {
      "method": "write_file",
      "params": {
        "path": "NextChat_Information.txt",
        "content": "1"
    }
   }
   \`\`\`

   This is wrong because the method is not tools/call.
   
   \`\`\`{
  "method": "search_repositories",
  "params": {
    "query": "2oeee"
  }
}
   \`\`\`

   This is wrong because the method is not tools/call.!!!!!!!!!!!

   the right format is:
   \`\`\`json:mcp:filesystem
   {
     "method": "tools/call",
     "params": {
       "name": "search_repositories",
       "arguments": {
         "query": "2oeee"
       }
     }
   }
   \`\`\`
   
   please follow the format strictly ONLY use tools/call method!!!!!!!!!!!
   
`;

export const SUMMARIZE_MODEL = "gpt-4o-mini";
export const GEMINI_SUMMARIZE_MODEL = "gemini-pro";
export const DEEPSEEK_SUMMARIZE_MODEL = "deepseek-chat";

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2021-09",
  "gpt-4-turbo": "2023-12",
  "gpt-4-turbo-2024-04-09": "2023-12",
  "gpt-4-turbo-preview": "2023-12",
  "gpt-4.1": "2024-06",
  "gpt-4.1-2025-04-14": "2024-06",
  "gpt-4.1-mini": "2024-06",
  "gpt-4.1-mini-2025-04-14": "2024-06",
  "gpt-4.1-nano": "2024-06",
  "gpt-4.1-nano-2025-04-14": "2024-06",
  "gpt-4.5-preview": "2023-10",
  "gpt-4.5-preview-2025-02-27": "2023-10",
  "gpt-4o": "2023-10",
  "gpt-4o-2024-05-13": "2023-10",
  "gpt-4o-2024-08-06": "2023-10",
  "gpt-4o-2024-11-20": "2023-10",
  "chatgpt-4o-latest": "2023-10",
  "gpt-4o-mini": "2023-10",
  "gpt-4o-mini-2024-07-18": "2023-10",
  "gpt-4-vision-preview": "2023-04",
  "o1-mini-2024-09-12": "2023-10",
  "o1-mini": "2023-10",
  "o1-preview-2024-09-12": "2023-10",
  "o1-preview": "2023-10",
  "o1-2024-12-17": "2023-10",
  o1: "2023-10",
  "o3-mini-2025-01-31": "2023-10",
  "o3-mini": "2023-10",
  // After improvements,
  // it's now easier to add "KnowledgeCutOffDate" instead of stupid hardcoding it, as was done previously.
  "gemini-pro": "2023-12",
  "gemini-pro-vision": "2023-12",
  "deepseek-chat": "2024-07",
  "deepseek-coder": "2024-07",
};

export const DEFAULT_TTS_ENGINE = "OpenAI-TTS";
export const DEFAULT_TTS_ENGINES = ["OpenAI-TTS", "Edge-TTS"];
export const DEFAULT_TTS_MODEL = "tts-1";
export const DEFAULT_TTS_VOICE = "alloy";
export const DEFAULT_TTS_MODELS = ["tts-1", "tts-1-hd"];
export const DEFAULT_TTS_VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
];

export const VISION_MODEL_REGEXES = [
  /vision/,
  /gpt-4o/,
  /gpt-4\.1/,
  /claude.*[34]/,
  /gemini-1\.5/,
  /gemini-exp/,
  /gemini-2\.[05]/,
  /learnlm/,
  /qwen-vl/,
  /qwen2-vl/,
  /gpt-4-turbo(?!.*preview)/,
  /^dall-e-3$/,
  /glm-4v/,
  /vl/i,
  /o3/,
  /o4-mini/,
  /grok-4/i,
  /gpt-5/
];

export const EXCLUDE_VISION_MODEL_REGEXES = [/claude-3-5-haiku-20241022/];

const openaiModels = [
  // As of July 2024, gpt-4o-mini should be used in place of gpt-3.5-turbo,
  // as it is cheaper, more capable, multimodal, and just as fast. gpt-3.5-turbo is still available for use in the API.
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0125",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-32k",
  "gpt-4-32k-0613",
  "gpt-4-turbo",
  "gpt-4-turbo-preview",
  "gpt-4.1",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4.5-preview",
  "gpt-4.5-preview-2025-02-27",
  "gpt-5-chat",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5",
  "gpt-5-chat-2025-01-01-preview",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "chatgpt-4o-latest",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-vision-preview",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-1106-preview",
  "gpt-4.1-mini",
  "gpt-image-1",
  "dall-e-3",
  "o1-mini",
  "o1-preview",
  "o3-mini",
  "o3",
  "o4-mini",
  "gpt-4-all",
  "gpt-4o-all",
  "tts-1",
  "tts-1-1106",
  "tts-1-hd",
  "tts-1-hd-1106",
  "whisper-1",
];

const googleModels = [
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-002",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-002",
  "learnlm-1.5-pro-experimental",
  "gemini-exp-1206",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-flash-thinking-exp",
  "gemini-2.0-flash-thinking-exp-1219",
  "gemini-2.0-flash-thinking-exp-01-21",
  "gemini-2.0-pro-exp",
  "gemini-2.0-pro-exp-02-05",
  "gemini-2.5-pro-preview-06-05",
  "gemini-2.5-pro"
];

const anthropicModels = [
  "claude-instant-1.2",
  "claude-2.0",
  "claude-2.1",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-3-opus-latest",
  "claude-3-haiku-20240307",
  "claude-3-5-haiku-20241022",
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest",
  "claude-3-7-sonnet-20250219",
  "claude-3-7-sonnet-latest",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
];

const baiduModels = [
  "ernie-4.0-turbo-8k",
  "ernie-4.0-8k",
  "ernie-4.0-8k-preview",
  "ernie-4.0-8k-preview-0518",
  "ernie-4.0-8k-latest",
  "ernie-3.5-8k",
  "ernie-3.5-8k-0205",
  "ernie-speed-128k",
  "ernie-speed-8k",
  "ernie-lite-8k",
  "ernie-tiny-8k",
];

const bytedanceModels = [
  "Doubao-lite-4k",
  "Doubao-lite-32k",
  "Doubao-lite-128k",
  "Doubao-pro-4k",
  "Doubao-pro-32k",
  "Doubao-pro-128k",
];

const alibabaModes = [
  "qwen-turbo",
  "qwen-plus",
  "qwen-max",
  "qwen-max-0428",
  "qwen-max-0403",
  "qwen-max-0107",
  "qwen-max-longcontext",
  "qwen-omni-turbo",
  "qwen-vl-plus",
  "qwen-vl-max",
];

const tencentModels = [
  "hunyuan-pro",
  "hunyuan-standard",
  "hunyuan-lite",
  "hunyuan-role",
  "hunyuan-functioncall",
  "hunyuan-code",
  "hunyuan-vision",
];

const moonshotModels = [
  "moonshot-v1-auto",
  "moonshot-v1-8k",
  "moonshot-v1-32k",
  "moonshot-v1-128k",
  "moonshot-v1-8k-vision-preview",
  "moonshot-v1-32k-vision-preview",
  "moonshot-v1-128k-vision-preview",
  "kimi-thinking-preview",
  "kimi-k2-0711-preview",
  "kimi-latest",
];

const iflytekModels = [
  "general",
  "generalv3",
  "pro-128k",
  "generalv3.5",
  "4.0Ultra",
];

const deepseekModels = ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"];

const xAIModes = [
  "grok-beta",
  "grok-2",
  "grok-2-1212",
  "grok-2-latest",
  "grok-vision-beta",
  "grok-2-vision-1212",
  "grok-2-vision",
  "grok-2-vision-latest",
  "grok-3-mini-fast-beta",
  "grok-3-mini-fast",
  "grok-3-mini-fast-latest",
  "grok-3-mini-beta",
  "grok-3-mini",
  "grok-3-mini-latest",
  "grok-3-fast-beta",
  "grok-3-fast",
  "grok-3-fast-latest",
  "grok-3-beta",
  "grok-3",
  "grok-3-latest",
  "grok-4",
  "grok-4-0709",
  "grok-4-fast-non-reasoning",
  "grok-4-fast-reasoning",
  "grok-code-fast-1",
];

const chatglmModels = [
  "glm-4-plus",
  "glm-4-0520",
  "glm-4",
  "glm-4-air",
  "glm-4-airx",
  "glm-4-long",
  "glm-4-flashx",
  "glm-4-flash",
  "glm-4v-plus",
  "glm-4v",
  "glm-4v-flash", // free
  "cogview-3-plus",
  "cogview-3",
  "cogview-3-flash", // free
  // 目前无法适配轮询任务
  //   "cogvideox",
  //   "cogvideox-flash", // free
];

const siliconflowModels = [
  "Qwen/Qwen2.5-7B-Instruct",
  "Qwen/Qwen2.5-72B-Instruct",
  "deepseek-ai/DeepSeek-R1",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
  "deepseek-ai/DeepSeek-V3",
  "meta-llama/Llama-3.3-70B-Instruct",
  "THUDM/glm-4-9b-chat",
  "Pro/deepseek-ai/DeepSeek-R1",
  "Pro/deepseek-ai/DeepSeek-V3",
];

const ai302Models = [
  "deepseek-chat",
  "gpt-4o",
  "chatgpt-4o-latest",
  "llama3.3-70b",
  "deepseek-reasoner",
  "gemini-2.0-flash",
  "claude-3-7-sonnet-20250219",
  "claude-3-7-sonnet-latest",
  "grok-3-beta",
  "grok-3-mini-beta",
  "gpt-4.1",
  "gpt-4.1-mini",
  "o3",
  "o4-mini",
  "qwen3-235b-a22b",
  "qwen3-32b",
  "gemini-2.5-pro-preview-05-06",
  "llama-4-maverick",
  "gemini-2.5-flash",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "gemini-2.5-pro",
];

let seq = 1000; // 内置的模型序号生成器从1000开始
const midjourneyModels = ["midjourney"];

const stableDiffusionModels = ["stable-diffusion"];

const lumaModels = ["luma"];

export const DEFAULT_MODELS = [
  ...openaiModels.map((name) => ({
    name,
    available: true,
    sorted: seq++, // Global sequence sort(index)
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
      sorted: 1, // 这里是固定的，确保顺序与之前内置的版本一致
    },
  })),
  ...openaiModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "azure",
      providerName: "Azure",
      providerType: "azure",
      sorted: 2,
    },
  })),
  ...googleModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
      sorted: 3,
    },
  })),
  ...anthropicModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "anthropic",
      providerName: "Anthropic",
      providerType: "anthropic",
      sorted: 4,
    },
  })),
  ...baiduModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "baidu",
      providerName: "Baidu",
      providerType: "baidu",
      sorted: 5,
    },
  })),
  ...bytedanceModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "bytedance",
      providerName: "ByteDance",
      providerType: "bytedance",
      sorted: 6,
    },
  })),
  ...alibabaModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "alibaba",
      providerName: "Alibaba",
      providerType: "alibaba",
      sorted: 7,
    },
  })),
  ...tencentModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "tencent",
      providerName: "Tencent",
      providerType: "tencent",
      sorted: 8,
    },
  })),
  ...moonshotModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "moonshot",
      providerName: "Moonshot",
      providerType: "moonshot",
      sorted: 9,
    },
  })),
  ...iflytekModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "iflytek",
      providerName: "Iflytek",
      providerType: "iflytek",
      sorted: 10,
    },
  })),
  ...xAIModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "xai",
      providerName: "XAI",
      providerType: "xai",
      sorted: 11,
    },
  })),
  ...chatglmModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "chatglm",
      providerName: "ChatGLM",
      providerType: "chatglm",
      sorted: 12,
    },
  })),
  ...deepseekModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "deepseek",
      providerName: "DeepSeek",
      providerType: "deepseek",
      sorted: 13,
    },
  })),
  ...siliconflowModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "siliconflow",
      providerName: "SiliconFlow",
      providerType: "siliconflow",
      sorted: 14,
    },
  })),
  ...ai302Models.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "ai302",
      providerName: "302.AI",
      providerType: "ai302",
      sorted: 15,
    },
  })),
  ...midjourneyModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "midjourney",
      providerName: "Midjourney",
      providerType: "midjourney",
      sorted: 20,
    },
  })),
  ...stableDiffusionModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "stable-diffusion",
      providerName: "StableDiffusion",
      providerType: "stable-diffusion",
      sorted: 21,
    },
  })),
  ...lumaModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "luma",
      providerName: "Luma",
      providerType: "luma",
      sorted: 22,
    },
  })),
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

// some famous webdav endpoints
export const internalAllowedWebDavEndpoints = [
  "https://dav.jianguoyun.com/dav/",
  "https://dav.dropdav.com/",
  "https://dav.box.com/dav",
  "https://nanao.teracloud.jp/dav/",
  "https://bora.teracloud.jp/dav/",
  "https://webdav.4shared.com/",
  "https://dav.idrivesync.com",
  "https://webdav.yandex.com",
  "https://app.koofr.net/dav/Koofr",
];

export const DEFAULT_GA_ID = "G-89WN60ZK2E";

export const SAAS_CHAT_URL = "https://nextchat.club";
export const SAAS_CHAT_UTM_URL = "https://nextchat.club?utm=github";

export const MidjourneyIconBase64 =
  "data:image/png;base64,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";
export const StableDiffusionIconBase64 =
  "data:image/jpeg;base64,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";
export const SunoIconBase64 =
  "data:image/png;base64,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";
export const QwenIconBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJwAAACcCAYAAACKuMJNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAABrfSURBVHhe7Z0JmFTVmYa/c6v3jQa6oRHZXEFkERGN4rjFJIDRSTQ8xrgGJ+oYYxaTzIzJZMbJZsbk0TDRiVuicUkAHSUoQdxHFBREUREQWnbZuqGh9+66Z77/1mmetqmurnur+nYVc16eouqcWvrec7/z//9Zr9IEFktIOObZYgkFKzhLqFjBWULFCs4SKlZwllCxgrOEihWcJVSs4CyhYgVnCRUrOEuoWMFZQsUKzhIqVnCWULGCs4SKFZwlVKzgLKFiBWcJFSs4S6hYwVlCxQrOEipWcJZQyfhVW97BRdtjL9obgDY+cgpZVXJjj9x8KPmMJSvISMG5TU3AW3dRXAegDmyErtsC5dIYN+/hYyeQPzAmukgBUDYUKB8JXTYKevKNiETMj1gykswR3Ecv8PE02lfcS8MVhVM0iEeXE7NiHSpSEgHIg4fsHbY80/qJBWxvhm6ugasLEDnxWmDS14Chk+VblgyiTwWnWxqhVvweeOe/KZhGORpar358x4jKN3SuOgq01vGZYs0vo/Bugp70dYo2x7reDKBPBOf9wedvBdYvgGraBhRWxqyXSqMk5LREfPU74JaOBE6+Cc7kWeZNS18RquC8P7TqUWDhDVBFpQz4aYGcEIIuly63ifGfqxCdfj8iYy4yb1jCJjTBuXLRH50BtWclxcagX/VBdM9j0I174I6YgcjFD5lMS5iEIji98S3gqQvZBsgH8kpMbh/SXMtWLq3rNIpu1Kkm0xIGEp33Lot/BDXnbKjC8swQm1AwIHbmc88D3rwnlmcJhV6zcLq1GXjmOqhNi9goEBeagW1E7QJ0sdER0xH58h9NpqU36RULJwp251wCbHoWKKrITLEJ0jIuHgSn+n8QXfgvgTpiLP7oHQs3+3j+1wDk9+dzNlxGVoj6rUDlZOCKxSbP0huk38I9dTXN2wGKjTFb1tgMHmfJUGDvh8C8S02epTdIr+AWXA9UL4jFbNlIASvJxr9BL/6xybCkm7S51OhLP4Xz9q+hSmkp0okbjQX3UTZC2vnwrCZdoHSxRPL4UmaNpLNPT0HvrYae9ic4479s8izpIi2C0+tfoCv9MlTZkUylqYHQ3siWbiOtzkDo3GKg4hS4Q8fz1x1ox4Wz5V3o/evhHNgI1VYP5BZShEX8Yhrqj45Ct9RDfeVpYMgkk2lJB6kLro1fv+doII/WxskxmSnQRpEd2A4c8Rm4E78Bdcx0tnT7dStjt+4TqO1LoZfNhrPjNaDfCFo+Wr9UoUXVLbSo396aripkISkJTr6oHjwdaKJAclPs1JVhp4adwMhpwPS7Yx3FPtE7GPQ/902oXSti8+RSlUrLfujBp0HNnGMyLKmSUqNBv3U/ULchdbGJS2xrhZ7xMHDxY4HEJqiqMcCVdO8X/ZnHtY1WqsW8E5D8Mq/j2t30eta0tzOd1Czc7aVQ5cP4KynotrkW0aLhiHz1GaA4fa1bvXcr3EfORgQUXSpdNLS8bjsbLtevY8RgnWuqBFKKXDr9yOfYIh2cmtgaaxAddBqca5emVWyC6n8knJvWo73yZLr83SY3AIxLnWg9NF21JXWCCW7jMmDP+ykF57pxN9xRMxC59MleC8rldyOXPsVGx3Cg9UAsMwiFAxFZdS/cvXTTlpTwLTjPMb30A6i8Ql7RgFJp3Q8MnATnIsaAvYx3hP/wJkVD1y9/NyjFQ4Bld5qEJSj+Ldz78+DsWxNbNRWE9gboaATqioUmIyRmvQY3pzR4Q0IaEO/OpmVfazIsQfAvuJd/GBsCCoIE4Dof+qrXTEbIXLIQuqGWZto1Gf5QxYOAJb8wKUsQ/Alu6wqohu2xISXfKOh9m6DOvQNOeZqHv5LEqRgOfca/efFjIHJpITc+B+xeZzIsfvEnuFduBcoYCwXpYmjZBz3+WmDMBSajb1CfuQl66GeDNSIkZo1EoF/+d5Nh8UvSgtM164FPGHwHsW6yWLmVsdP02b3WIk0W+fvOtLugNV8Fca15/YD1cxgamLTFF0kLTi1m7FZYZlI+adoLTP2PAAFjL1E6CPrEa2h1eVwBUCVV0M/dYlIWPySlAbd+H9zad81sDJ9EW3mBhwOnXmcyMgN1zk+gW5sCWrlSqPV/5fcbTIYlWZIzOhsWQEnhBhlVaGCAfsZPTCJzENfqnvlzoHlfLMMPLAfVvIsNiD5qbWcxySlo6W+g8gMM0It1q5gAjO7bhkJ3RE6+PhaTSYzpE5XfD3qVXenll54H7xsOQN81AKpiNBM+I+X67XDPvxvOuMxdJ+C+/UeoV26BKq4yOUnizUKOAle+DpRk6ZT6Luh91cDebVAyJ1FskbTKZU++9rpYWj7Dxla0+g2onAJJ8TM50E38Dj2Fczk9ofep7ulRcO7SO+Esu93/OgUdhXugBuqWXX3eMk2Ert8Jfd8EON72Ez6PtKkW+NzdwJi/NxnZjbv8fjYOb4QqqjQ5LA/ZEKizB5Aykun9nY2PbNtRvwvuzOfhjDrdZManR5eqPlkO5AZoLMi45eiZGS02j5LB0MP/LtiQVyQXWDPfJLIfNflauDKVS8KnQoYa0itRNMBbu3vwIWLMY76EIh0PmQ9ZzHJc/YD5pe5JLDgZBtrCwNjvrBAaTRc5wMmZ1TKNh1QI5/TbWEO3mpQPWND6oydMIvuRs1dn/dI0pLyUZCdHbgGcjxleNCXuUE8suL0bYn1VflunNMOKLlgNGWcyMhs1ZDR0pOLTriMZpLWq2qC3v28ysh81+ovQeaUsC5/dReJWW3YCNYknNyRW0hYGhzINyS8i0tFf82sv+hQ99rIA05cYx+T3h9q4yKSzH1VcAbfqNG/VnF9UHkOv9/5sUvFJLLjVf4r5aD9IG4RxpjrpGpORHTgnXMhjZ3H4nXEvneE7VpjE4YEz5Sa2PAP0T0ost/Ultj5MOg7dC66ef7Clnp/wuchY3FLFmFjQmU1UTaG14jH7dSUOi7BuC9DWZjKyH1U1Abrf0RSO3xCDWmmugd71nsk4lG4Fp3evolml4Pw6xvZWYPBJ/oXa18i62sqJPH5Z3e8DWYtbuy7wuGxGIt0egyf5b7lLl4l8J0Ec163gVOMeqk58o0/Bte6DOyozRxZ6Qh/B2EWWLPqCReg2QtdUm/RhwolXscVZwxc+r38OK+76v5nEoXTvUteyuS/9TH4RN3zseSaRXajjWFF8hnDeF/JLoTcydjmMUEdNpUeV8MJniBEpgNq2xCQOpXvB1W3y3/8mG8+UVMHJpuZpZwr7UzwDqSGfhZxTAL3jLZM4PPAu4RF/xxCjyUsnjbjjmjUmcShxBecV9waqVIJAGYBP6sGgWboVKumWshVp6FSeyEJuiFUeEZ4EzgcfPMeDz+Yh5w2Wk+xAcLgx6lyGGBRc53OOe+35kNhXwpFmxrKiqs3LYr/RhW4tXLRiENzCgYgWD+r5UVTJZz74eX0UDzKLcSvGQef0g2Zl067L5zxop5B5dJs55XxdFHu/45HHh7iRggr/3jjDUcOmwM0bwPMsO3i+0aKKONefeaXHIHrEeYiOuRLRcdezTOJ7x4SD9/JGtnrHoBwsjBZaOWlxRYpjoYU0uqUwaPi8150xeUosQTp2kMogOotDXncfgyVHSnuLWCx+SVWwFosvrOAsoWIFZwkVKzhLqFjBWULFCs4SKlZwllCxgrOEihWcJVSs4CyhYgVnCRUrOEuoWMFZQsUKzhIqVnCWULGCs4RKtxMwdfMBvpucHhX/aZn/n1MAlXN4zHjVLTKHX9ZlJjPnmUXoRKDyA94s5f8RcQUX3fACIvd/FijPZ1kmMyHYfEYu0pceB8Zn7gaEPaHf/B30opvgrOc57WJGx9TyRMjpl/DpWD7+uR5OUXEs/zDAfewCqN0rWA6yAWGSRNvglh8LdfmLrIefLrz4gmtpR+ROFtqA41mCyQjOICt2Jn0LmPoDk5F96EXfg9r0JCCLx+tptaW8ehJclGVURGUeXQf9+b9AHXe+eSO7kUuv750Ix5X9nbsu5EhAtAVu5SnejY27Fl1cn+nk0y22tJqUCC7Jh6y63ryUr7MXVbue/+UC/VnArbJgkufllXw3D7lhgzzyWbQ5RVB7D597cenaTVDRRgqC5SGLg5J9aAZZxQPi1tO4gvM+KHveyiokPziyCDaLFwTLjkE1q+k+WMBNFFHEW6GbBEZwuUWscM+bvMOAmjVQska3RxPfhfZ6KFlEHYfuWwVHfZ5f9LlHmGxgI3u9tsvi4OxD1+/x9kaBywIuMy6EWkqIXAtxqXlSlPzOAQZ+bQG2b81EatewLCSs8Cs4escBcousQ0kgOLkflf9N6WR/WPXRApPIMtb/lSXCIpHbIhVSPPKcDGII+4sr4XdkJ/DDZSelrW97W6n6g2XWUgeMONOkP023gtMlQ/iu3FerpyrehTzZlC7+Mv9MR23jceeysSSxmVisXBFfD+cvFiCfn/O6kESgzXSrh8k+I7IhpZSHH3Q7dGH3tyDoVnBq0AT+Mdnr1afgcgqhtr5Ks5plblWs1J73YpuxCOJRk9k8SopHGhgSw0lZ5fcHPpwbey+LcT9eAlXE6+83fpN7PBw93SQOpVvBobQi1ur0vSMkC1/uPJjK7b77gm1sXXu3tDRFIq61PxXnbVmVABFc5w5yuWHGnuWx/Gzm44Xe3XZ8nwjjVzXibJM4lO4FJxx9obkIfmCNiGjoVY+bdHbgrn2K/7NVLgGylLFYq4EUXE9utZ3vDaFV7NCl9Fc11kKvy9I4VpAtuqqf5bn7vD+HlFNuIcuD3rEbEgtu5DlUrDSLfVI4APjgYb9b2fUt7z5Md2j2JRYvIgdfzIZAi2zb5eXGRz5XYETaQW4+9AfzTCL7cPdvh5JtZKVPzQ86Ci0x3+DxJuNQEguuahxdhIzZJCrxOMj9lxp3ATs+MBkZzv5dcNp2e8d9EDllGZYZKbWciXhFEKXaSmnRCqWF2ukDspv3urkJdZrR/O8dUGI0/CJ9dkPi9791kFhwxZXA0KneUIUv6JYc3cpCf9pkZC4iiuhzNwJlI0yqEzKCINt5xjPV8lF5DGKc2yYfELNokPMvKIZenn13G9TNdKfbX4z1NvilhQ2GsYnH0RMLTjji5FjLwy/inpbflfm1vGkf1I6VtGbSBdSJDrdaTuslcdwhZ8K0fEYaFl305iH3o9rwdOaffxf02iegJG73ffchFkJuaY93H+r5V0+4iu5xD190LdEeYPAsVs7N8FjGXfMsC7g2fgGLkMoouHilJO9JjFdClxpPVTJVa+Pz0Nu6v2dBRvLyvwa+N64Wb1jU32TEp2fBlQ+C7n8CCzjAcE1RJSJvzTaJzCSy/D8ZrwwyqTjIsJW0Qtu6qErcbSmLr6NVGwdVVgVn8Q0mlfm4axZBSSwrY+K+UNBNu+CO7/nuQz0LTjhpVmxCpl/ETUln6ofS5ZB56KV3Aw07eZydGgudEaMu26lW8DwUVSVWTcTlCYz/DSmIdYt0h4zU7N+cHTNo5Dzf/I25UXGCc4qH3Bs3mgcnidslJCe4Ey6DbKrsuxNYKK4Alt1hEpmDV6TLfgEUMNbqiTwqr4K1Xlql8k0Zzipl7JZv3Gl30YZYvxx+7plv+L2EoaNXz4Pa9Torn1/rRlrroMZdk1TQlZTgVOlAqIHHsMB93hZIECtXuxZ6Rc83bw0T/dqvoVyeTzJ9TTJL6yhaM3GvgnSXDJMLw3RPSpKbv9VvgK5+2WRkHrqxDvrl7/M6H2lyfCDdQdqBGv9Vk5GY5AQn/51/JwtOGg8BkO6VF77reaSMoGEP1Mr/it3dOBmkUPMoTHGtok+ZulROyyVuqMdqze+WDYd6ZhbchsycReK+ehsbeIzR/czq7YCxvS4dAQydZDISk5xLJariOOhBE1nIHTOBfcAWoCrsBz3/+j53LfL33We/SZ20eceVFOIaZUx1OK1cAS9KVWEsnksWXkgl07RfutVkZA7RbSvhvHMPzytAR69QvxP6nF8l5U6FpAUnqPN/S+uww6R8kl+GyEfzgA19e08q/TpbpVue5/GUm5wkEaV66xboIrsOZSVDYQXUujlwl7GhkiHopno4T1wEVS6d3gEQ41N1GpyRp5uMnvElOAylhSscHMzKCUUDoZ+7AW693KUufPTeT4DXf8aWWIJukER4MVwT3aq/YutA/q565Z/g7s6MdQ/6qSto5Fl5At1qlN+T4cvJ3zHp5PBdcvqMW6Gb60zKJ5FcOBKoP9L99JXewjNIc78IR8TmtxfdoFvqEB3+BVqGWpPjEwktyoYAcy7y55J7gehzP4TasYSxqcx5C4CszMphC39M93Pf4uG75NXEqxk8j41NYQlCbgmctn3A4zNMRjioh86FaqGF6zqElSyt9dAjp8O54B7oATz/oFbeYaUDA+3fj4dO1IfXi7iv3oHIyrtocemtAsHjbtkPdbH//tVAVV2fdTutnEywDFhgMs666x1E534l6C8kjff7D38OqFvHv5t42CUR3uyXKbfEguMp34Wup3iDIlN4XJbf/SeFbuiir/wMztt3AP2PYSpg6bPyRQefAXVkci3TzgQSnBp+ClA5nlYuhdVJhf3hbH8D7rzeXaXvzr0MqHmbgX5wsaFpL/SYa+BUHeclneOnQY+gK5GF3wFRtPSqnbHsfafAbQnQvxmA6LzL4Kyg2IoqTE5AaGyc8283CX8Ev7kbv6V/WQw1gC2cgDGRR1MN2vsdjZyZ81kQAZvmcXBrt0LPuQCRVlqmgoHMCVib3Xa4bc1QV70Ri78MbnMT1IOTeepyB8FckxuA9mZaTwp62r1wxl5sMtOLbmlE9JHPI6eeVt4bNw5YFmLfD2yBnno71KnXmTx/BFeK9AyceZsnmJQoHIhI/RbgD1Pgrp4fuCg68L6/egHUHych4h4w/Usp/Kqc31m/+pTYBFVQyAbUj6AbAnaGdyCzSkrYev3bN6AXfh+6zefi8wTIWbvrX4R+YDJymjaxrKWjO4WyaGuAO3AiEFBsQkq3r/S+eP8pUM27g03Y6wwtia7bDIybBXUezXW+z/n0RNdSuM9/B2rLywAvYkqWV2BgDMYqmNn9+gz3L1+Cs2uF18+YMowT3eKRcCZ/CzjpcpMZDF2zEXj1R8BH82OVJRUrLOgoj68G+uqVUP2Hmkz/pCQ4j2bGH3+YwF+S/pwkxiUTwt+QyX/12xgjngqc81O4gyfCKY7fSesdeAtby5tfBN6YDbXtBaDfcFqNNGybJbOcZQbrt3ksCfCOYfYxULIthIybpopsryGd63KH6YnfhD6OLePKWOzYE7rdhd74CtSS26B2LGWlo9D8LoTpjv1b4V74OJzjppmMYKQuOOJueBHqiQuhykeanFSh8GR+fGsLdAHFxgaGrjqHYqqELiqH2s+4rHkfsO1VWlc+N9cwCC8wFzzl0+FP8MI11UFd8lcgiZaYu2871J/YasvNT0OlE3j+0u0iXTGRfOiyo4AR50IPPp4W9zQ4jBv5CW/SimaFUx8vYlksh6pZxbLYDSVLFdMlNPlLrADR8dchct5PTV5w0iI4+QG98Gao1Y9AlX461kkN/rKUqktzLrv4RFn7ZYqU9IzLQLMUqjzLGlLvEqQDBb2vGvq838I5eZbJ65no+3MReZafL6eFTSdyviK+NlpyaWB460tkC0gWC8vHkbBBykGW58nUIm/UIF1lQdgS1/l0ode9mZZfTYvgDvL014FqWoUgk/gyhfpPoMffCPVZNoh8opfcSXd2K0U3yuT0Bl0vey+Ws+wRUn4C9BWL0ibh9ApOeOKrnqtLqd+rT2CRSov0SLruix81eQF45mZgw7wsPP8utDdBqzyoy9kAKw06InEo6Rec/NrvZOdMukBvRkY2WDqKTaaalx0LzFpi8lJAOps3zmfMKZYuG86/C22NXgyLm7cyLk3vvsUp9hvEQWzvDWsQrZwC3SDDP+kyxr1I/XZER81Ij9iErzyG6Nm/ga6RWSFZJrimWkQLaNG+9XHaxSak38IZvOUPT14GtWUxYzrp3c5E4fHU6UbdIadDzXwy7UfoLrkd6k3GdYX90tR67V285aBDpjKkeIwt3YCTHHqg1wQnyA+rhd8G3ruP7iXFIbB0IzVibzVwxs+AM79nMtOPrGVQc75Adz0MB7cCyzREAvs3wz1qBpyL/2wye4deFdxB1r8CvYDWLpe1xu8Gd72BdC5riv+LDwEjE++FkQ6kgPUDn4FzgAIvrGCpZ5C1l+Gq1iaoaQ9Aje79KWPhCI64siv6Y2dC7dtIF8MWXF+4GLfN61eKDpgE51K60Lx0dY4mh7v4x1Af3Ed3xdgor48rngwlNu2F238snEtYFiU+p9wHJDTBCV5Nf/shqJd+QGtHwcm8uDDcrHQcN9fQc+RDz3jQu49CX9gY7/xrq6GfvhqRPSuBkqpYZ22YSCjRvId1j+V+9s+hJn891LIIVXAdeAX/7M1Q1fNj27IXyvQhFkA6XY2cljfgLAPijJ/GXgk19XsZ03Rx174A9c5vgc2M8YpoXXJo8Xqt8rEsZMRGJpHmlsId/49wzuqbm7f0ieAE74821LAVdxfw4eOxoZtIJDbrwnszyGGJnFiwrXVAlK8LyqHHXgOczoaL42SM2DqjN70BrLgb2P4aK1+jd8yBNvM+BHO2rfuh29vpUUrYQPoxcPwFrODhuM949JngDmH9i3BXPQqsfBBOGWMrmccm46SyBqGj5nvPUpA8ZK/fRV7SiskMC3GbjTsQpatwxl5FVzELGDYl9pksQMtKtqV3Qq99kq3nNXBK2LiQMdKOu8DIeSfyAB0WXcpCxl4ZQrgHGqEmXA1MuBzqmJ73/QiDzBGcQWTk7qmGs/phoKUBzp7VvBg7mUvxte71ZlB4GzcXVMK7AUXFKKB0GDTz9Kk/hFMa/5Y72YTb2gK89yjUzhXwpmptf4tikkols0REeCIuftB7dvjS5fkXM/AfBlU2FNHBJ0IfPxPO4DG90LOfGhknuHjIFGmvdsveJjJbQmq9TEUSq1ZQkvUCS4R3cbwKx9d1O43gmJCBdZlBU3gELSErYDEbYHlldJ0Z2tdnyArBWQ4fMs3iWg5zrOAsoWIFZwkVKzhLqFjBWULFCs4SKlZwllCxgrOEihWcJVSs4CyhYgVnCRUrOEuoWMFZQsUKzhIqVnCWULGCs4SKFZwlVKzgLKFiBWcJFSs4S6hYwVlCBPg/RKkkw3Wnu6sAAAAASUVORK5CYII=";
