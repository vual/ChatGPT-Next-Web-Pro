import { ChatMessage } from "@/app/store";
import { Modal, showToast } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import Locales from "@/app/locales";
import React, { useRef, useState } from "react";
import { getMessageImages } from "@/app/utils";
import styles from "./home.module.scss";
import { IconButton } from "@/app/components/button";
import {
  toMask,
  toMaskWithOriginal,
} from "@/app/components/mj/mask-editor/utils";
import { MaskEditor } from "@/app/components/mj/mask-editor/maskEditor";

export function InpaintModal(props: {
  message: ChatMessage;
  customId: string;
  doSubmit: (action: string, mjExt: any) => void;
  onClose: () => void;
}) {
  const [imageUrl] = useState(getMessageImages(props.message)[0]);

  //@ts-ignore
  const canvasRef: React.MutableRefObject<HTMLCanvasElement> = useRef(null);
  const [inputText, setInputText] = useState("");

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.MjPanel.VaryRegion}
        contentClassName={styles["inpaint-modal-content"]}
        onClose={props.onClose}
        footer={
          <>
            <IconButton
              type={"primary"}
              text={Locales.MjPanel.SubmitRegion}
              onClick={async () => {
                if (!inputText) {
                  showToast(
                    Locales.MjPanel.ParamIsRequired(Locales.MjPanel.Prompt),
                  );
                  return;
                }
                props.doSubmit(
                  props.customId == "gpt-image" ? inputText : props.customId,
                  {
                    prompt: inputText,
                    maskBase64:
                      props.customId == "gpt-image"
                        ? await toMaskWithOriginal(canvasRef.current, imageUrl)
                        : toMask(canvasRef.current),
                    image: imageUrl,
                    isEdit: true,
                  },
                );
                props.onClose();
              }}
            ></IconButton>
          </>
        }
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <MaskEditor
              src={imageUrl}
              canvasRef={canvasRef}
              boxSize={{
                x: 400,
                y: 400,
              }}
              maskColor={"#0021ff"}
            />
            <input
              style={{
                marginTop: "20px",
                width: "100%",
              }}
              type="text"
              placeholder={Locales.MjPanel.Prompt}
              className={styles["user-prompt-search"]}
              onInput={(e) => setInputText(e.currentTarget.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
