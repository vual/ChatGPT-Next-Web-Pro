import { Modal, showConfirm } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import ResetIcon from "@/app/icons/reload.svg";
import { DrawConfig, useDrawConfigStore } from "@/app/store/draw-config";
import ConfirmIcon from "@/app/icons/confirm.svg";
import React, { useEffect, useState } from "react";
import {
  Col,
  Collapse,
  Divider,
  Form,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Slider,
  Switch,
  Upload,
} from "antd";
import { UploadFile, UploadProps } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import {
  getHeaders,
  getHeadersForUpload,
  getUploadUrl,
} from "@/app/client/api";

type ModelOption = {
  title: string;
  model_name: string;
  hash: string;
  sha256: string;
  filename: string;
  config: any;
};

type VaeOption = {
  model_name: string;
  filename: string;
};

type SamplingMethod = {
  name: string;
  aliases: string[];
  options: any;
};

type Upscale = {
  name: string;
};

type Script = {
  txt2img: string[];
  img2img: string[];
};

type Lora = {
  name: string;
  alias: string;
  path: string;
  metadata: any;
};

function getSDModels() {
  return new Promise((resolve, reject) => {
    fetch("/api/stable-diffusion/sd-models", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          resolve(res as ModelOption[]);
        }
        resolve([] as ModelOption[]);
      })
      .catch((err) => {
        console.log(err);
        resolve([] as ModelOption[]);
      });
  });
}

function getSDVaes() {
  return new Promise((resolve, reject) => {
    fetch("/api/stable-diffusion/sd-vae", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          resolve(res as VaeOption[]);
        }
        resolve([] as VaeOption[]);
      })
      .catch((err) => {
        console.log(err);
        resolve([] as VaeOption[]);
      });
  });
}

function getSamplingMethods() {
  return new Promise((resolve, reject) => {
    fetch("/api/stable-diffusion/samplers", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          resolve(res as SamplingMethod[]);
        }
        resolve([] as SamplingMethod[]);
      })
      .catch((err) => {
        console.log("sd getSamplingMethod", err);
        resolve([] as SamplingMethod[]);
      });
  });
}

function getUpscalers() {
  return new Promise(async (resolve, reject) => {
    let upscalers = [] as Upscale[];
    fetch("/api/stable-diffusion/upscalers", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          upscalers = upscalers.concat(res as Upscale[]);
        }
        resolve(upscalers);
      })
      .catch((err) => {
        console.log("sd getUpscalers upscalers", err);
        resolve(upscalers);
      });
  });
}

function getUpscalersWithLatent() {
  return new Promise(async (resolve, reject) => {
    let upscalers = [] as Upscale[];
    // 先获取Latent放大算法
    fetch("/api/stable-diffusion/latent-upscale-modes", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          upscalers = upscalers.concat(res as Upscale[]);
          // 再获取放大算法
          getUpscalers().then((res) => {
            upscalers = upscalers.concat(res as Upscale[]);
            resolve(upscalers);
          });
        }
        resolve(upscalers);
      })
      .catch((err) => {
        console.log("sd getUpscalers latent-upscale-modes", err);
        resolve(upscalers);
      });
  });
}

function getScripts() {
  return new Promise((resolve, reject) => {
    fetch("/api/stable-diffusion/scripts", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res.txt2img) {
          resolve(res as Script);
        }
        resolve({} as Script);
      })
      .catch((err) => {
        console.log("sd getScripts", err);
        resolve({} as Script);
      });
  });
}

function getLoras() {
  return new Promise((resolve, reject) => {
    fetch("/api/stable-diffusion/loras", {
      method: "get",
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res instanceof Array) {
          resolve(res as Lora[]);
        }
        resolve([] as Lora[]);
      })
      .catch((err) => {
        console.log("sd getLoras", err);
        resolve([] as Lora[]);
      });
  });
}

