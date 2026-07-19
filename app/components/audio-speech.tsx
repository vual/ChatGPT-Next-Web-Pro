import { Col, Form, InputNumber, Row, Select, Slider } from "antd";
import { Modal, showConfirm } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import ResetIcon from "@/app/icons/reload.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";
import React from "react";
import { ChatConfig, useAppConfig } from "@/app/store";

export function AudioSpeechConfigModal(props: { onClose: () => void }) {
  const config = useAppConfig();

  const VOICE_LIST = [
    { value: "alloy", label: "alloy" },
    { value: "echo", label: "echo" },
    { value: "fable", label: "fable" },
    { value: "onyx", label: "onyx" },
    { value: "nova", label: "nova" },
    { value: "shimmer", label: "shimmer" },
  ];

  const RESPONSE_FORMAT_LIST = [
    { value: "mp3", label: "mp3" },
    { value: "aac", label: "aac" },
    { value: "flac", label: "flac" },
    { value: "opus", label: "opus" },
  ];

  const onSelctChange = (field: string, value: string) => {
    config.update((config: ChatConfig) => {
      // @ts-ignore
      config.speech[field] = value;
    });
  };

  const onSpeedChange = (value: number | null) => {
    config.update((config: ChatConfig) => {
      config.speech.speed = value ? value : 0;
    });
  };

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.Config.SpeechSettings}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.Config.ResetSettings}
            type="danger"
            onClick={async () => {
              if (await showConfirm(Locale.Chat.Config.ResetTips)) {
                config.resetSpeech();
              }
            }}
          />,
          <IconButton
            key="comfirm"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.Chat.Config.Comfirm}
            type="primary"
            onClick={() => props.onClose()}
          />,
        ]}
      >
        <Form labelCol={{ span: 10 }} layout={"horizontal"}>
          <Form.Item label={Locale.Chat.Speech.Voice}>
            <Select
              value={config.speech.voice}
              onChange={(value: string) => onSelctChange("voice", value)}
              options={VOICE_LIST}
              style={{ width: 270, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Chat.Speech.ResponseFormat}>
            <Select
              value={config.speech.response_format}
              onChange={(value: string) =>
                onSelctChange("response_format", value)
              }
              options={RESPONSE_FORMAT_LIST}
              style={{ width: 270, zIndex: 999 }}
            />
          </Form.Item>
          <Form.Item label={Locale.Chat.Speech.Speed}>
            <Row>
              <Col span={8}>
                <Slider
                  min={0.25}
                  max={4.0}
                  step={0.01}
                  onChange={onSpeedChange}
                  value={
                    typeof config.speech.speed === "number"
                      ? config.speech.speed
                      : 1
                  }
                />
              </Col>
              <Col span={2}>
                <InputNumber
                  min={0.25}
                  max={4.0}
                  step={0.01}
                  style={{ margin: "0 16px" }}
                  value={config.speech.speed}
                  onChange={onSpeedChange}
                />
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
