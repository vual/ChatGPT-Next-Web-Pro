import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";
// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const isApp = !!getClientConfig()?.isApp;
const en: LocaleType = {
  WIP: "Coming Soon...",
  Error: {
    Unauthorized: isApp
      ? `😆 Oops, there's an issue. No worries:
     \\ 1️⃣ Want to use your own OpenAI resources? [Click here](/#/settings) to change settings ⚙️`
      : `😆 Oops, there's an issue. Let's fix it:
     \ 1️⃣ Using a private setup? [Click here](/#/auth) to enter your key 🔑
     \ 2️⃣ Want to use your own OpenAI resources? [Click here](/#/settings) to change settings ⚙️
     `,
  },
  Auth: {
    Return: "Return",
    Title: "Need Access Code",
    Tips: "Please enter access code below",
    SubTips: "Or enter your OpenAI or Google API Key",
    Input: "access code",
    Confirm: "Confirm",
    Later: "Later",
    SaasTips: "Too Complex, Use Immediately Now",
    TopTips:
      "🥳 NextChat AI launch promotion: Instantly unlock the latest models like OpenAI o1, GPT-4o, Claude-3.5!",
    ObtainAuth: "Auth",
  },
  Login: {
    Title: "AnnYun AI",
    Tips: "Enabling AI To Create Greater Value",
    Account: "Account",
    Password: "Password",
    Confirm: "Login",
    Register: "Register",
    ByUser: "Username",
    ByMobile: "Mobile",
    ByWeChat: "WeChat",
    VerifyCode: "VerifyCode",
    TipsWeChat: "Scan and follow to login",
    Success: "Login Success",
    TokenExpired: "TokenExpired",
  },
  Dall: {
    Num: "Num",
    Quality: "Quality",
    ResponseFormat: "ResponseFormat",
    Size: "Size",
    Style: "Style",
    RevisedPrompt: (prompt: string) => `**RevisedPrompt:**\n${prompt}`,
    FetchImageError: "Can not fetch image!",
  },
  Midjourney: {
    CustomZoom: "Custom Zoom",
    SelectImgMax: (max: number) => `Select up to ${max} images`,
    InputDisabled: "Input is disabled in this mode",
    HasImgTip:
      "Tip: In the mask mode, only the first image will be used. In the blend mode, the five selected images will be used in order (click the image to remove it)",
    Mode: "Mode",
    ModeImagine: "Mask",
    ModeBlend: "Blend",
    ModeDescribe: "Describe",
    InsightFace: "Swap Face",
    Reference: "Reference",
    Engine: "AI Engine",
    EngineMidj: "Actual",
    EngineNiji: "Comic",
    EngineVersion: "Engine Version",
    Size: "Size",
    Quality: "Quality",
    Quality1: "Normal",
    Quality2: "Clearness",
    Quality3: "High Definition",
    Quality4: "Ultra High Definition",
    Chaos: "Chaos",
    Stylize: "Stylize",
    Tile: "Tile",
    Seed: "Seed",
    NeedInputUseImgPrompt:
      "You need to enter content to use the image in the mask mode",
    NeedUploadImg: (min: number) => `You need upload at least ${min} image`,
    BlendMinImg: (min: number, max: number) =>
      `At least ${min} images are required in the mixed image mode, and up to ${max} images are required`,
    TaskErrUnknownType: "Task submission failed: unknown task type",
    TaskErrNotSupportType: (type: string) =>
      `Task submission failed: unsupported task type -> ${type}`,
    StatusCode: (code: number) => `Status code: ${code}`,
    TaskSubmitErr: (err: string) => `Task submission failed: ${err}`,
    RespBody: (body: string) => `Response body: ${body}`,
    None: "None",
    UnknownError: "Unknown error",
    UnknownReason: "Unknown reason",
    TaskPrefix: (prompt: string, taskId: string) =>
      `**Prompt:** ${prompt}\n**Task ID:** ${taskId}\n`,
    PleaseWait: "Please wait a moment",
    TaskSubmitOk: "Task submitted successfully",
    TaskStatusFetchFail: "Failed to get task status",
    TaskStatus: "Task status",
    TaskRemoteSubmit: "Task has been submitted to Midjourney server",
    TaskProgressTip: (progress: number | undefined) =>
      `Task is running${progress ? `, current progress: ${progress}` : ""}`,
    TaskNotStart: "Task has not started",
    Url: "URL",
    Secret: "Secret",
    SettingProxyCoverTip: (param: string) =>
      `Modify here will override the MIDJOURNEY_PROXY_${param} in the environment variables`,
    ImageAgent: "Image Agent",
    ImageAgentOpenTip:
      "After turning it on, the returned Midjourney image will be proxied by this program itself, so this program needs to be in a network environment that can access cdn.discordapp.com to be effective",
    Reset: "Reset",
    ResetTips: "Are you sure to reset all draw config ?",
    Comfirm: "OK",
    DrawListTitle: "All Painting",
    DrawListSubTitle: (num: number) => `${num} records in total`,
  },
  StableDiffusion: {
    InputTips: "use &N follow negative prompt.",
    Models: "Models",
    ApiMode: "Api Mode",
    ModeTxt2Img: "Txt2Img",
    ModeImg2Img: "Ima2Img",
    ModeExtras: "Extras",
    ModePngInfo: "PNG Info",
    Reference: "Image",
    ReferenceOriginal: "Original",
    ReferenceMask: "Mask",
    SamplingMethod: "SamplingMethod",
    Steps: "Steps",
    RestoreFaces: "RestoreFaces",
    Tiling: "Tiling",
    Width: "Width",
    Height: "Height",
    BatchCount: "BatchCount",
    BatchSize: "BatchSize",
    CFGScale: "CFG Scale",
    Seed: "Seed",
    Script: "Script",
    EnableHr: "Hires.fix",
    HrUpscaler: "HrUpscaler",
    HrSteps: "HrSteps",
    HrScale: "HrScale",
    HrResizeX: "HrResizeX",
    HrResizeY: "HrResizeY",
    Denoising: "Denoising",
    Refiner: "Refiner",
    RefinerCheckpoint: "Checkpoint",
    RefinerSwitchAt: "Switch At",

    ResizeMode: "Resize Mode",
    ResizeMode0: "Just resize",
    ResizeMode1: "Crop and resize",
    ResizeMode2: "Resize and fill",
    ResizeMode3: "Jsut resize(Latent upscale)",

    ResizeByScale: "Scale by",
    ResizeByResolution: " Scale to",
    CropToFit: "Crop to fit",
    Visibility: "Visibility",
    GFPGAN: "GFPGAN",
    CodeFormer: "CodeFormer",
    CodeFormerWeight: "CodeFormer Weight",

    ImageMode: "Img2img mode",
    ImageModeDefault: "Img2img",
    ImageModeSketch: "Sketch",
    ImageModeInpaint: "Inpaint",
    ImageModeInpaintSketch: "Inpaint Sketch",
    ImageModeInpaintUpload: "Inpaint Upload",
    MaskBlur: "Mask Blur",
    MaskTransparency: "Mask Transparency",
    MaskMode: "Mask Mode",
    InpaintMasked: "Inpaint Masked",
    InpaintNotMasked: "Inpaint Not Masked",
    MaskedContent: "Masked Content",
    MaskedContentFill: "Fill",
    MaskedContentOriginal: "Original",
    MaskedContentLatentNoise: "Latent Noise",
    MaskedContentLatentNothing: "Latent NoThing",
    InpaintArea: "Inpaint Area",
    InpaintAreaWholePicture: "WholePicture",
    InpaintAreaOnlyMasked: "Masked",
    InpaintFullResPadding: "Only masked padding, pixels",

    NeedUploadImg: "Need upload image",
    Reset: "Reset",
    ResetTips: "Are you sure to reset all settings?",
    Comfirm: "Comfirm",
    ResendTips:
      "Can not retry in this mode, please follow the normal steps to operate again!",
    SelectImg: "Select Image",
    NeedSelectImg: "Please select one image!",

    Txt2ImgAction: "Txt2Img",
    Img2ImgAction: "Img2Img",
    InpaintAction: "Img2Img Inpaint",
    ExtrasAction: "Extras",

    VAE: "VAE",
    ClipSkip: "Clip Skip",

    Lora: "Lora",

    Url: "Interface address",
    SettingProxyCoverTip: (param: string) =>
      `Modify here will override the STABLE_DIFFUSION_${param} in the environment variables`,
  },
  Video: {
    ratio: "Ratio",
    expandPrompt: "ExpandPrompt",
    image: "Reference",
    imageEnd: "Keyframe",
    ResetTips: "Reset?",
    SubmitError: "Submit Error!",
    SubmitSuccess: "Submit Success! Please wait...",
    Download: "Download",
    Continue: "Continue",
    TaskTimeOut: "Task Timeout",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    Processing: "Processing...",
    SubTitle: (count: number) => `${count} messages`,
    EditMessage: {
      Title: "Edit All Messages",
      Topic: {
        Title: "Topic",
        SubTitle: "Change the current topic",
      },
    },
    Actions: {
      ChatList: "Go To Chat List",
      CompressedHistory: "Compressed History Memory Prompt",
      Export: "Export All Messages as Markdown",
      Copy: "Copy",
      Stop: "Stop",
      Retry: "Retry",
      Pin: "Pin",
      PinToastContent: "Pinned 1 messages to contextual prompts",
      PinToastAction: "View",
      Delete: "Delete",
      Edit: "Edit",
      FullScreen: "FullScreen",
      RefreshTitle: "Refresh Title",
      RefreshToast: "Title refresh request sent",
      Speech: "Play",
      StopSpeech: "Stop",
      Upscale: "Upscale",
      Variation: "Variation",
      Speek: "Speek",
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with mask",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      fork: "Copy Chat",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "To Latest",
      Theme: {
        auto: "Auto",
        light: "Light Theme",
        dark: "Dark Theme",
      },
      Prompt: "Prompts",
      Masks: "Masks",
      Clear: "Clear Context",
      Revert: "Revert Context",
      Settings: "Settings",
      UploadImage: "Upload Images",
      DrawSettings: "Draw Settings",
      InputTips: "Please input content!",
      Translate: "Translate",
      TranslateTo:
        "Detect whether user input is in Chinese or English. If most of it is in Chinese, translate Chinese into English and convert punctuation marks; If most of it is in English, then translate English into Chinese and convert punctuation.",
      Waiting: "Waiting...",
      TranslateError: "Translate Error",

      NeedUpload: (num: number) => `NeedUpload ${num} file`,
      Upload: "Upload",
      UploadError: "UploadError",
      UploadPermision: "The current model does not support uploading files!",
      UploadType: (type: string) =>
        `Please upload the file types supported by the current model: ${type} !`,
      Uploading: "Uploading...",
      UploadSuccess: "UploadSuccess!",
      VideoSetting: "VideoSetting",
    },
    Rename: "Rename Chat",
    Typing: "Typing…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      return inputHints + ", / to search prompts, : to use commands";
    },
    Send: "Send",
    StartSpeak: "Start Speak",
    StopSpeak: "Stop Speak",
    Config: {
      Reset: "Reset to Default",
      SaveAs: "Save as Mask",
      Comfirm: "Comfirm",
      ResetSettings: "Reset",
      ResetTips: "Are you sure to reset all settings?",
      SpeechSettings: "SpeechSettings",
    },
    IsContext: "Contextual Prompt",
    ShortcutKey: {
      Title: "Keyboard Shortcuts",
      newChat: "Open New Chat",
      focusInput: "Focus Input Field",
      copyLastMessage: "Copy Last Reply",
      copyLastCode: "Copy Last Code Block",
      showShortcutKey: "Show Shortcuts",
      clearContext: "Clear Context",
    },
    Speech: {
      Voice: "Voice",
      ResponseFormat: "ResponseFormat",
      Speed: "speed",
      FetchAudioError: "FetchAudioError, please check interface or OSS",
      Recording: "Recording:",
      ToTextError: "Voice to text error!",
    },
    Model: {
      Selector: "Model Selector",
      Local: "Local",
      GPTs: "GPTs",
      KnowledgeBase: "Knowledge Base",
      SearchPlaceholder: "Please input value",
    },
  },
  Export: {
    Title: "Export Messages",
    Copy: "Copy All",
    Download: "Download",
    MessageFromYou: "Message From You",
    MessageFromChatGPT: "Message From ChatGPT",
    Share: "Share to ShareGPT",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown or PNG Image",
    },
    IncludeContext: {
      Title: "Including Context",
      SubTitle: "Export context prompts in mask or not",
    },
    Steps: {
      Select: "Select",
      Preview: "Preview",
    },
    Image: {
      Toast: "Capturing Image...",
      Modal: "Long press or right click to save image",
    },
    Artifacts: {
      Title: "Share Artifacts",
      Error: "Share Error",
    },
  },
  Select: {
    Search: "Search",
    All: "Select All",
    Latest: "Select Latest",
    Clear: "Clear",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
    Copy: "Copy Memory",
    Reset: "Reset Session",
    ResetConfirm:
      "Resetting will clear the current conversation history and historical memory. Are you sure you want to reset?",
  },
  Home: {
    NewChat: "New Chat",
    DeleteChat: "Confirm to delete the selected conversation?",
    DeleteToast: "Chat Deleted",
    Revert: "Revert",
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",
    ShowPassword: "ShowPassword",
    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "All Languages",
    },
    Avatar: "Avatar",
    UploadAvatar: "Click on the avatar to upload an image as a new avatar",
    Nickname: "Nickname",
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },
    FontFamily: {
      Title: "Chat Font Family",
      SubTitle:
        "Font Family of the chat content, leave empty to apply global default font",
      Placeholder: "Font Family Name",
    },
    InjectSystemPrompts: {
      Title: "Inject System Prompts",
      SubTitle: "Inject a global system prompt for every request",
    },
    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Latest version",
      CheckUpdate: "Check Update",
      IsChecking: "Checking update...",
      FoundUpdate: (x: string) => `Found new version: ${x}`,
      GoToUpdate: "Update",
      Success: "Update Successful.",
      Failed: "Update Failed.",
      UpdateLog: "Update Log",
    },
    SendKey: "Send Key",
    Theme: "Theme",
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "Send Preview Bubble",
      SubTitle: "Preview markdown in bubble",
    },
    AutoGenerateTitle: {
      Title: "Auto Generate Title",
      SubTitle: "Generate a suitable title based on the conversation content",
    },
    Sync: {
      CloudState: "Last Update",
      NotSyncYet: "Not sync yet",
      Success: "Sync Success",
      Fail: "Sync Fail",

      Config: {
        Modal: {
          Title: "Config Sync",
          Check: "Check Connection",
        },
        SyncType: {
          Title: "Sync Type",
          SubTitle: "Choose your favorite sync service",
        },
        Proxy: {
          Title: "Enable CORS Proxy",
          SubTitle: "Enable a proxy to avoid cross-origin restrictions",
        },
        ProxyUrl: {
          Title: "Proxy Endpoint",
          SubTitle:
            "Only applicable to the built-in CORS proxy for this project",
        },

        WebDav: {
          Endpoint: "WebDAV Endpoint",
          UserName: "User Name",
          Password: "Password",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "Backup Name",
          Password: "UpStash Redis REST Token",
        },
      },

      LocalState: "Local Data",
      Overview: (overview: any) => {
        return `${overview.chat} chats，${overview.message} messages，${overview.prompt} prompts，${overview.mask} masks`;
      },
      ImportFailed: "Failed to import from file",
      LocalDataSize: "Storage occupancy",
      LocalDataSizeTips: "Local data storage occupancy",
    },
    Mask: {
      Splash: {
        Title: "Mask Splash Screen",
        SubTitle: "Show a mask splash screen before starting new chat",
      },
      Builtin: {
        Title: "Hide Builtin Masks",
        SubTitle: "Hide builtin masks in mask list",
      },
    },
    Prompt: {
      Disable: {
        Title: "Disable auto-completion",
        SubTitle: "Input / to trigger auto-completion",
      },
      List: "Prompt List",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} built-in, ${custom} user-defined`,
      Edit: "Edit",
      Modal: {
        Title: "Prompt List",
        Add: "Add One",
        Search: "Search Prompts",
      },
      EditModal: {
        Title: "Edit Prompt",
      },
    },
    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },

    Usage: {
      Title: "Account Balance",
      SubTitle(used: any, total: any) {
        return `Used this month $${used}, subscription $${total}`;
      },
      IsChecking: "Checking...",
      Check: "Check",
      NoAccess: "Enter API Key to check balance",
    },
    Access: {
      SaasStart: {
        Title: "Use NextChat AI",
        Label: " (Most Cost-Effective Option)",
        SubTitle:
          "Maintained by NextChat, zero setup needed, unlock OpenAI o1, GPT-4o," +
          " Claude-3.5 and more",
        ChatNow: "Start Now",
      },
      AccessCode: {
        Title: "Access Code",
        SubTitle: "Access control Enabled",
        Placeholder: "Enter Code",
      },
      CustomEndpoint: {
        Title: "Custom Endpoint",
        SubTitle: "Use custom Azure or OpenAI service",
      },
      Provider: {
        Title: "Model Provider",
        SubTitle: "Select Azure or OpenAI",
      },
      OpenAI: {
        ApiKey: {
          Title: "OpenAI API Key",
          SubTitle: "User custom OpenAI Api Key",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "OpenAI Endpoint",
          SubTitle: "Must start with http(s):// or use /api/openai as default",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Azure Api Key",
          SubTitle: "Check your api key from Azure console",
          Placeholder: "Azure Api Key",
        },

        Endpoint: {
          Title: "Azure Endpoint",
          SubTitle: "Example: ",
        },

        ApiVerion: {
          Title: "Azure Api Version",
          SubTitle: "Check your api version from azure console",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "Anthropic API Key",
          SubTitle:
            "Use a custom Anthropic Key to bypass password access restrictions",
          Placeholder: "Anthropic API Key",
        },

        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },

        ApiVerion: {
          Title: "API Version (claude api version)",
          SubTitle: "Select and input a specific API version",
        },
      },
      Baidu: {
        ApiKey: {
          Title: "Baidu API Key",
          SubTitle: "Use a custom Baidu API Key",
          Placeholder: "Baidu API Key",
        },
        SecretKey: {
          Title: "Baidu Secret Key",
          SubTitle: "Use a custom Baidu Secret Key",
          Placeholder: "Baidu Secret Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "not supported, configure in .env",
        },
      },
      Tencent: {
        ApiKey: {
          Title: "Tencent API Key",
          SubTitle: "Use a custom Tencent API Key",
          Placeholder: "Tencent API Key",
        },
        SecretKey: {
          Title: "Tencent Secret Key",
          SubTitle: "Use a custom Tencent Secret Key",
          Placeholder: "Tencent Secret Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "not supported, configure in .env",
        },
      },
      ByteDance: {
        ApiKey: {
          Title: "ByteDance API Key",
          SubTitle: "Use a custom ByteDance API Key",
          Placeholder: "ByteDance API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Alibaba: {
        ApiKey: {
          Title: "Alibaba API Key",
          SubTitle: "Use a custom Alibaba Cloud API Key",
          Placeholder: "Alibaba Cloud API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Moonshot: {
        ApiKey: {
          Title: "Moonshot API Key",
          SubTitle: "Use a custom Moonshot API Key",
          Placeholder: "Moonshot API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      DeepSeek: {
        ApiKey: {
          Title: "DeepSeek API Key",
          SubTitle: "Use a custom DeepSeek API Key",
          Placeholder: "DeepSeek API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      XAI: {
        ApiKey: {
          Title: "XAI API Key",
          SubTitle: "Use a custom XAI API Key",
          Placeholder: "XAI API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      ChatGLM: {
        ApiKey: {
          Title: "ChatGLM API Key",
          SubTitle: "Use a custom ChatGLM API Key",
          Placeholder: "ChatGLM API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      SiliconFlow: {
        ApiKey: {
          Title: "SiliconFlow API Key",
          SubTitle: "Use a custom SiliconFlow API Key",
          Placeholder: "SiliconFlow API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Stability: {
        ApiKey: {
          Title: "Stability API Key",
          SubTitle: "Use a custom Stability API Key",
          Placeholder: "Stability API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Iflytek: {
        ApiKey: {
          Title: "Iflytek API Key",
          SubTitle: "Use a Iflytek API Key",
          Placeholder: "Iflytek API Key",
        },
        ApiSecret: {
          Title: "Iflytek API Secret",
          SubTitle: "Use a Iflytek API Secret",
          Placeholder: "Iflytek API Secret",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      CustomModel: {
        Title: "Custom Models",
        SubTitle: "Custom model options, seperated by comma",
      },
      Google: {
        ApiKey: {
          Title: "API Key",
          SubTitle: "Obtain your API Key from Google AI",
          Placeholder: "Google AI API Key",
        },

        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },

        ApiVersion: {
          Title: "API Version (specific to gemini-pro)",
          SubTitle: "Select a specific API version",
        },
        GoogleSafetySettings: {
          Title: "Google Safety Settings",
          SubTitle: "Select a safety filtering level",
        },
      },
      AI302: {
        ApiKey: {
          Title: "302.AI API Key",
          SubTitle: "Use a custom 302.AI API Key",
          Placeholder: "302.AI API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
    },

    Model: "Model",
    CompressModel: {
      Title: "Summary Model",
      SubTitle: "Model used to compress history and generate title",
    },
    Temperature: {
      Title: "Temperature",
      SubTitle: "A larger value makes the more random output",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Do not alter this value together with temperature",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximum length of input tokens and generated tokens",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "A larger value increases the likelihood to talk about new topics",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "A larger value decreasing the likelihood to repeat the same line",
    },
    TTS: {
      Enable: {
        Title: "Enable TTS",
        SubTitle: "Enable text-to-speech service",
      },
      Autoplay: {
        Title: "Enable Autoplay",
        SubTitle:
          "Automatically generate speech and play, you need to enable the text-to-speech switch first",
      },
      Model: "Model",
      Voice: {
        Title: "Voice",
        SubTitle: "The voice to use when generating the audio",
      },
      Speed: {
        Title: "Speed",
        SubTitle: "The speed of the generated audio",
      },
      Engine: "TTS Engine",
    },
    Realtime: {
      Enable: {
        Title: "Realtime Chat",
        SubTitle: "Enable realtime chat feature",
      },
      Provider: {
        Title: "Model Provider",
        SubTitle: "Switch between different providers",
      },
      Model: {
        Title: "Model",
        SubTitle: "Select a model",
      },
      ApiKey: {
        Title: "API Key",
        SubTitle: "API Key",
        Placeholder: "API Key",
      },
      Azure: {
        Endpoint: {
          Title: "Endpoint",
          SubTitle: "Endpoint",
        },
        Deployment: {
          Title: "Deployment Name",
          SubTitle: "Deployment Name",
        },
      },
      Temperature: {
        Title: "Randomness (temperature)",
        SubTitle: "Higher values result in more random responses",
      },
    },
    Speech: {
      Lang: "Lang",
      Voice: "Voice",
    },
  },
  Store: {
    DefaultTopic: "New Conversation",
    BotHello: "Hello! How can I assist you today?",
    Error: "Something went wrong, please try again later.",
    Prompt: {
      History: (content: string) =>
        "This is a summary of the chat history as a recap: " + content,
      Topic:
        "Please generate a four to five word title summarizing our conversation without any lead-in, punctuation, quotation marks, periods, symbols, bold text, or additional text. Remove enclosing quotation marks.",
      Summarize:
        "Summarize the discussion briefly in 200 words or less to use as a prompt for future context.",
    },
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Download: {
    Success: "Content downloaded to your directory.",
    Failed: "Download failed.",
  },
  Context: {
    Toast: (x: any) => `With ${x} contextual prompts`,
    Edit: "Current Chat Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared, click here to revert",
    Revert: "Revert",
  },
  Discovery: {
    Name: "Discovery",
  },
  Mcp: {
    Name: "MCP",
  },
  FineTuned: {
    Sysmessage: "You are an assistant that",
  },
  SearchChat: {
    Name: "Search",
    Page: {
      Title: "Search Chat History",
      Search: "Enter search query to search chat history",
      NoResult: "No results found",
      NoData: "No data",
      Loading: "Loading...",

      SubTitle: (count: number) => `Found ${count} results`,
    },
    Item: {
      View: "View",
    },
  },
  Plugin: {
    Name: "Plugin",
    Page: {
      Title: "Plugins",
      SubTitle: (count: number) => `${count} plugins`,
      Search: "Search Plugin",
      Create: "Create",
      Find: "You can find awesome plugins on github: ",
    },
    Item: {
      Info: (count: number) => `${count} method`,
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    Auth: {
      None: "None",
      Basic: "Basic",
      Bearer: "Bearer",
      Custom: "Custom",
      CustomHeader: "Parameter Name",
      Token: "Token",
      Proxy: "Using Proxy",
      ProxyDescription: "Using proxies to solve CORS error",
      Location: "Location",
      LocationHeader: "Header",
      LocationQuery: "Query",
      LocationBody: "Body",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Edit Plugin ${readonly ? "(readonly)" : ""}`,
      Download: "Download",
      Auth: "Authentication Type",
      Content: "OpenAPI Schema",
      Load: "Load From URL",
      Method: "Method",
      Error: "OpenAPI Schema Error",
    },
  },
  Mask: {
    Name: "Mask",
    Page: {
      Title: "Prompt Template",
      SubTitle: (count: number) => `${count} prompt templates`,
      Search: "Search Templates",
      Create: "Create",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Chat",
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Edit Prompt Template ${readonly ? "(readonly)" : ""}`,
      Download: "Download",
      Clone: "Clone",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Bot Name",
      Sync: {
        Title: "Use Global Config",
        SubTitle: "Use global config in this chat",
        Confirm: "Confirm to override custom config with global config?",
      },
      HideContext: {
        Title: "Hide Context Prompts",
        SubTitle: "Do not show in-context prompts in chat",
      },
      Artifacts: {
        Title: "Enable Artifacts",
        SubTitle: "Can render HTML page when enable artifacts.",
      },
      CodeFold: {
        Title: "Enable CodeFold",
        SubTitle:
          "Automatically collapse/expand overly long code blocks when CodeFold is enabled",
      },
      Share: {
        Title: "Share This Mask",
        SubTitle: "Generate a link to this mask",
        Action: "Copy Link",
      },
    },
  },
  NewChat: {
    Return: "Return",
    Skip: "Just Start",
    Title: "Pick a Mask",
    SubTitle: "Chat with the Soul behind the Mask",
    More: "Find More",
    NotShow: "Never Show Again",
    ConfirmNoShow: "Confirm to disable？You can enable it in settings later.",
  },

  UI: {
    Confirm: "Confirm",
    Cancel: "Cancel",
    Close: "Close",
    Create: "Create",
    Edit: "Edit",
    Export: "Export",
    Import: "Import",
    Sync: "Sync",
    Config: "Config",
  },
  Exporter: {
    Description: {
      Title: "Only messages after clearing the context will be displayed",
    },
    Model: "Model",
    Messages: "Messages",
    Topic: "Topic",
    Time: "Time",
  },
  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },
  SdPanel: {
    Prompt: "Prompt",
    NegativePrompt: "Negative Prompt",
    PleaseInput: (name: string) => `Please input ${name}`,
    AspectRatio: "Aspect Ratio",
    ImageStyle: "Image Style",
    OutFormat: "Output Format",
    AIModel: "AI Model",
    ModelVersion: "Model Version",
    Submit: "Submit",
    ParamIsRequired: (name: string) => `${name} is required`,
    Styles: {
      D3Model: "3d-model",
      AnalogFilm: "analog-film",
      Anime: "anime",
      Cinematic: "cinematic",
      ComicBook: "comic-book",
      DigitalArt: "digital-art",
      Enhance: "enhance",
      FantasyArt: "fantasy-art",
      Isometric: "isometric",
      LineArt: "line-art",
      LowPoly: "low-poly",
      ModelingCompound: "modeling-compound",
      NeonPunk: "neon-punk",
      Origami: "origami",
      Photographic: "photographic",
      PixelArt: "pixel-art",
      TileTexture: "tile-texture",
    },
  },
  Sd: {
    SubTitle: (count: number) => `${count} images`,
    Actions: {
      Params: "See Params",
      Copy: "Copy Prompt",
      Delete: "Delete",
      Retry: "Retry",
      ReturnHome: "Return Home",
      History: "History",
    },
    EmptyRecord: "No images yet",
    Status: {
      Name: "Status",
      Success: "Success",
      Error: "Error",
      Wait: "Waiting",
      Running: "Running",
    },
    Danger: {
      Delete: "Confirm to delete?",
    },
    GenerateParams: "Generate Params",
    Detail: "Detail",
  },
  Sidebar: {
    ChatSettings: "ChatSettings",
    UserCenter: "UserCenter",
  },
  Mj: {
    SubTitle: (count: number) => `${count} images`,
    Actions: {
      Params: "See Params",
      Copy: "Copy Prompt",
      Delete: "Delete",
      Retry: "Retry",
      ReturnHome: "Return Home",
      History: "History",
    },
    EmptyRecord: "No images yet",
    Status: {
      Name: "Status",
      Success: "Success",
      Error: "Error",
      Wait: "Waiting",
      Running: "Running",
    },
    Danger: {
      Delete: "Confirm to delete?",
    },
    GenerateParams: "Generate Params",
    Detail: "Detail",
  },
  MjPanel: {
    Prompt: "Prompt",
    NegativePrompt: "Negative Prompt",
    PleaseInput: (name: string) => `Please input ${name}`,
    AspectRatio: "Aspect Ratio",
    AIModel: "AI Model",
    AIAction: "AI Action",
    ModelVersion: "Model Version",
    Submit: "Submit",
    TaskId: "Task ID",
    ParamIsRequired: (name: string) => `${name} is required`,
    Imagine: "Imagine",
    Blend: "Blend",
    Describe: "Describe",
    VaryRegion: "Vary Region",
    SubmitRegion: "Submit Vary Region",
    ImagineParam: {
      IwImage: "Reference image",
      IwImageTip:
        "Up to 2 images can be removed by selecting and clicking on the image",
      IwTitle: "Reference image weight",
      IwTip: "The range is 0.0~2.0",
      SeedTip: "The range is 0~4294967294",
    },
    BlendParam: {
      ImageTitle: "Blend image",
      ImageTip:
        "At least 2, at most 5, select the image and click on it to remove it",
      Dimensions: "Dimensions",
    },
    DescribeParam: {
      ImageTitle: "Describe image",
      ImageTip: "After selecting the image, click on it to remove it",
    },
  },
};

export default en;