export function HiresFix() {
  const drawConfig = useDrawConfigStore();

  const [upscalers, setUpscalers] = useState<Upscale[]>([]);

  useEffect(() => {
    // 获取放大算法
    getUpscalersWithLatent().then((res) => {
      const data = res as Upscale[];
      setUpscalers(data);
      if (drawConfig.sd.hr_upscaler == "") {
        drawConfig.update((config: DrawConfig) => {
          config.sd.hr_upscaler = data[0].name;
        });
      }
    });
  }, []);

  const onHrStepsChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_second_pass_steps = value ? value : 0;
    });
  };

  const onHrUpscalerChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_upscaler = value;
    });
  };

  const onDenoisingChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.denoising_strength = value ? value : 0;
    });
  };

  const onHrScaleChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_scale = value ? value : 1;
    });
  };

  const onHrResizeXChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_resize_x = value ? value : 0;
    });
  };

  const onHrResizeYChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_resize_y = value ? value : 0;
    });
  };

  return (
    <>
      <Form.Item label={Locale.StableDiffusion.HrUpscaler}>
        <Select
          value={drawConfig.sd.hr_upscaler}
          style={{ width: 350, zIndex: 999 }}
          onChange={onHrUpscalerChange}
          options={(upscalers || []).map((opt) => ({
            value: opt.name,
            label: opt.name,
          }))}
        />
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.HrSteps}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={150}
              onChange={onHrStepsChange}
              value={
                typeof drawConfig.sd.hr_second_pass_steps === "number"
                  ? drawConfig.sd.hr_second_pass_steps
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={150}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.hr_second_pass_steps}
              onChange={onHrStepsChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.Denoising}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              onChange={onDenoisingChange}
              value={
                typeof drawConfig.sd.denoising_strength === "number"
                  ? drawConfig.sd.denoising_strength
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.denoising_strength}
              onChange={onDenoisingChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.HrScale}>
        <Row>
          <Col span={8}>
            <Slider
              min={1}
              max={4}
              onChange={onHrScaleChange}
              value={
                typeof drawConfig.sd.hr_scale === "number"
                  ? drawConfig.sd.hr_scale
                  : 2
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={1}
              max={4}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.hr_scale}
              onChange={onHrScaleChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.HrResizeX}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={2048}
              onChange={onHrResizeXChange}
              value={
                typeof drawConfig.sd.hr_resize_x === "number"
                  ? drawConfig.sd.hr_resize_x
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={2048}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.hr_resize_x}
              onChange={onHrResizeXChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.HrResizeY}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={2048}
              onChange={onHrResizeYChange}
              value={
                typeof drawConfig.sd.hr_resize_y === "number"
                  ? drawConfig.sd.hr_resize_y
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={2048}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.hr_resize_y}
              onChange={onHrResizeYChange}
            />
          </Col>
        </Row>
      </Form.Item>
    </>
  );
}

export function Refiner(props: { modelOptions: ModelOption[] }) {
  const drawConfig = useDrawConfigStore();

  const onModelChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.refiner_checkpoint = value;
    });
  };

  const onSwitchAtChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.refiner_switch_at = value ? value : 0;
    });
  };

  return (
    <>
      <Form.Item label={Locale.StableDiffusion.RefinerCheckpoint}>
        <Select
          value={drawConfig.sd.refiner_checkpoint}
          style={{ width: 350, zIndex: 999 }}
          onChange={onModelChange}
          options={props.modelOptions.map((opt) => ({
            value: opt.title,
            label: opt.title,
          }))}
        />
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.RefinerSwitchAt}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.01}
              onChange={onSwitchAtChange}
              value={
                typeof drawConfig.sd.refiner_switch_at === "number"
                  ? drawConfig.sd.refiner_switch_at
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.refiner_switch_at}
              onChange={onSwitchAtChange}
            />
          </Col>
        </Row>
      </Form.Item>
    </>
  );
}

