import { Form, InputNumber, Select } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { Modal, showConfirm } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import ResetIcon from "@/app/icons/reload.svg";
import { DrawConfig, useDrawConfigStore } from "@/app/store/draw-config";
import ConfirmIcon from "@/app/icons/confirm.svg";
import React from "react";

export function DallEConfigModal(props: {
  uploadImages: UploadFile[];
  setUploadImages: (uploadImages: UploadFile[]) => void;
  onClose: () => void;
}) {
  const drawConfig = useDrawConfigStore();

  const QUALITY_LIST = [
    { value: "auto", label: "auto" },
    { value: "hight", label: "hight" },
    { value: "hd", label: "hd" },
    { value: "standard", label: "standard" },
  ];

  const SIZE_LIST = [
    { value: "1024x1024", label: "1024x1024" },
    { value: "1024x1536", label: "1024x1536" },
    { value: "1536x1024", label: "1536x1024" },
    { value: "1792x1024", label: "1792x1024" },
    { value: "1024x1792", label: "1024x1792" },
  ];

  const STYLE_LIST = [
    { value: "vivid", label: "vivid" },
    { value: "natural", label: "natural" },
  ];

  const RESPONSE_FORMAT_LIST = [
    { value: "url", label: "url" },
    { value: "b64_json", label: "base64" },
  ];

  const onNumChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.dall.n = value ? value : 1;
    });
  };

  const onSelctChange = (field: string, value: string) => {
    drawConfig.update((config: DrawConfig) => {
      // @ts-ignore
      config.dall[field] = value;
    });
  };

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
            text={Locale.Midjourney.Reset}
            type="danger"
            onClick={async () => {
              if (await showConfirm(Locale.Midjourney.ResetTips)) {
                drawConfig.reset("dall");
                props.setUploadImages([] as UploadFile[]);
              }
            }}
          />,
          <IconButton
            key="comfirm"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.Midjourney.Comfirm}
            type="primary"
            onClick={() => props.onClose()}
          />,
        ]}
      >
        <Form labelCol={{ span: 10 }} layout={"horizontal"}>
          <Form.Item label={Locale.Dall.Num}>
            <InputNumber
              style={{ width: 200 }}
              value={drawConfig.dall.n}
              onChange={onNumChange}
              disabled
            />
          </Form.Item>
          <Form.Item label={Locale.Dall.Quality}>
            <Select
              value={drawConfig.dall.quality}
              onChange={(value: string) => onSelctChange("quality", value)}
              options={QUALITY_LIST}
              style={{ width: 200, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Dall.Size}>
            <Select
              value={drawConfig.dall.size}
              onChange={(value: string) => onSelctChange("size", value)}
              options={SIZE_LIST}
              style={{ width: 200, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Dall.Style}>
            <Select
              value={drawConfig.dall.style}
              onChange={(value: string) => onSelctChange("style", value)}
              options={STYLE_LIST}
              style={{ width: 200, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Dall.ResponseFormat}>
            <Select
              value={drawConfig.dall.response_format}
              onChange={(value: string) =>
                onSelctChange("response_format", value)
              }
              options={RESPONSE_FORMAT_LIST}
              style={{ width: 200, zIndex: 999 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
