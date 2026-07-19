import styles from "./login.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import GithubIcon from "../icons/github.svg";
import { QRCode, Tabs } from "antd";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useAuthStore } from "@/app/store/auth";
import { showToast } from "@/app/components/ui-lib";

export function LoginPage(props: { setIsLogin: (flag: boolean) => void }) {
  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Login.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Login.Tips}</div>

      <div className={styles["login-tabs"]}>
        <Tabs
          defaultActiveKey="1"
          size={"small"}
          centered={true}
          items={[
            {
              key: "1",
              label: Locale.Login.ByWeChat,
              children: <LonginByWeChat setIsLogin={props.setIsLogin} />,
            },
            {
              key: "2",
              disabled: true,
              label: Locale.Login.ByUser,
              children: <LonginByUser />,
            },
            {
              key: "3",
              disabled: true,
              label: Locale.Login.Register,
              children: <Register />,
            },
          ]}
        ></Tabs>
      </div>

      <a
        href={"https://github.com/vual/ChatGPT-Next-Web-Pro"}
        target="_blank"
        rel="noopener noreferrer"
        className={styles["github-icon"]}
      >
        <IconButton icon={<GithubIcon />} shadow />
      </a>
    </div>
  );
}

export function LonginByUser() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [verifyImg, setVerifyImg] = useState<string>("");

  const getVerifyImg = () => {
    const randomStr = nanoid();
    setVerifyImg("/api/backend/code?randomStr=" + randomStr);
  };
  const login = (username: string, password: string) => {};

  useEffect(() => {
    getVerifyImg();
  }, []);

  return (
    <div className={styles["login-by-user"]}>
      <input
        className={styles["login-account"]}
        type="text"
        placeholder={Locale.Login.Account}
        onChange={(e) => {
          setUsername(e.currentTarget.value);
        }}
      />
      <input
        className={styles["login-password"]}
        type="password"
        placeholder={Locale.Login.Password}
        onChange={(e) => {
          setPassword(e.currentTarget.value);
        }}
      />
      <div className={styles["verifycode"]}>
        <input
          className={styles["verifycode-input"]}
          type="text"
          placeholder={Locale.Login.VerifyCode}
          onChange={(e) => {
            setVerifyCode(e.currentTarget.value);
          }}
        />
        <img src={verifyImg} onClick={getVerifyImg} />
      </div>

      <IconButton
        className={styles["login-button"]}
        text={Locale.Login.Confirm}
        type="primary"
        onClick={() => login(username, password)}
      />
    </div>
  );
}

export function LonginByWeChat(props: { setIsLogin: (flag: boolean) => void }) {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>("https://ai.annyun.cn");
  const [status, setStatus] = useState<any>("loading");
  // const [timerId, setTimerId] = useState<any>();
  const [sceneStr, setSceneStr] = useState<string>(nanoid());
  const queryParam = new URLSearchParams(window.location.search);
  const getQRCode = () => {
    fetch("/api/backend/admin/wxmp/getQRCode?sceneStr=" + sceneStr, {
      method: "get",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code == 0) {
          setQrCode(res.data);
          setStatus("active");
        }
      });
  };

  const loginFromWeChat = () => {
    const code = queryParam.get("code") + "";
    const state = queryParam.get("state") + "";
    authStore.loginByWeChat({ sceneStr, code, state }).then((res) => {
      if (res == "success") {
        showToast(Locale.Login.Success);
        setTimeout(() => props.setIsLogin(true), 1500);
      } else if (res == "wechat_scan") {
        setStatus("loading");
      }
    });
  };

  const checkScanStatus = (startTime: number, timerIntervalId: any) => {
    if (new Date().getTime() > startTime + 120 * 1000) {
      window.clearInterval(timerIntervalId);
      setStatus("expired");
    }
    // 校验是否扫码登录成功
    authStore.loginByWeChat({ sceneStr, code: "", state: "" }).then((res) => {
      if (res == "success") {
        showToast(Locale.Login.Success);
        window.clearInterval(timerIntervalId);
        setTimeout(() => props.setIsLogin(true), 1500);
      } else if (res == "wechat_scan") {
        setStatus("loading");
      }
    });
  };

  useEffect(() => {
    let timerTimeoutId = null as any;
    let timerIntervalId = null as any;
    // 如果微信点进来，则直接判断登录
    if (queryParam && queryParam.get("code")) {
      timerTimeoutId = setTimeout(() => loginFromWeChat(), 2000);
    } else {
      setStatus("loading");
      // 获取二维码
      timerTimeoutId = setTimeout(() => getQRCode(), 2000);
      // 开始定时任务，检查扫码登录状态
      let startTime = new Date().getTime();
      timerIntervalId = setInterval(() => {
        checkScanStatus(startTime, timerIntervalId);
      }, 6000);
    }
    return () => {
      window.clearTimeout(timerTimeoutId);
      window.clearInterval(timerIntervalId);
    };
  }, [sceneStr]);

  return (
    <div className={styles["login-by-wechat"]}>
      <QRCode
        value={qrCode}
        size={200}
        status={status}
        bgColor={"white"}
        onRefresh={() => setSceneStr(nanoid())}
      />
      <p>{Locale.Login.TipsWeChat}</p>
    </div>
  );
}

export function Register() {
  return <div className={styles["register"]}></div>;
}