export function Inpaint() {
  const drawConfig = useDrawConfigStore();

  const onMaskBlurChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.mask_blur = value ? value : 0;
    });
  };

  const onMaskAlphaChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.mask_alpha = value ? value : 0;
    });
  };

  const onRadioChange = (e: RadioChangeEvent) => {
    drawConfig.update((config: DrawConfig) => {
      // @ts-ignore
      config.sd[e.target.name] = e.target.value;
    });
  };

  const onInpaintFullResPaddingChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.inpaint_full_res_padding = value ? value : 0;
    });
  };

  return (
    <>
      <Form.Item label={Locale.StableDiffusion.MaskBlur}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={64}
              onChange={onMaskBlurChange}
              value={
                typeof drawConfig.sd.mask_blur === "number"
                  ? drawConfig.sd.mask_blur
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={64}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.mask_blur}
              onChange={onMaskBlurChange}
            />
          </Col>
        </Row>
      </Form.Item>
      {drawConfig.sd.mode == 3 && (
        <Form.Item label={Locale.StableDiffusion.MaskTransparency}>
          <Row>
            <Col span={8}>
              <Slider
                min={0}
                max={100}
                onChange={onMaskAlphaChange}
                value={
                  typeof drawConfig.sd.mask_alpha === "number"
                    ? drawConfig.sd.mask_alpha
                    : 0
                }
              />
            </Col>
            <Col span={2}>
              <InputNumber
                min={0}
                max={100}
                style={{ margin: "0 16px" }}
                value={drawConfig.sd.mask_alpha}
                onChange={onMaskAlphaChange}
              />
            </Col>
          </Row>
        </Form.Item>
      )}

      <Form.Item label={Locale.StableDiffusion.MaskMode}>
        <Radio.Group
          name={"inpainting_mask_invert"}
          onChange={onRadioChange}
          value={drawConfig.sd.inpainting_mask_invert}
        >
          <Radio value={0}>{Locale.StableDiffusion.InpaintMasked}</Radio>
          <Radio value={1}>{Locale.StableDiffusion.InpaintNotMasked}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.MaskedContent}>
        <Radio.Group
          name={"inpainting_fill"}
          onChange={onRadioChange}
          value={drawConfig.sd.inpainting_fill}
        >
          <Radio value={0}>{Locale.StableDiffusion.MaskedContentFill}</Radio>
          <Radio value={1}>
            {Locale.StableDiffusion.MaskedContentOriginal}
          </Radio>
          <Radio value={2}>
            {Locale.StableDiffusion.MaskedContentLatentNoise}
          </Radio>
          <Radio value={3}>
            {Locale.StableDiffusion.MaskedContentLatentNothing}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.InpaintArea}>
        <Radio.Group
          name={"inpaint_full_res"}
          onChange={onRadioChange}
          value={drawConfig.sd.inpaint_full_res}
        >
          <Radio value={true}>
            {Locale.StableDiffusion.InpaintAreaWholePicture}
          </Radio>
          <Radio value={false}>
            {Locale.StableDiffusion.InpaintAreaOnlyMasked}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.InpaintFullResPadding}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={256}
              onChange={onInpaintFullResPaddingChange}
              value={
                typeof drawConfig.sd.inpaint_full_res_padding === "number"
                  ? drawConfig.sd.inpaint_full_res_padding
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={256}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.inpaint_full_res_padding}
              onChange={onInpaintFullResPaddingChange}
            />
          </Col>
        </Row>
      </Form.Item>
    </>
  );
}

