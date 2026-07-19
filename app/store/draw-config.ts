import { StoreKey } from "@/app/constant";
import { createPersistStore } from "@/app/utils/store";

export const DEFAULT_DRAW_CONFIG = {
  // dall-e-3
  dall: {
    n: 1,
    quality: "auto",
    response_format: "url", // url, b64_json
    size: "1024x1024", // 1024x1024, 1792x1024, or 1024x1792
    style: "vivid", // vivid or natural
  },
  // midjourney
  mj: {
    mode: "IMAGINE", // IMAGINE、BLEND、DESCRIBE、INSIGHTFACE
    engine: "Midjourney", // Midjourney or Niji
    engineVersion: "default", // 5.2 or 5.1 or 5 or 4
    size: "1:1", // 1:1 or 3:2 or 3:4 or 4:3 or 9:16 or 16:9
    quality: "1",
    chaos: 0,
    stylize: 100,
    tile: false,
    seed: -1, // 种子
  },
  // stable-diffusion
  sd: {
    api_mode: "txt2img",
    prompt: "", // 提示词
    negative_prompt: "", // 负向提示词
    sampler_name: "Euler a", // 采样方法
    steps: 20, // 迭代步数
    restore_faces: false, // 面部修复
    tiling: false, // 纹理平铺
    width: 512,
    height: 512,
    batch_count: 1, // 生成批次
    batch_size: 1, // 每批数量
    cfg_scale: 7, // 提示词引导系数
    seed: -1, // 种子
    script_name: "", // 脚本

    enable_hr: false, // 高清修复
    hr_upscaler: "", // 放大算法
    hr_second_pass_steps: 0, // 重绘迭代步数
    hr_scale: 2, // 放大倍率
    hr_resize_x: 0, // 宽度调整到
    hr_resize_y: 0, // 高度调整到
    hr_sampler_name: "", // 重绘采样方法
    hr_prompt: "",
    hr_negative_prompt: "",
    denoising_strength: 0.7, // 重绘幅度
    firstphase_width: 0, //
    firstphase_height: 0, //

    refiner_checkpoint: "", // 精修模型
    refiner_switch_at: 0.8, // 精修切换时机

    resize_mode: 0, // 尺寸调整方式 0按分辨率，1按倍数
    resize_width: 1024,
    resize_height: 1024,
    resize_scale: 1,

    mode: 0, // 图生图，涂鸦，重绘，涂鸦重绘，遮罩重绘
    init_images: [], // 底图
    mask: null, // 遮罩图片base64
    mask_blur: 4, // 遮罩模糊
    mask_alpha: 0, // inpaint sketch Mask transparency
    inpainting_mask_invert: 0, // mask mode
    inpainting_fill: 0, // maskcontent
    inpaint_full_res: true, // inpaint area
    inpaint_full_res_padding: 32,

    // extras
    upscaling_resize: 2,
    upscaling_resize_w: 512,
    upscaling_resize_h: 512,
    upscaling_crop: true,
    upscaler_1: "none",
    upscaler_2: "none",
    gfpgan_visibility: 0,
    codeformer_visibility: 0,
    codeformer_weight: 0,
    extras_upscaler_2_visibility: 0,

    override_settings: {
      sd_model_checkpoint: "", // 模型 checkpoint
      sd_vae: "",
      CLIP_stop_at_last_layers: 2,
    },

    lora: [] as any[], // lora [{name: "", weight: 1}]
  },

  luma: {
    aspect_ratio: "16:9",
    expand_prompt: true,
  },
};

export const ENGINE_VERSION_LIST = [
  { value: "default", label: "default" },
  { value: "7", label: "7" },
  { value: "6.1", label: "6.1" },
  { value: "6", label: "6" },
  { value: "5.2", label: "5.2" },
  { value: "5.1", label: "5.1" },
  { value: "5", label: "5" },
  { value: "4", label: "4" },
];

export type DrawConfig = typeof DEFAULT_DRAW_CONFIG;

export const createDefaultDrawConfig = (): DrawConfig => {
  return JSON.parse(JSON.stringify(DEFAULT_DRAW_CONFIG));
};

export const useDrawConfigStore = createPersistStore(
  { ...DEFAULT_DRAW_CONFIG },
  (set, get) => ({
    ...DEFAULT_DRAW_CONFIG,

    reset(model: string) {
      const defaultConfig = createDefaultDrawConfig();
      if (model == "dall") {
        set(() => ({ dall: defaultConfig.dall }));
      } else if (model == "mj") {
        set(() => ({ mj: defaultConfig.mj }));
      } else if (model == "sd") {
        set(() => ({ sd: defaultConfig.sd }));
      } else if (model == "luma") {
        set(() => ({ luma: defaultConfig.luma }));
      }
    },

    update(updater: (config: DrawConfig) => void) {
      const config = { ...get() };
      updater(config);
      set(() => config);
    },
  }),
  {
    name: StoreKey.DrawConfig,
    version: 2.0,
    migrate(persistedState, version) {
      const state = persistedState as DrawConfig;
      if (version < 2.0) {
        state.dall = {
          n: 1,
          quality: "hd",
          response_format: "url",
          size: "1024x1024",
          style: "vivid",
        };
      }
      return state as any;
    },
  },
);
