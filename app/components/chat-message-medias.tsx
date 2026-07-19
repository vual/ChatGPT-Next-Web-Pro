import styles from "./chat.module.scss";
import { ChatMessage } from "../store/chat";
import { useEffect, useState } from "react";
import { getMessageMedias } from "@/app/utils";
import { Image } from "antd";

export function ChatMessageMedias(props: { message: ChatMessage }) {
  const [medias, setMedias] = useState({} as any);

  useEffect(() => {
    if (!props.message.streaming) {
      setMedias(getMessageMedias(props.message));
    }
  }, [props.message.content]);

  return (
    <>
      {medias.images?.length > 0 && (
        <div
          className={styles["chat-message-item-images"]}
          style={
            {
              "--image-count": medias.images.length,
            } as React.CSSProperties
          }
        >
          {medias.images.map((image: string, index: number) => {
            return (
              <Image
                className={styles["chat-message-item-image-multi"]}
                key={index}
                src={image}
                alt=""
              />
            );
          })}
        </div>
      )}
      {medias.audios?.length > 0 && (
        <div className={styles["chat-message-item-audios"]}>
          {medias.audios.map((audio: string, index: number) => {
            return (
              <audio key={index} preload={"metadata"} controls>
                <source src={audio} />
              </audio>
            );
          })}
        </div>
      )}
      {medias.videos?.length > 0 && (
        <div className={styles["chat-message-item-videos"]}>
          {medias.videos.map((video: string, index: number) => {
            return (
              <video key={index} preload={"metadata"} controls>
                <source src={video} />
              </video>
            );
          })}
        </div>
      )}
      {medias.files?.length > 0 && (
        <div>
          {medias.files.map((file: any, index: number) => {
            return (
              <a key={index} href={file.url}>
                {file.name}
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