export function Extras() {
  const drawConfig = useDrawConfigStore();

  const [upscalers, setUpscalers] = useState<Upscale[]>([]);

  useEffect(() => {
    // 获取放大算法
    getUpscalers().then((res) => {
      setUpscalers(res as Upscale[]);
    });
  }, []);

  const onRadioChange = (e: RadioChangeEvent) => {
    drawConfig.update((config: DrawConfig) => {
      // @ts-ignore
      config.sd[e.target.name] = e.target.value;
    });
  };

  const onScaleChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.hr_scale = value ? value : 1;
    });
  };

  const onWidthChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.upscaling_resize_w = value ? value : 512;
    });
  };

  const onHeightChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.upscaling_resize_h = value ? value : 512;
    });
  };

  const onCropToFitChange = (checked: boolean) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.upscaling_crop = checked;
    });
  };

  const onUpscaler1Change = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.upscaler_1 = value;
    });
  };

  const onUpscaler2Change = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.upscaler_2 = value;
    });
  };

  const onUpscaler2VisibilityChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.extras_upscaler_2_visibility = value ? value : 0;
    });
  };

  const onGFPGANChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.gfpgan_visibility = value ? value : 0;
    });
  };

  const onCodeFormerChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.codeformer_visibility = value ? value : 0;
    });
  };

  const onCodeformerWeightChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.codeformer_weight = value ? value : 0;
    });
  };

  return (
    <>
      <Form.Item label={Locale.StableDiffusion.ResizeMode}>
        <Radio.Group
          name={"resize_mode"}
          onChange={onRadioChange}
          value={drawConfig.sd.resize_mode}
        >
          <Radio value={0}>{Locale.StableDiffusion.ResizeByScale}</Radio>
          <Radio value={1}>{Locale.StableDiffusion.ResizeByResolution}</Radio>
        </Radio.Group>
      </Form.Item>
      {drawConfig.sd.resize_mode == 0 ? (
        <Form.Item label={Locale.StableDiffusion.HrScale}>
          <Row>
            <Col span={8}>
              <Slider
                min={1}
                max={8}
                onChange={onScaleChange}
                value={
                  typeof drawConfig.sd.upscaling_resize === "number"
                    ? drawConfig.sd.upscaling_resize
                    : 2
                }
              />
            </Col>
            <Col span={2}>
              <InputNumber
                min={1}
                max={8}
                style={{ margin: "0 16px" }}
                value={drawConfig.sd.upscaling_resize}
                onChange={onScaleChange}
              />
            </Col>
          </Row>
        </Form.Item>
      ) : (
        <>
          <Form.Item label={Locale.StableDiffusion.Width}>
            <Row>
              <Col span={8}>
                <Slider
                  min={64}
                  max={2048}
                  onChange={onWidthChange}
                  value={
                    typeof drawConfig.sd.upscaling_resize_w === "number"
                      ? drawConfig.sd.upscaling_resize_w
                      : 512
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={64}
                  max={2048}
                  style={{ margin: "0 16px" }}
                  value={drawConfig.sd.upscaling_resize_w}
                  onChange={onWidthChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.StableDiffusion.Height}>
            <Row>
              <Col span={8}>
                <Slider
                  min={64}
                  max={2048}
                  onChange={onHeightChange}
                  value={
                    typeof drawConfig.sd.upscaling_resize_h === "number"
                      ? drawConfig.sd.upscaling_resize_h
                      : 512
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={64}
                  max={2048}
                  style={{ margin: "0 16px" }}
                  value={drawConfig.sd.upscaling_resize_h}
                  onChange={onHeightChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.StableDiffusion.CropToFit}>
            <Switch
              checked={drawConfig.sd.upscaling_crop}
              onChange={onCropToFitChange}
            />
          </Form.Item>
        </>
      )}
      <Form.Item label={Locale.StableDiffusion.HrUpscaler + " 1"}>
        <Select
          value={drawConfig.sd.upscaler_1}
          style={{ width: 350, zIndex: 999 }}
          onChange={onUpscaler1Change}
          options={(upscalers || []).map((opt) => ({
            value: opt.name,
            label: opt.name,
          }))}
        />
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.HrUpscaler + " 2"}>
        <Select
          value={drawConfig.sd.upscaler_2}
          style={{ width: 350, zIndex: 999 }}
          onChange={onUpscaler2Change}
          options={(upscalers || []).map((opt) => ({
            value: opt.name,
            label: opt.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label={
          Locale.StableDiffusion.HrUpscaler +
          " 2 " +
          Locale.StableDiffusion.Visibility
        }
      >
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.001}
              onChange={onUpscaler2VisibilityChange}
              value={
                typeof drawConfig.sd.extras_upscaler_2_visibility === "number"
                  ? drawConfig.sd.extras_upscaler_2_visibility
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.001}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.extras_upscaler_2_visibility}
              onChange={onUpscaler2VisibilityChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        label={
          Locale.StableDiffusion.GFPGAN + Locale.StableDiffusion.Visibility
        }
      >
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.001}
              onChange={onGFPGANChange}
              value={
                typeof drawConfig.sd.gfpgan_visibility === "number"
                  ? drawConfig.sd.gfpgan_visibility
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.001}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.gfpgan_visibility}
              onChange={onGFPGANChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        label={
          Locale.StableDiffusion.CodeFormer + Locale.StableDiffusion.Visibility
        }
      >
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.001}
              onChange={onCodeFormerChange}
              value={
                typeof drawConfig.sd.codeformer_visibility === "number"
                  ? drawConfig.sd.codeformer_visibility
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.001}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.codeformer_visibility}
              onChange={onCodeFormerChange}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label={Locale.StableDiffusion.CodeFormerWeight}>
        <Row>
          <Col span={8}>
            <Slider
              min={0}
              max={1}
              step={0.001}
              onChange={onCodeformerWeightChange}
              value={
                typeof drawConfig.sd.codeformer_weight === "number"
                  ? drawConfig.sd.codeformer_weight
                  : 0
              }
            />
          </Col>
          <Col span={2}>
            <InputNumber
              min={0}
              max={1}
              step={0.001}
              style={{ margin: "0 16px" }}
              value={drawConfig.sd.codeformer_weight}
              onChange={onCodeformerWeightChange}
            />
          </Col>
        </Row>
      </Form.Item>
    </>
  );
}

