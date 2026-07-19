import { StoreKey } from "@/app/constant";
import { createPersistStore } from "@/app/utils/store";

const FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";

export interface AuthStore {
  basic: string;
  token: string;
  refreshToken: string;
  expiredAt: number;
  userInfo: any;
  setBasic: (basic: string) => void;
  getBasic: () => string;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setExpireAt: (expiredAt: number) => void;
  removeToken: () => void;
  setUserInfo: (userInfo: any) => void;

  checkToken: (type: string) => boolean;
  doRefreshToken: () => Promise<void>;
  login: (data: any) => Promise<boolean>;
  loginByWeChat: (data: any) => Promise<String>;
  loginByMobile: (data: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
}

export const useAuthStore = createPersistStore(
  {
    basic: "",
    token: "",
    refreshToken: "",
    expiredAt: 0,
    userInfo: {} as any,
  },
  (set, get) => ({
    setBasic(basic: string) {
      set(() => ({
        basic: basic,
      }));
    },

    getBasic() {
      return get().basic;
    },

    setToken(token: string) {
      set(() => ({
        token: token,
      }));
    },

    setRefreshToken(refreshToken: string) {
      set(() => ({
        refreshToken: refreshToken,
      }));
    },

    setExpireAt(expiredAt: number) {
      set(() => ({
        expiredAt: expiredAt,
      }));
    },

    removeToken() {
      set(() => ({
        token: "",
        refreshToken: "",
      }));
    },

    setUserInfo(userInfo: any) {
      set(() => ({
        userInfo: userInfo,
      }));
    },

    checkToken(type: string) {
      // 如果是微信进来，则每次都走登录
      const queryParam = new URLSearchParams(window.location.search);
      if (type == "login" && queryParam && queryParam.get("code")) {
        return false;
      }
      // token还在有效期
      const now = new Date().getTime();
      if (get().expiredAt && now < get().expiredAt) {
        // 如果有效小于半小时了，则自动续期
        if (get().expiredAt - now < 30 * 60 * 1000) {
          this.doRefreshToken();
        }
        return true;
      } else {
        return false;
      }
      // let result = false;
      // const token = get().token;
      // const authorization = "Basic " + get().basic;
      // await fetch("/api/backend/auth/token/check_token?token=" + token, {
      //   method: "get",
      //   headers: {
      //     Authorization: authorization,
      //     "Content-Type": FORM_CONTENT_TYPE,
      //   },
      // })
      //   .then((res) => res.json())
      //   .then((res) => {
      //     if (res && res.access_token) {
      //       result = true;
      //       // TODO 续约
      //     }
      //   });
      // return result;
    },

    async doRefreshToken() {
      const getTokenTime = new Date().getTime();
      const params =
        "refresh_token=" +
        get().refreshToken +
        "&grant_type=refresh_token&scope=server";
      fetch("/api/backend/auth/oauth2/token?" + params, {
        method: "post",
        headers: {
          Authorization: get().basic,
          "Content-Type": FORM_CONTENT_TYPE,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.access_token) {
            this.setToken(res.access_token);
            this.setRefreshToken(res.refresh_token);
            this.setExpireAt(getTokenTime + (res.expires_in - 60) * 1000);
            this.setUserInfo(res.user_info);
          }
        });
    },

    async login(data: any) {
      let result = false;
      let url =
        "/local/auth/oauth2/token?randomStr=39021684570873079&code=15&grant_type=password&scope=server";
      fetch(url, {
        method: "POST",
        body: "username=admin&password=YehdBPev",
        headers: {
          isToken: "false",
          Authorization: "Basic cGlnOnBpZw==",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
        });
      return result;
    },

    async loginByWeChat(data: any) {
      let result = "noLogin";
      this.setBasic("d2VjaGF0OndlY2hhdA==");
      const basicAuth = "Basic d2VjaGF0OndlY2hhdA==";
      const params =
        "sceneStr=" +
        data.sceneStr +
        "&code=" +
        data.code +
        "&state=" +
        data.state +
        "&grant_type=wechat&scope=server";
      try {
        const getTokenTime = new Date().getTime();
        await fetch("/api/backend/auth/oauth2/token?" + params, {
          method: "post",
          headers: {
            Authorization: basicAuth,
            "Content-Type": FORM_CONTENT_TYPE,
          },
        })
          .then((res) => res.json())
          .then((res) => {
            if (res && res.access_token) {
              this.setToken(res.access_token);
              this.setRefreshToken(res.refresh_token);
              this.setExpireAt(getTokenTime + (res.expires_in - 60) * 1000);
              this.setUserInfo(res.user_info);
              result = "success";
            } else {
              result = res.msg;
            }
          });
      } catch (err) {
        console.log(err);
      }

      return result;
    },

    async loginByMobile(data: any) {
      let result = false;
      return result;
    },

    async register(data: any) {
      let result = false;
      return result;
    },
  }),
  {
    name: StoreKey.Auth,
    version: 1.0,
    migrate(persistedState, version) {
      const state = persistedState as AuthStore;

      return state as any;
    },
  },
);
