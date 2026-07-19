import { Image } from "antd";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { Modal, showToast } from "@/app/components/ui-lib";
import ConfirmIcon from "@/app/icons/confirm.svg";
import React, { useState } from "react";
import styles from "./image-select.module.scss";
import { useChatStore } from "@/app/store";
import { UploadFile } from "antd/es/upload/interface";

export function ImageSelect(props: {
  imgUrlArr: string[];
  setShowDrawConfigModal: (show: boolean) => void;
  setUploadImages: (uploadImages: UploadFile[]) => void;
  onClose: () => void;
}) {
  const chatStore = useChatStore();
  const [activeIndex, setActiveIndex] = useState(-1);

  const onClick = (index: number) => {
    setActiveIndex(index);
  };

  const onConfirm = () => {
    if (activeIndex < 0) {
      showToast(Locale.StableDiffusion.NeedSelectImg);
      return;
    }
    chatStore.updateTargetSession(chatStore.currentSession(), (session) => {
      const imgUrl = props.imgUrlArr[activeIndex];
      let fileName = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
      if (fileName.indexOf("?") > 0) {
        fileName = fileName.split("?")[0];
      }
      const file = {
        uid: "0",
        name: fileName,
        status: "done",
        url: imgUrl,
      } as UploadFile;
      props.setUploadImages([file]);
    });

    props.onClose();
    props.setShowDrawConfigModal(true);
  };

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.StableDiffusion.SelectImg}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="comfirm"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.Midjourney.Comfirm}
            type="primary"
            onClick={onConfirm}
          />,
        ]}
      >
        <div className={styles["image-list"]}>
          {props.imgUrlArr.map((imgUrl, index) => {
            return (
              <Image
                key={index}
                width={200}
                className={styles[activeIndex == index ? "image-selected" : ""]}
                preview={false}
                onClick={() => onClick(index)}
                src={imgUrl}
              />
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
