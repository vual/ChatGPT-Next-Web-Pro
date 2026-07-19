import {
  Col,
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
import { Modal, showConfirm } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import ResetIcon from "@/app/icons/reload.svg";
import {
  DrawConfig,
  ENGINE_VERSION_LIST,
  useDrawConfigStore,
} from "@/app/store/draw-config";
import ConfirmIcon from "@/app/icons/confirm.svg";
import React, { useEffect, useState } from "react";
import { getHeadersForUpload, getUploadUrl } from "@/app/client/api";

export function VideoConfigModal(props: {
  uploadImages: UploadFile[];
  setUploadImages: (uploadImages: UploadFile[]) => void;
  onClose: () => void;
}) {
  const drawConfig = useDrawConfigStore();
  const [sourceImages, setSourceImages] = useState<UploadFile[]>([]);
  const [targetImages, setTargetImages] = useState<UploadFile[]>([]);

  const onRadioChange = (e: RadioChangeEvent) => {
    drawConfig.update((config: DrawConfig) => {
      // @ts-ignore
      config.mj[e.target.name] = e.target.value;
    });
  };

  const onEngineVersionChange = (value: string) => {
    drawConfig.update((config: DrawConfig) => {
      config.mj.engineVersion = value;
    });
  };

  const onChaosChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.mj.chaos = value ? value : 0;
    });
  };

  const uploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    event,
  }) => {
    newFileList.forEach((file) => {
      if (file.status == "error") {
        file.response = "";
      }
    });
    setSourceImages(newFileList);
  };

  const uploadTargetChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    event,
  }) => {
    newFileList.forEach((file) => {
      if (file.status == "error") {
        file.response = "";
      }
    });
    setTargetImages(newFileList);
  };

  const onTileChange = (checked: boolean) => {
    drawConfig.update((config: DrawConfig) => {
      config.luma.expand_prompt = checked;
    });
  };

  const uploadButton = (name: string) => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{name}</div>
    </div>
  );

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.InputActions.VideoSetting}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Midjourney.Reset}
            type="danger"
            onClick={async () => {
              if (await showConfirm(Locale.Video.ResetTips)) {
                drawConfig.reset("luma");
                setSourceImages([]);
                setTargetImages([]);
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
            onClick={() => {
              props.setUploadImages(sourceImages.concat(targetImages));
              props.onClose();
            }}
          />,
        ]}
      >
        <Form labelCol={{ span: 3 }} layout={"horizontal"}>
          <Form.Item label={Locale.Video.expandPrompt}>
            <Switch
              checked={drawConfig.luma.expand_prompt}
              onChange={onTileChange}
            />
          </Form.Item>
          <Form.Item label={Locale.Video.ratio}>
            <Radio.Group
              name={"size"}
              onChange={onRadioChange}
              value={drawConfig.luma.aspect_ratio}
            >
              <Radio value={"1:1"}>{"1:1"}</Radio>
              <Radio value={"3:2"}>{"3:2"}</Radio>
              <Radio value={"3:4"}>{"3:4"}</Radio>
              <Radio value={"4:3"}>{"4:3"}</Radio>
              <Radio value={"9:16"}>{"9:16"}</Radio>
              <Radio value={"16:9"}>{"16:9"}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Locale.Video.image}>
            <Row>
              <Upload
                action={getUploadUrl("file")}
                headers={getHeadersForUpload()}
                accept=".png, .jpg, .jpeg, .webp"
                listType="picture-card"
                fileList={sourceImages}
                onChange={uploadChange}
              >
                {sourceImages.length >= 1 ? null : uploadButton("upload")}
              </Upload>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.Video.imageEnd}>
            <Row>
              <Upload
                action={getUploadUrl("file")}
                headers={getHeadersForUpload()}
                accept=".png, .jpg, .jpeg, .webp"
                listType="picture-card"
                fileList={targetImages}
                onChange={uploadTargetChange}
              >
                {sourceImages.length >= 1 ? null : uploadButton("upload")}
              </Upload>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