export function Loras() {
  const drawConfig = useDrawConfigStore();

  const [loras, setLoras] = useState<Lora[]>([]);

  useEffect(() => {
    // 获取lora模型
    getLoras().then((res) => {
      setLoras(res as Lora[]);
    });
  }, []);

  const onLoraChange = (value: string[]) => {
    drawConfig.update((config: DrawConfig) => {
      const loraArr = [] as any[];
      console.log(value);
      if (value.length > 0) {
        value.forEach((item: string) => {
          const opt = {
            name: item,
            weight: 1,
          };
          loraArr.push(opt);
        });
      }
      config.sd.lora = loraArr;
    });
  };

  const onLoraWeightChange = (value: number, index: number) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.lora[index].weight = value ? value : 0;
    });
  };

  return (
    <>
      <Form.Item label={Locale.StableDiffusion.Lora}>
        <Select
          mode="multiple"
          value={drawConfig.sd.lora?.map((opt: Lora) => opt.name)}
          style={{ width: 350, zIndex: 999 }}
          allowClear
          onChange={onLoraChange}
          options={loras.map((opt) => ({
            value: opt.name,
            label: opt.name,
          }))}
        />
      </Form.Item>
      {drawConfig.sd.lora.length > 0 &&
        drawConfig.sd.lora.map((lora, index) => {
          return (
            <div key={index}>
              <Form.Item label={lora.name} labelAlign={"left"}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={0}
                      max={2}
                      step={0.01}
                      onChange={(value) => onLoraWeightChange(value, index)}
                      value={typeof lora.weight === "number" ? lora.weight : 1}
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={0}
                      max={2}
                      step={0.01}
                      style={{ margin: "0 16px" }}
                      value={lora.weight}
                      onChange={(value) => onLoraWeightChange(value, index)}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Divider />
            </div>
          );
        })}
    </>
  );
}

