import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";

const isApp = !!getClientConfig()?.isApp;

const cn = {
  WIP: "该功能仍在开发中……",
  Error: {
    Unauthorized: isApp
      ? `😆 对话遇到了一些问题，不用慌:
       \\ 1️⃣ 如果你想消耗自己的 OpenAI 资源，点击[这里](/#/settings)修改设置 ⚙️`
      : `😆 对话遇到了一些问题，不用慌:
       \ 1️⃣ 如果你有密码或者秘钥，点击[这里](/#/auth)输入访问密码或秘钥 🔑
       \ 2️⃣ 如果你想消耗自己的 OpenAI 资源，点击[这里](/#/settings)修改设置 ⚙️
       `,
  },
  Auth: {
    Return: "返回",
    Title: "需要密码",
    Tips: "管理员开启了密码验证，请在下方填入访问码",
    SubTips: "或者输入你的 OpenAI 或 Google AI 密钥",
    Input: "在此处填写访问码",
    Confirm: "确认",
    Later: "稍后再说",
    SaasTips: "配置太麻烦，想要立即使用",
    TopTips:
      "🥳 NextChat AI 首发优惠，立刻解锁 OpenAI o1, GPT-4o, Claude-3.5 等最新大模型",
    ObtainAuth: "授权",
  },
  Login: {
    Title: "AnnYun AI",
    Tips: "让AI创造更大价值",
    Account: "账号",
    Password: "密码",
    Confirm: "登录",
    Register: "注册",
    ByUser: "用户名",
    ByMobile: "手机",
    ByWeChat: "微信",
    VerifyCode: "验证码",
    TipsWeChat: "扫码关注公众号授权登录",
    Success: "登录成功",
    TokenExpired: "登录过期，请重新登录",
  },
  Dall: {
    Num: "生成图片数量",
    Quality: "图片质量",
    ResponseFormat: "返回数据格式",
    Size: "分辨率",
    Style: "风格",
    RevisedPrompt: (prompt: string) => `**修饰后的提示词:**\n${prompt}`,
    FetchImageError: "获取图片失败！",
  },
  Midjourney: {
    CustomZoom: "自定义变焦",
    SelectImgMax: (max: number) => `最多可选择 ${max} 张图片`,
    InputDisabled: "该模式下不支持输入内容",
    HasImgTip:
      "提示：垫图模式/识图(describe)模式只会使用第一张图片，混图(blend)模式会按顺序使用选中的5张图片（点击图片可以移除）",
    Mode: "模式",
    ModeImagine: "以文生图",
    ModeBlend: "多图融合",
    ModeDescribe: "识图生文",
    InsightFace: "AI换脸",
    Reference: "参考图",
    Engine: "AI引擎",
    EngineMidj: "写实(Midjourney)",
    EngineNiji: "动漫(Niji)",
    EngineVersion: "引擎版本",
    Size: "尺寸比例",
    Quality: "画质",
    Quality1: "一般",
    Quality2: "清晰",
    Quality3: "高清",
    Quality4: "超高清",
    Chaos: "混乱程度",
    Stylize: "风格化",
    Tile: "纹理平铺",
    Seed: "种子",
    NeedInputUseImgPrompt: "以文生图模式下需要输入内容才能生成图片",
    NeedUploadImg: (min: number) => `该模式下至少需要 ${min} 张图片`,
    BlendMinImg: (min: number, max: number) =>
      `多图融合模式下至少需要 ${min} 张图片，至多 ${max} 张图片`,
    TaskErrUnknownType: "任务提交失败：未知的任务类型",
    TaskErrNotSupportType: (type: string) =>
      `任务提交失败：不支持的任务类型 -> ${type}`,
    StatusCode: (code: number) => `状态码：${code}`,
    TaskSubmitErr: (err: string) => `任务提交失败：${err}`,
    RespBody: (body: string) => `响应体：${body}`,
    None: "无",
    UnknownError: "未知错误",
    UnknownReason: "未知原因",
    TaskPrefix: (prompt: string, taskId: string) =>
      `**画面描述:** ${prompt}\n**任务ID:** ${taskId}\n`,
    PleaseWait: "请稍等片刻",
    TaskSubmitOk: "任务提交成功",
    TaskStatusFetchFail: "任务状态获取失败",
    TaskStatus: "任务状态",
    TaskRemoteSubmit: "任务已提交至Midjourney服务器",
    TaskProgressTip: (progress: number | undefined) =>
      `任务正在运行${progress ? `，当前进度：${progress}` : ""}`,
    TaskNotStart: "任务尚未开始",
    Url: "地址",
    Secret: "密钥",
    SettingProxyCoverTip: (param: string) =>
      `修改此处会覆盖环境变量中的MIDJOURNEY_PROXY_${param}`,
    ImageAgent: "图像代理",
    ImageAgentOpenTip:
      "开启之后，返回的Midjourney图片将会通过本程序自身代理，所以本程序需要处于可以访问cdn.discordapp.com的网络环境中才有效",
    Reset: "重置",
    ResetTips: "确定重置所有绘图设置？",
    Comfirm: "确定",
    DrawListTitle: "所有绘图",
    DrawListSubTitle: (num: number) => `共${num}条记录`,
  },
  StableDiffusion: {
    InputTips: "使用 &N 可以添加负向提示词，需要空格分隔。",
    Models: "绘图模型",
    ApiMode: "绘图模式",
    ModeTxt2Img: "以文生图",
    ModeImg2Img: "以图生图",
    ModeExtras: "后期处理",
    ModePngInfo: "PNG信息",
    Reference: "素材图片",
    ReferenceOriginal: "原图",
    ReferenceMask: "遮罩图",
    SamplingMethod: "采样方法",
    Steps: "迭代步数",
    RestoreFaces: "面部修复",
    Tiling: "纹理平铺",
    Width: "宽度",
    Height: "高度",
    BatchCount: "生成批次",
    BatchSize: "每批数量",
    CFGScale: "提示词引导系数",
    Seed: "种子",
    Script: "脚本",
    EnableHr: "高清修复",
    HrUpscaler: "放大算法",
    HrSteps: "重绘迭代步数",
    HrScale: "放大倍率",
    HrResizeX: "宽度调整到",
    HrResizeY: "高度调整到",
    Denoising: "重绘幅度",

    Refiner: "精修",
    RefinerCheckpoint: "精修模型",
    RefinerSwitchAt: "切换时机",

    ResizeMode: "尺寸调整方式",
    ResizeMode0: "直接调整",
    ResizeMode1: "裁剪调整",
    ResizeMode2: "填充调整",
    ResizeMode3: "隐性调整",

    ResizeByScale: "按倍率",
    ResizeByResolution: "按分辨率",
    CropToFit: "裁剪的合适大小",
    Visibility: "可见性",
    GFPGAN: "GFPGAN",
    CodeFormer: "CodeFormer",
    CodeFormerWeight: "CodeFormer权重",

    ImageMode: "图生图模式",
    ImageModeDefault: "默认",
    ImageModeSketch: "涂鸦",
    ImageModeInpaint: "重绘",
    ImageModeInpaintSketch: "涂鸦重绘",
    ImageModeInpaintUpload: "遮罩重绘",
    MaskBlur: "遮罩模糊",
    MaskTransparency: "遮罩透明度",
    MaskMode: "遮罩模式",
    InpaintMasked: "重绘加遮罩",
    InpaintNotMasked: "重绘不加遮罩",
    MaskedContent: "遮罩内容",
    MaskedContentFill: "填充",
    MaskedContentOriginal: "原本",
    MaskedContentLatentNoise: "LatentNoise",
    MaskedContentLatentNothing: "LatentNoThing",
    InpaintArea: "重绘区域",
    InpaintAreaWholePicture: "整张图片",
    InpaintAreaOnlyMasked: "仅遮罩",
    InpaintFullResPadding: "重绘边界",

    NeedUploadImg: "请上传图片",
    Reset: "重置",
    ResetTips: "确定重置所有绘图设置？",
    Comfirm: "确定",
    ResendTips: "该模式下无法重试，请按正常步骤重新操作！",
    SelectImg: "选择图片",
    NeedSelectImg: "请选择图片！",

    Txt2ImgAction: "文生图",
    Img2ImgAction: "图生图",
    InpaintAction: "图生图重绘",
    ExtrasAction: "后期处理",

    VAE: "VAE",
    ClipSkip: "Clip Skip",

    Lora: "Lora",

    Url: "接口地址",
    SettingProxyCoverTip: (param: string) =>
      `修改此处会覆盖环境变量中的STABLE_DIFFUSION_${param}`,
  },
  Video: {
    ratio: "视频比例",
    expandPrompt: "提示词优化",
    image: "参考图",
    imageEnd: "关键帧",
    ResetTips: "确定重置所有设置？",
    SubmitError: "任务提交失败！",
    SubmitSuccess: "任务提交成功！请等待...",
    Download: "下载",
    Continue: "继续生成",
    TaskTimeOut: "任务超时",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} 条对话`,
  },
  Chat: {
    Processing: "正在处理...",
    SubTitle: (count: number) => `共 ${count} 条对话`,
    EditMessage: {
      Title: "编辑消息记录",
      Topic: {
        Title: "聊天主题",
        SubTitle: "更改当前聊天主题",
      },
    },
    Actions: {
      ChatList: "查看消息列表",
      CompressedHistory: "查看压缩后的历史 Prompt",
      Export: "导出聊天记录",
      Copy: "复制",
      Stop: "停止",
      Retry: "重试",
      Pin: "固定",
      PinToastContent: "已将 1 条对话固定至预设提示词",
      PinToastAction: "查看",
      Delete: "删除",
      Edit: "编辑",
      FullScreen: "全屏",
      RefreshTitle: "刷新标题",
      RefreshToast: "已发送刷新标题请求",
      Speech: "朗读",
      StopSpeech: "停止",
      Upscale: "大图",
      Variation: "改进",
      Speek: "播放",
    },
    Commands: {
      new: "新建聊天",
      newm: "从面具新建聊天",
      next: "下一个聊天",
      prev: "上一个聊天",
      clear: "清除上下文",
      fork: "复制聊天",
      del: "删除聊天",
    },
    InputActions: {
      Stop: "停止响应",
      ToBottom: "滚到最新",
      Theme: {
        auto: "自动主题",
        light: "亮色模式",
        dark: "深色模式",
      },
      Prompt: "快捷指令",
      Masks: "所有面具",
      Clear: "清除上下文",
      Revert: "恢复上下文",
      Settings: "对话设置",
      UploadImage: "上传图片",
      DrawSettings: "绘图设置",
      InputTips: "请输入内容！",
      Translate: "翻译",
      TranslateTo:
        "检测用户输入是中文还是英文，如果大部分都是中文，则把中文翻译成英文，标点符号也要转换；如果大部分是英文，则把英文翻译成中文，标点符号也要转换。",
      Waiting: "请稍等...",
      TranslateError: "翻译出错！",

      NeedUpload: (num: number) => `请上传${num}文件！`,
      Upload: "上传文件",
      UploadError: "上传出错",
      UploadPermision: "当前模型不支持上传文件！",
      UploadType: (type: string) => `请上传当前模型支持的文件类型：${type} !`,
      Uploading: "上传中，请稍等！",
      UploadSuccess: "上传成功！",
      VideoSetting: "视频设置",
    },
    Rename: "重命名对话",
    Typing: "正在输入…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} 发送`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += "，Shift + Enter 换行";
      }
      return inputHints + "，/ 触发补全，: 触发命令";
    },
    Send: "发送",
    StartSpeak: "说话",
    StopSpeak: "停止",
    Config: {
      Reset: "清除记忆",
      SaveAs: "存为面具",
      Comfirm: "确定",
      ResetSettings: "重置",
      ResetTips: "确定重置所有设置？",
      SpeechSettings: "语音设置",
    },
    IsContext: "预设提示词",
    ShortcutKey: {
      Title: "键盘快捷方式",
      newChat: "打开新聊天",
      focusInput: "聚焦输入框",
      copyLastMessage: "复制最后一个回复",
      copyLastCode: "复制最后一个代码块",
      showShortcutKey: "显示快捷方式",
      clearContext: "清除上下文",
    },
    Speech: {
      Voice: "声音",
      ResponseFormat: "返回数据格式",
      Speed: "速率",
      FetchAudioError: "获取音频文件出错，请检查接口或OSS配置",
      Recording: "录音中：",
      ToTextError: "语音转文字出错！",
    },
    Model: {
      Selector: "选择模型",
      Local: "本地模型",
      GPTs: "GPT商店",
      KnowledgeBase: "知识库",
      SearchPlaceholder: "请输入名称",
    },
  },
  Export: {
    Title: "分享聊天记录",
    Copy: "全部复制",
    Download: "下载文件",
    Share: "分享到 ShareGPT",
    MessageFromYou: "用户",
    MessageFromChatGPT: "ChatGPT",
    Format: {
      Title: "导出格式",
      SubTitle: "可以导出 Markdown 文本或者 PNG 图片",
    },
    IncludeContext: {
      Title: "包含面具上下文",
      SubTitle: "是否在消息中展示面具上下文",
    },
    Steps: {
      Select: "选取",
      Preview: "预览",
    },
    Image: {
      Toast: "正在生成截图",
      Modal: "长按或右键保存图片",
    },
    Artifacts: {
      Title: "分享页面",
      Error: "分享失败",
    },
  },
  Select: {
    Search: "搜索消息",
    All: "选取全部",
    Latest: "最近几条",
    Clear: "清除选中",
  },
  Memory: {
    Title: "历史摘要",
    EmptyContent: "对话内容过短，无需总结",
    Send: "自动压缩聊天记录并作为上下文发送",
    Copy: "复制摘要",
    Reset: "[unused]",
    ResetConfirm: "确认清空历史摘要？",
  },
  Home: {
    NewChat: "新的聊天",
    DeleteChat: "确认删除选中的对话？",
    DeleteToast: "已删除会话",
    Revert: "撤销",
  },
  Settings: {
    Title: "设置",
    SubTitle: "所有设置选项",
    ShowPassword: "显示密码",

    Danger: {
      Reset: {
        Title: "重置所有设置",
        SubTitle: "重置所有设置项回默认值",
        Action: "立即重置",
        Confirm: "确认重置所有设置？",
      },
      Clear: {
        Title: "清除所有数据",
        SubTitle: "清除所有聊天、设置数据",
        Action: "立即清除",
        Confirm: "确认清除所有聊天、设置数据？",
      },
    },
    Lang: {
      Name: "Language", // 注意：如果要添加新的翻译，请不要翻译此值，将它保留为 `Language`
      All: "所有语言",
    },
    Avatar: "头像",
    UploadAvatar: "点击头像可以上传图片作为新的头像",
    Nickname: "昵称",
    FontSize: {
      Title: "字体大小",
      SubTitle: "聊天内容的字体大小",
    },
    FontFamily: {
      Title: "聊天字体",
      SubTitle: "聊天内容的字体，若置空则应用全局默认字体",
      Placeholder: "字体名称",
    },
    InjectSystemPrompts: {
      Title: "注入系统级提示信息",
      SubTitle: "强制给每次请求的消息列表开头添加一个模拟 ChatGPT 的系统提示",
    },
    InputTemplate: {
      Title: "用户输入预处理",
      SubTitle: "用户最新的一条消息会填充到此模板",
    },

    Update: {
      Version: (x: string) => `当前版本：${x}`,
      IsLatest: "已是最新版本",
      CheckUpdate: "检查更新",
      IsChecking: "正在检查更新...",
      FoundUpdate: (x: string) => `发现新版本：${x}`,
      GoToUpdate: "前往更新",
      Success: "更新成功！",
      Failed: "更新失败",
      UpdateLog: "查看更新记录",
    },
    SendKey: "发送键",
    Theme: "主题",
    TightBorder: "无边框模式",
    SendPreviewBubble: {
      Title: "预览气泡",
      SubTitle: "在预览气泡中预览 Markdown 内容",
    },
    AutoGenerateTitle: {
      Title: "自动生成标题",
      SubTitle: "根据对话内容生成合适的标题",
    },
    Sync: {
      CloudState: "云端数据",
      NotSyncYet: "还没有进行过同步",
      Success: "同步成功",
      Fail: "同步失败",

      Config: {
        Modal: {
          Title: "配置云同步",
          Check: "检查可用性",
        },
        SyncType: {
          Title: "同步类型",
          SubTitle: "选择喜爱的同步服务器",
        },
        Proxy: {
          Title: "启用代理",
          SubTitle: "在浏览器中同步时，必须启用代理以避免跨域限制",
        },
        ProxyUrl: {
          Title: "代理地址",
          SubTitle: "仅适用于本项目自带的跨域代理",
        },

        WebDav: {
          Endpoint: "WebDAV 地址",
          UserName: "用户名",
          Password: "密码",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "备份名称",
          Password: "UpStash Redis REST Token",
        },
      },

      LocalState: "本地数据",
      Overview: (overview: any) => {
        return `${overview.chat} 次对话，${overview.message} 条消息，${overview.prompt} 条提示词，${overview.mask} 个面具`;
      },
      ImportFailed: "导入失败",
      LocalDataSize: "存储占用",
      LocalDataSizeTips:
        "本地数据存储占用情况，浏览器LocalStorage只有5M，存储快满时，建议把数据导出备份，然后删除",
    },
    Mask: {
      Splash: {
        Title: "面具启动页",
        SubTitle: "新建聊天时，展示面具启动页",
      },
      Builtin: {
        Title: "隐藏内置面具",
        SubTitle: "在所有面具列表中隐藏内置面具",
      },
    },
    Prompt: {
      Disable: {
        Title: "禁用提示词自动补全",
        SubTitle: "在输入框开头输入 / 即可触发自动补全",
      },
      List: "自定义提示词列表",
      ListCount: (builtin: number, custom: number) =>
        `内置 ${builtin} 条，用户定义 ${custom} 条`,
      Edit: "编辑",
      Modal: {
        Title: "提示词列表",
        Add: "新建",
        Search: "搜索提示词",
      },
      EditModal: {
        Title: "编辑提示词",
      },
    },
    HistoryCount: {
      Title: "附带历史消息数",
      SubTitle: "每次请求携带的历史消息数",
    },
    CompressThreshold: {
      Title: "历史消息长度压缩阈值",
      SubTitle: "当未压缩的历史消息超过该值时，将进行压缩",
    },

    Usage: {
      Title: "余额查询",
      SubTitle(used: any, total: any) {
        return `本月已使用 $${used}，订阅总额 $${total}`;
      },
      IsChecking: "正在检查…",
      Check: "重新检查",
      NoAccess: "输入 API Key 或访问密码查看余额",
    },

    Access: {
      SaasStart: {
        Title: "使用 NextChat AI",
        Label: "（性价比最高的方案）",
        SubTitle:
          "由 NextChat 官方维护, 零配置开箱即用，支持 OpenAI o1, GPT-4o, Claude-3.5 等最新大模型",
        ChatNow: "立刻对话",
      },
      AccessCode: {
        Title: "访问密码",
        SubTitle: "管理员已开启加密访问",
        Placeholder: "请输入访问密码",
      },
      CustomEndpoint: {
        Title: "自定义接口",
        SubTitle: "是否使用自定义 Azure 或 OpenAI 服务",
      },
      Provider: {
        Title: "模型服务商",
        SubTitle: "切换不同的服务商",
      },
      OpenAI: {
        ApiKey: {
          Title: "API Key",
          SubTitle: "使用自定义 OpenAI Key 绕过密码访问限制",
          Placeholder: "OpenAI API Key",
        },

        Endpoint: {
          Title: "接口地址",
          SubTitle: "除默认地址外，必须包含 http(s)://",
        },
      },
      Azure: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义 Azure Key 绕过密码访问限制",
          Placeholder: "Azure API Key",
        },

        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },

        ApiVerion: {
          Title: "接口版本 (azure api version)",
          SubTitle: "选择指定的部分版本",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义 Anthropic Key 绕过密码访问限制",
          Placeholder: "Anthropic API Key",
        },

        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },

        ApiVerion: {
          Title: "接口版本 (claude api version)",
          SubTitle: "选择一个特定的 API 版本输入",
        },
      },
      Google: {
        ApiKey: {
          Title: "API 密钥",
          SubTitle: "从 Google AI 获取您的 API 密钥",
          Placeholder: "Google AI API KEY",
        },

        Endpoint: {
          Title: "终端地址",
          SubTitle: "示例：",
        },

        ApiVersion: {
          Title: "API 版本（仅适用于 gemini-pro）",
          SubTitle: "选择一个特定的 API 版本",
        },
        GoogleSafetySettings: {
          Title: "Google 安全过滤级别",
          SubTitle: "设置内容过滤级别",
        },
      },
      Baidu: {
        ApiKey: {
          Title: "API Key",
          SubTitle: "使用自定义 Baidu API Key",
          Placeholder: "Baidu API Key",
        },
        SecretKey: {
          Title: "Secret Key",
          SubTitle: "使用自定义 Baidu Secret Key",
          Placeholder: "Baidu Secret Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "不支持自定义前往.env配置",
        },
      },
      Tencent: {
        ApiKey: {
          Title: "API Key",
          SubTitle: "使用自定义腾讯云API Key",
          Placeholder: "Tencent API Key",
        },
        SecretKey: {
          Title: "Secret Key",
          SubTitle: "使用自定义腾讯云Secret Key",
          Placeholder: "Tencent Secret Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "不支持自定义前往.env配置",
        },
      },
      ByteDance: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义 ByteDance API Key",
          Placeholder: "ByteDance API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      Alibaba: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义阿里云API Key",
          Placeholder: "Alibaba Cloud API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      Moonshot: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义月之暗面API Key",
          Placeholder: "Moonshot API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      DeepSeek: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义DeepSeek API Key",
          Placeholder: "DeepSeek API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      XAI: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义XAI API Key",
          Placeholder: "XAI API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      ChatGLM: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义 ChatGLM API Key",
          Placeholder: "ChatGLM API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      SiliconFlow: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义硅基流动 API Key",
          Placeholder: "硅基流动 API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      Stability: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义 Stability API Key",
          Placeholder: "Stability API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      Iflytek: {
        ApiKey: {
          Title: "ApiKey",
          SubTitle: "从讯飞星火控制台获取的 APIKey",
          Placeholder: "APIKey",
        },
        ApiSecret: {
          Title: "ApiSecret",
          SubTitle: "从讯飞星火控制台获取的 APISecret",
          Placeholder: "APISecret",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
      CustomModel: {
        Title: "自定义模型名",
        SubTitle: "增加自定义模型可选项，使用英文逗号隔开",
      },
      AI302: {
        ApiKey: {
          Title: "接口密钥",
          SubTitle: "使用自定义302.AI API Key",
          Placeholder: "302.AI API Key",
        },
        Endpoint: {
          Title: "接口地址",
          SubTitle: "样例：",
        },
      },
    },

    Model: "模型 (model)",
    CompressModel: {
      Title: "对话摘要模型",
      SubTitle: "用于压缩历史记录、生成对话标题的模型",
    },
    Temperature: {
      Title: "随机性 (temperature)",
      SubTitle: "值越大，回复越随机",
    },
    TopP: {
      Title: "核采样 (top_p)",
      SubTitle: "与随机性类似，但不要和随机性一起更改",
    },
    MaxTokens: {
      Title: "单次回复限制 (max_tokens)",
      SubTitle: "单次交互所用的最大 Token 数",
    },
    PresencePenalty: {
      Title: "话题新鲜度 (presence_penalty)",
      SubTitle: "值越大，越有可能扩展到新话题",
    },
    FrequencyPenalty: {
      Title: "频率惩罚度 (frequency_penalty)",
      SubTitle: "值越大，越有可能降低重复字词",
    },
    TTS: {
      Enable: {
        Title: "启用文本转语音",
        SubTitle: "启用文本生成语音服务",
      },
      Autoplay: {
        Title: "启用自动朗读",
        SubTitle: "自动生成语音并播放，需先开启文本转语音开关",
      },
      Model: "模型",
      Engine: "转换引擎",
      Voice: {
        Title: "声音",
        SubTitle: "生成语音时使用的声音",
      },
      Speed: {
        Title: "速度",
        SubTitle: "生成语音的速度",
      },
    },
    Realtime: {
      Enable: {
        Title: "实时聊天",
        SubTitle: "开启实时聊天功能",
      },
      Provider: {
        Title: "模型服务商",
        SubTitle: "切换不同的服务商",
      },
      Model: {
        Title: "模型",
        SubTitle: "选择一个模型",
      },
      ApiKey: {
        Title: "API Key",
        SubTitle: "API Key",
        Placeholder: "API Key",
      },
      Azure: {
        Endpoint: {
          Title: "接口地址",
          SubTitle: "接口地址",
        },
        Deployment: {
          Title: "部署名称",
          SubTitle: "部署名称",
        },
      },
      Temperature: {
        Title: "随机性 (temperature)",
        SubTitle: "值越大，回复越随机",
      },
    },
    Speech: {
      Lang: "语言",
      Voice: "声音",
    },
  },
  Store: {
    DefaultTopic: "新的聊天",
    BotHello: "有什么可以帮你的吗",
    Error: "出错了，稍后重试吧",
    Prompt: {
      History: (content: string) => "这是历史聊天总结作为前情提要：" + content,
      Topic:
        "使用四到五个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，不要加粗，如果没有主题，请直接返回“闲聊”",
      Summarize:
        "简要总结一下对话内容，用作后续的上下文提示 prompt，控制在 200 字以内",
    },
  },
  Copy: {
    Success: "已写入剪贴板",
    Failed: "复制失败，请赋予剪贴板权限",
  },
  Download: {
    Success: "内容已下载到您的目录。",
    Failed: "下载失败。",
  },
  Context: {
    Toast: (x: any) => `包含 ${x} 条预设提示词`,
    Edit: "当前对话设置",
    Add: "新增一条对话",
    Clear: "上下文已清除，点击此处可恢复",
    Revert: "恢复上下文",
  },
  Discovery: {
    Name: "发现",
  },
  Mcp: {
    Name: "MCP",
  },
  FineTuned: {
    Sysmessage: "你是一个助手",
  },
  SearchChat: {
    Name: "搜索聊天记录",
    Page: {
      Title: "搜索聊天记录",
      Search: "输入搜索关键词",
      NoResult: "没有找到结果",
      NoData: "没有数据",
      Loading: "加载中",

      SubTitle: (count: number) => `搜索到 ${count} 条结果`,
    },
    Item: {
      View: "查看",
    },
  },
  Plugin: {
    Name: "插件",
    Page: {
      Title: "插件",
      SubTitle: (count: number) => `${count} 个插件`,
      Search: "搜索插件",
      Create: "新建",
      Find: "您可以在Github上找到优秀的插件：",
    },
    Item: {
      Info: (count: number) => `${count} 方法`,
      View: "查看",
      Edit: "编辑",
      Delete: "删除",
      DeleteConfirm: "确认删除？",
    },
    Auth: {
      None: "不需要授权",
      Basic: "Basic",
      Bearer: "Bearer",
      Custom: "自定义",
      CustomHeader: "自定义参数名称",
      Token: "Token",
      Proxy: "使用代理",
      ProxyDescription: "使用代理解决 CORS 错误",
      Location: "位置",
      LocationHeader: "Header",
      LocationQuery: "Query",
      LocationBody: "Body",
    },
    EditModal: {
      Title: (readonly: boolean) => `编辑插件 ${readonly ? "（只读）" : ""}`,
      Download: "下载",
      Auth: "授权方式",
      Content: "OpenAPI Schema",
      Load: "从网页加载",
      Method: "方法",
      Error: "格式错误",
    },
  },
  Mask: {
    Name: "面具",
    Page: {
      Title: "预设角色面具",
      SubTitle: (count: number) => `${count} 个预设角色定义`,
      Search: "搜索角色面具",
      Create: "新建",
    },
    Item: {
      Info: (count: number) => `包含 ${count} 条预设对话`,
      Chat: "对话",
      View: "查看",
      Edit: "编辑",
      Delete: "删除",
      DeleteConfirm: "确认删除？",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `编辑预设面具 ${readonly ? "（只读）" : ""}`,
      Download: "下载预设",
      Clone: "克隆预设",
    },
    Config: {
      Avatar: "角色头像",
      Name: "角色名称",
      Sync: {
        Title: "使用全局设置",
        SubTitle: "当前对话是否使用全局模型设置",
        Confirm: "当前对话的自定义设置将会被自动覆盖，确认启用全局设置？",
      },
      HideContext: {
        Title: "隐藏预设对话",
        SubTitle: "隐藏后预设对话不会出现在聊天界面",
      },
      Artifacts: {
        Title: "启用Artifacts",
        SubTitle: "启用之后可以直接渲染HTML页面",
      },
      CodeFold: {
        Title: "启用代码折叠",
        SubTitle: "启用之后可以自动折叠/展开过长的代码块",
      },
      Share: {
        Title: "分享此面具",
        SubTitle: "生成此面具的直达链接",
        Action: "复制链接",
      },
    },
  },
  NewChat: {
    Return: "返回",
    Skip: "直接开始",
    NotShow: "不再展示",
    ConfirmNoShow: "确认禁用？禁用后可以随时在设置中重新启用。",
    Title: "挑选一个面具",
    SubTitle: "现在开始，与面具背后的灵魂思维碰撞",
    More: "查看全部",
  },

  URLCommand: {
    Code: "检测到链接中已经包含访问码，是否自动填入？",
    Settings: "检测到链接中包含了预制设置，是否自动填入？",
  },

  UI: {
    Confirm: "确认",
    Cancel: "取消",
    Close: "关闭",
    Create: "新建",
    Edit: "编辑",
    Export: "导出",
    Import: "导入",
    Sync: "同步",
    Config: "配置",
  },
  Exporter: {
    Description: {
      Title: "只有清除上下文之后的消息会被展示",
    },
    Model: "模型",
    Messages: "消息",
    Topic: "主题",
    Time: "时间",
  },
  SdPanel: {
    Prompt: "画面提示",
    NegativePrompt: "否定提示",
    PleaseInput: (name: string) => `请输入${name}`,
    AspectRatio: "横纵比",
    ImageStyle: "图像风格",
    OutFormat: "输出格式",
    AIModel: "AI模型",
    ModelVersion: "模型版本",
    Submit: "提交生成",
    ParamIsRequired: (name: string) => `${name}不能为空`,
    Styles: {
      D3Model: "3D模型",
      AnalogFilm: "模拟电影",
      Anime: "动漫",
      Cinematic: "电影风格",
      ComicBook: "漫画书",
      DigitalArt: "数字艺术",
      Enhance: "增强",
      FantasyArt: "幻想艺术",
      Isometric: "等角",
      LineArt: "线描",
      LowPoly: "低多边形",
      ModelingCompound: "建模材料",
      NeonPunk: "霓虹朋克",
      Origami: "折纸",
      Photographic: "摄影",
      PixelArt: "像素艺术",
      TileTexture: "贴图",
    },
  },
  Sd: {
    SubTitle: (count: number) => `共 ${count} 条绘画`,
    Actions: {
      Params: "查看参数",
      Copy: "复制提示词",
      Delete: "删除",
      Retry: "重试",
      ReturnHome: "返回首页",
      History: "查看历史",
    },
    EmptyRecord: "暂无绘画记录",
    Status: {
      Name: "状态",
      Success: "成功",
      Error: "失败",
      Wait: "等待中",
      Running: "运行中",
    },
    Danger: {
      Delete: "确认删除？",
    },
    GenerateParams: "生成参数",
    Detail: "详情",
  },
  Sidebar: {
    ChatSettings: "聊天设置",
    UserCenter: "用户中心",
  },
  Mj: {
    SubTitle: (count: number) => `共 ${count} 条绘画`,
    Actions: {
      Params: "查看参数",
      Copy: "复制提示词",
      Delete: "删除",
      Retry: "重试",
      ReturnHome: "返回首页",
      History: "查看历史",
    },
    EmptyRecord: "暂无绘画记录",
    Status: {
      Name: "状态",
      Success: "成功",
      Error: "失败",
      Wait: "等待中",
      Running: "运行中",
    },
    Danger: {
      Delete: "确认删除？",
    },
    GenerateParams: "生成参数",
    Detail: "详情",
  },
  MjPanel: {
    Prompt: "提示词",
    NegativePrompt: "否定提示",
    PleaseInput: (name: string) => `请输入${name}`,
    AspectRatio: "横纵比",
    AIModel: "AI模型",
    AIAction: "AI动作",
    ModelVersion: "模型版本",
    Submit: "提交生成",
    TaskId: "任务ID",
    ParamIsRequired: (name: string) => `${name}不能为空`,
    Imagine: "生图",
    Blend: "混图",
    Describe: "识图",
    VaryRegion: "区域重绘",
    SubmitRegion: "提交区域重绘",
    ImagineParam: {
      IwImage: "参考图",
      IwImageTip: "最多2张，选择图片后点击图片即可移除",
      IwTitle: "普通参考图权重",
      IwTip: "范围为0.0~2.0",
      SeedTip: "范围为0~4294967294",
    },
    BlendParam: {
      ImageTitle: "混图图片",
      ImageTip: "最少2张，最多5张，选择图片后点击图片即可移除",
      Dimensions: "比例",
    },
    DescribeParam: {
      ImageTitle: "识别图片",
      ImageTip: "选择图片后点击图片即可移除",
    },
  },
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type LocaleType = typeof cn;
export type PartialLocaleType = DeepPartial<typeof cn>;

export default cn;
