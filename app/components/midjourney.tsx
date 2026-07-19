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

export function MidjourneyConfigModal(props: {
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

  const onStylizeChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.mj.stylize = value ? value : 0;
    });
  };

  const onTileChange = (checked: boolean) => {
    drawConfig.update((config: DrawConfig) => {
      config.mj.tile = checked;
    });
  };

  const onSeedChange = (value: number | null) => {
    drawConfig.update((config: DrawConfig) => {
      config.mj.seed = value ? value : -1;
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

  const maxCount = drawConfig.mj.mode == "BLEND" ? 5 : 1;

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
            text={Locale.Midjourney.Reset}
            type="danger"
            onClick={async () => {
              if (await showConfirm(Locale.Midjourney.ResetTips)) {
                drawConfig.reset("mj");
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
          <Form.Item label={Locale.Midjourney.Mode}>
            <Radio.Group
              name={"mode"}
              onChange={onRadioChange}
              value={drawConfig.mj.mode}
            >
              <Radio value={"IMAGINE"}>{Locale.Midjourney.ModeImagine}</Radio>
              <Radio value={"BLEND"}>{Locale.Midjourney.ModeBlend}</Radio>
              <Radio value={"DESCRIBE"}>{Locale.Midjourney.ModeDescribe}</Radio>
              <Radio value={"INSIGHTFACE"}>
                {Locale.Midjourney.InsightFace}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Reference}>
            <Row>
              <Col>
                <Upload
                  action={getUploadUrl("file")}
                  headers={getHeadersForUpload()}
                  accept=".png, .jpg, .jpeg, .webp"
                  listType="picture-card"
                  fileList={sourceImages}
                  onChange={uploadChange}
                >
                  {sourceImages.length >= maxCount
                    ? null
                    : uploadButton(
                        drawConfig.mj.mode == "INSIGHTFACE"
                          ? "source"
                          : "upload",
                      )}
                </Upload>
              </Col>
              {drawConfig.mj.mode == "INSIGHTFACE" && (
                <Col style={{ marginLeft: 10 }}>
                  <Upload
                    action={getUploadUrl("file")}
                    headers={getHeadersForUpload()}
                    accept=".png, .jpg, .jpeg, .webp"
                    listType="picture-card"
                    fileList={targetImages}
                    onChange={uploadTargetChange}
                  >
                    {targetImages.length >= 1 ? null : uploadButton("target")}
                  </Upload>
                </Col>
              )}
            </Row>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Engine}>
            <Radio.Group
              name={"engine"}
              onChange={onRadioChange}
              value={drawConfig.mj.engine}
            >
              <Radio value={"Midjourney"}>{Locale.Midjourney.EngineMidj}</Radio>
              <Radio value={"Niji"}>{Locale.Midjourney.EngineNiji}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.EngineVersion}>
            <Select
              value={drawConfig.mj.engineVersion}
              onChange={onEngineVersionChange}
              options={ENGINE_VERSION_LIST}
              style={{ width: 200, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Size}>
            <Radio.Group
              name={"size"}
              onChange={onRadioChange}
              value={drawConfig.mj.size}
            >
              <Radio value={"1:1"}>{"1:1"}</Radio>
              <Radio value={"3:2"}>{"3:2"}</Radio>
              <Radio value={"3:4"}>{"3:4"}</Radio>
              <Radio value={"4:3"}>{"4:3"}</Radio>
              <Radio value={"9:16"}>{"9:16"}</Radio>
              <Radio value={"16:9"}>{"16:9"}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Quality}>
            <Radio.Group
              name={"quality"}
              onChange={onRadioChange}
              value={drawConfig.mj.quality}
            >
              <Radio value={".25"}>{Locale.Midjourney.Quality1}</Radio>
              <Radio value={".5"}>{Locale.Midjourney.Quality2}</Radio>
              <Radio value={"1"}>{Locale.Midjourney.Quality3}</Radio>
              <Radio value={"2"}>{Locale.Midjourney.Quality4}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Chaos}>
            <Row>
              <Col span={8}>
                <Slider
                  min={0}
                  max={100}
                  onChange={onChaosChange}
                  value={
                    typeof drawConfig.mj.chaos === "number"
                      ? drawConfig.mj.chaos
                      : 0
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={0}
                  max={100}
                  style={{ margin: "0 16px" }}
                  value={drawConfig.mj.chaos}
                  onChange={onChaosChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Stylize}>
            <Row>
              <Col span={8}>
                <Slider
                  min={0}
                  max={1000}
                  onChange={onStylizeChange}
                  value={
                    typeof drawConfig.mj.stylize === "number"
                      ? drawConfig.mj.stylize
                      : 0
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={0}
                  max={1000}
                  style={{ margin: "0 16px" }}
                  value={drawConfig.mj.stylize}
                  onChange={onStylizeChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Tile}>
            <Switch checked={drawConfig.mj.tile} onChange={onTileChange} />
          </Form.Item>
          <Form.Item label={Locale.Midjourney.Seed}>
            <InputNumber
              style={{ width: 200 }}
              value={drawConfig.mj.seed}
              onChange={onSeedChange}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