export function StableDiffusionConfigModal(props: {
  uploadImages: UploadFile[];
  setUploadImages: (uploadImages: UploadFile[]) => void;
  uploadMaskImages: UploadFile[];
  setUploadMaskImages: (uploadMaskImages: UploadFile[]) => void;
  onClose: () => void;
}) {
  const drawConfig = useDrawConfigStore();

  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [samplingMethods, setSamplingMethods] = useState<SamplingMethod[]>([]);
  const [vaeOptions, setVaeOptions] = useState<VaeOption[]>([]);
  const [scripts, setScripts] = useState<Script>({} as Script);

  useEffect(() => {
    // 获取所有模型
    getSDModels().then((res) => {
      const options = res as ModelOption[];
      setModelOptions(options);
      if (
        options.length > 0 &&
        (!drawConfig.sd.override_settings ||
          !drawConfig.sd.override_settings.sd_model_checkpoint)
      ) {
        drawConfig.update((config: DrawConfig) => {
          config.sd.override_settings.sd_model_checkpoint = options[0].title;
        });
      }
    });

    // 获取vae模型
    getSDVaes().then((res) => setVaeOptions(res as VaeOption[]));

    // 获取采样方法
    getSamplingMethods().then((res) =>
      setSamplingMethods(res as SamplingMethod[]),
    );

    // 获取脚本
    getScripts().then((res) => setScripts(res as Script));
  }, []);

  const onModelChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.override_settings.sd_model_checkpoint = value;
    });
  };

  const onVaeChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.override_settings.sd_vae = value;
    });
  };

  const onClipSkipChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.override_settings.CLIP_stop_at_last_layers = value ? value : 1;
    });
  };

  const onRadioChange = (e: RadioChangeEvent) => {
    drawConfig.update((config: DrawConfig) => {
      // @ts-ignore
      config.sd[e.target.name] = e.target.value;
    });
  };

  const uploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    event,
  }) => {
    newFileList.forEach((file) => {
      if (file.status == "error") {
        file.response == "";
      }
    });
    props.setUploadImages(newFileList);
  };

  const uploadMaskChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    event,
  }) => {
    newFileList.forEach((file) => {
      if (file.status == "error") {
        file.response == "";
      }
    });
    props.setUploadMaskImages(newFileList);
  };

  const onSamplingMethodChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.sampler_name = value;
    });
  };

  const onStepsChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.steps = value ? value : 0;
    });
  };

  const onRestoreFacesChange = (checked: boolean) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.restore_faces = checked;
    });
  };

  const onTilingChange = (checked: boolean) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.tiling = checked;
    });
  };

  const onWidthChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.width = value ? value : 512;
    });
  };

  const onHeightChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.height = value ? value : 512;
    });
  };

  const onBatchCountChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.batch_count = value ? value : 1;
    });
  };

  const onBatchSizeChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.batch_size = value ? value : 1;
    });
  };

  const onCFGScaleChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.cfg_scale = value ? value : 7;
    });
  };

  const onSeedChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.seed = value ? value : -1;
    });
  };

  const onScriptChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.sd.script_name = value;
    });
  };

  const maxUploadCount = drawConfig.sd.api_mode == "extras" ? 20 : 1;
  const uploadButton = (name: string) => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{name}</div>
    </div>
  );

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.InputActions.DrawSettings}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.StableDiffusion.Reset}
            type="danger"
            onClick={async () => {
              if (await showConfirm(Locale.StableDiffusion.ResetTips)) {
                drawConfig.reset("sd");
                props.setUploadImages([]);
                props.setUploadMaskImages([]);
              }
            }}
          />,
          <IconButton
            key="comfirm"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.StableDiffusion.Comfirm}
            type="primary"
            onClick={() => props.onClose()}
          />,
        ]}
      >
        <Form labelCol={{ span: 4 }} labelWrap={true} layout={"horizontal"}>
          <Form.Item label={Locale.StableDiffusion.Models}>
            <Select
              value={drawConfig.sd.override_settings?.sd_model_checkpoint}
              style={{ width: 350, zIndex: 999 }}
              onChange={onModelChange}
              options={modelOptions.map((opt) => ({
                value: opt.title,
                label: opt.title,
              }))}
            />
          </Form.Item>
          {vaeOptions.length > 0 && (
            <Form.Item label={Locale.StableDiffusion.VAE}>
              <Select
                value={drawConfig.sd.override_settings?.sd_vae}
                style={{ width: 350, zIndex: 999 }}
                onChange={onVaeChange}
                options={vaeOptions.map((opt) => ({
                  value: opt.model_name,
                  label: opt.model_name,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item label={Locale.StableDiffusion.ClipSkip}>
            <Row>
              <Col span={8}>
                <Slider
                  min={1}
                  max={12}
                  onChange={onClipSkipChange}
                  value={
                    typeof drawConfig.sd.override_settings
                      .CLIP_stop_at_last_layers === "number"
                      ? drawConfig.sd.override_settings.CLIP_stop_at_last_layers
                      : 2
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={1}
                  max={12}
                  style={{ margin: "0 16px" }}
                  value={
                    drawConfig.sd.override_settings.CLIP_stop_at_last_layers
                  }
                  onChange={onClipSkipChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.StableDiffusion.ApiMode}>
            <Radio.Group
              name={"api_mode"}
              onChange={onRadioChange}
              value={drawConfig.sd.api_mode}
            >
              <Radio value={"txt2img"}>
                {Locale.StableDiffusion.ModeTxt2Img}
              </Radio>
              <Radio value={"img2img"}>
                {Locale.StableDiffusion.ModeImg2Img}
              </Radio>
              <Radio value={"extras"}>
                {Locale.StableDiffusion.ModeExtras}
              </Radio>
              <Radio value={"pngInfo"}>
                {Locale.StableDiffusion.ModePngInfo}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {drawConfig.sd.api_mode == "img2img" && (
            <>
              <Form.Item label={Locale.StableDiffusion.ImageMode}>
                <Radio.Group
                  name={"mode"}
                  onChange={onRadioChange}
                  value={drawConfig.sd.mode}
                >
                  <Radio value={0}>
                    {Locale.StableDiffusion.ImageModeDefault}
                  </Radio>
                  <Radio value={1}>
                    {Locale.StableDiffusion.ImageModeSketch}
                  </Radio>
                  <Radio value={2}>
                    {Locale.StableDiffusion.ImageModeInpaint}
                  </Radio>
                  <Radio value={3}>
                    {Locale.StableDiffusion.ImageModeInpaintSketch}
                  </Radio>
                  <Radio value={4}>
                    {Locale.StableDiffusion.ImageModeInpaintUpload}
                  </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.ResizeMode}>
                <Radio.Group
                  name={"resize_mode"}
                  onChange={onRadioChange}
                  value={drawConfig.sd.resize_mode}
                >
                  <Radio value={0}>{Locale.StableDiffusion.ResizeMode0}</Radio>
                  <Radio value={1}>{Locale.StableDiffusion.ResizeMode1}</Radio>
                  <Radio value={2}>{Locale.StableDiffusion.ResizeMode2}</Radio>
                  <Radio value={3}>{Locale.StableDiffusion.ResizeMode3}</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )}
          {(drawConfig.sd.api_mode == "img2img" ||
            drawConfig.sd.api_mode == "extras" ||
            drawConfig.sd.api_mode == "pngInfo") && (
            <>
              <Form.Item label={Locale.StableDiffusion.Reference}>
                <Row>
                  <Col>
                    <Upload
                      action={getUploadUrl("file")}
                      headers={getHeadersForUpload()}
                      accept=".png, .jpg, .jpeg, .webp"
                      listType="picture-card"
                      fileList={props.uploadImages}
                      multiple={drawConfig.sd.api_mode == "extras"}
                      onChange={uploadChange}
                    >
                      {props.uploadImages.length >= maxUploadCount
                        ? null
                        : uploadButton(
                            Locale.StableDiffusion.ReferenceOriginal,
                          )}
                    </Upload>
                  </Col>

                  {drawConfig.sd.api_mode == "img2img" &&
                    drawConfig.sd.mode == 4 && (
                      <Col style={{ marginLeft: 10 }}>
                        <Upload
                          action={getUploadUrl("file")}
                          headers={getHeadersForUpload()}
                          accept=".png, .jpg, .jpeg, .webp"
                          listType="picture-card"
                          fileList={props.uploadMaskImages}
                          onChange={uploadMaskChange}
                        >
                          {props.uploadMaskImages.length >= 1
                            ? null
                            : uploadButton(
                                Locale.StableDiffusion.ReferenceMask,
                              )}
                        </Upload>
                      </Col>
                    )}
                </Row>
              </Form.Item>
              {drawConfig.sd.api_mode == "img2img" &&
                (drawConfig.sd.mode == 2 ||
                  drawConfig.sd.mode == 3 ||
                  drawConfig.sd.mode == 4) && <Inpaint />}
            </>
          )}
          {(drawConfig.sd.api_mode == "txt2img" ||
            drawConfig.sd.api_mode == "img2img") && (
            <>
              <Form.Item label={Locale.StableDiffusion.SamplingMethod}>
                <Select
                  value={drawConfig.sd.sampler_name}
                  style={{ width: 350, zIndex: 999 }}
                  onChange={onSamplingMethodChange}
                  options={samplingMethods.map((opt) => ({
                    value: opt.name,
                    label: opt.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Steps}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={0}
                      max={150}
                      onChange={onStepsChange}
                      value={
                        typeof drawConfig.sd.steps === "number"
                          ? drawConfig.sd.steps
                          : 20
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={0}
                      max={150}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.steps}
                      onChange={onStepsChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.RestoreFaces}>
                <Switch
                  checked={drawConfig.sd.restore_faces}
                  onChange={onRestoreFacesChange}
                />
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Tiling}>
                <Switch
                  checked={drawConfig.sd.tiling}
                  onChange={onTilingChange}
                />
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Width}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={64}
                      max={2048}
                      onChange={onWidthChange}
                      value={
                        typeof drawConfig.sd.width === "number"
                          ? drawConfig.sd.width
                          : 512
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={64}
                      max={2048}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.width}
                      onChange={onWidthChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Height}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={64}
                      max={2048}
                      onChange={onHeightChange}
                      value={
                        typeof drawConfig.sd.height === "number"
                          ? drawConfig.sd.height
                          : 512
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={64}
                      max={2048}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.height}
                      onChange={onHeightChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.BatchCount}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={1}
                      max={100}
                      onChange={onBatchCountChange}
                      value={
                        typeof drawConfig.sd.batch_count === "number"
                          ? drawConfig.sd.batch_count
                          : 1
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.batch_count}
                      onChange={onBatchCountChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.BatchSize}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={1}
                      max={8}
                      onChange={onBatchSizeChange}
                      value={
                        typeof drawConfig.sd.batch_size === "number"
                          ? drawConfig.sd.batch_size
                          : 1
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={1}
                      max={8}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.batch_size}
                      onChange={onBatchSizeChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.CFGScale}>
                <Row>
                  <Col span={8}>
                    <Slider
                      min={1}
                      max={30}
                      onChange={onCFGScaleChange}
                      value={
                        typeof drawConfig.sd.cfg_scale === "number"
                          ? drawConfig.sd.cfg_scale
                          : 7
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <InputNumber
                      min={1}
                      max={30}
                      style={{ margin: "0 16px" }}
                      value={drawConfig.sd.cfg_scale}
                      onChange={onCFGScaleChange}
                    />
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Seed}>
                <InputNumber
                  style={{ width: 350 }}
                  value={drawConfig.sd.seed}
                  onChange={onSeedChange}
                />
              </Form.Item>
              <Form.Item label={Locale.StableDiffusion.Script}>
                <Select
                  value={drawConfig.sd.script_name}
                  style={{ width: 350, zIndex: 999 }}
                  onChange={onScriptChange}
                  options={(
                    (drawConfig.sd.api_mode == "txt2img"
                      ? scripts?.txt2img
                      : scripts?.img2img) || []
                  ).map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                />
              </Form.Item>
              {drawConfig.sd.api_mode == "txt2img" && (
                <Collapse
                  activeKey={drawConfig.sd.enable_hr ? ["1"] : []}
                  onChange={(key) => {
                    drawConfig.update((config: DrawConfig) => {
                      config.sd.enable_hr = key.length > 0;
                    });
                  }}
                  items={[
                    {
                      key: "1",
                      label: Locale.StableDiffusion.EnableHr,
                      children: <HiresFix></HiresFix>,
                      style: { marginBottom: 24 },
                    },
                  ]}
                />
              )}
              <Collapse
                onChange={(key) => {
                  if (key.length == 0) {
                    drawConfig.update((config: DrawConfig) => {
                      config.sd.refiner_checkpoint = "";
                    });
                  }
                }}
                items={[
                  {
                    key: "1",
                    label: Locale.StableDiffusion.Refiner,
                    children: <Refiner modelOptions={modelOptions}></Refiner>,
                    style: { marginBottom: 24 },
                  },
                ]}
              />
              <Collapse
                defaultActiveKey={drawConfig.sd.lora.length > 0 ? ["1"] : []}
                items={[
                  {
                    key: "1",
                    label: Locale.StableDiffusion.Lora,
                    children: <Loras></Loras>,
                    style: { marginBottom: 24 },
                  },
                ]}
              />
            </>
          )}
          {drawConfig.sd.api_mode == "extras" && <Extras></Extras>}
        </Form>
      </Modal>
    </div>
  );
}
