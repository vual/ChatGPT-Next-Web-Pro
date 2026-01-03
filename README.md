# ChatGPT-Next-Web-Pro

基于 ChatGPT-Next-Web 的增强版本，覆盖多模态、绘图、音乐、视频等扩展，提供「无后台」与「有后台」两种形态。

## 声明
- 本项目代码未开源，但安全性与原版 ChatGPT-Next-Web 完全一致。
- 所有版本不包含任何恶意代码，不会窃取或泄露 key。
- 如有担心，可在部署服务器安装抓包工具，分析所有对外请求。

## 其它项目
- **[`lobe-chat-pro`](https://github.com/vual/lobe-chat-pro)**（更强大的绘图、音乐、视频面板，支持 sora、veo、gpt-image-1、nano banana、midjourney、suno、luma、runway、快手可灵、豆包画图等）
- **[`aiiai-api`](https://github.com/vual/aiiai-api)**（基于 new-api 二次开发的开源项目，增加支持更多模型）

## 推荐中转接口
- [`api.annyun.cn`](https://api.annyun.cn/)（免配置，拿 key 即可用）
- [`api.annyun.top`](https://api.aiiai.top/register?aff=B4fi)（免配置，拿 key 即可用）

## 版本
### 无后台
- 更新日期：2025.12.01
- 版本号：
  - 3.9.18（完整功能，需授权码）
  - 3.8.7（免费版，无需授权码）
- Demo 演示：参考下方「有后台版本」的用户端说明。该版本与有后台版本在界面与功能上存在差异：无登录、无套餐列表、无用户中心、无管理端。

### 有后台
- 更新日期：2025.12.01
- 版本号：latest
- Demo 演示：
  - 用户端：[https://nextweb.annyun.cn](https://nextweb.annyun.cn)，（支持公众号扫码授权登录、邮箱注册；手机号登录演示站未配置）
  - 管理端：[https://nextadmin.annyun.cn](https://nextadmin.annyun.cn),（账号：`annyun`，密码：`123456`）

## 特性概览
| 类别 | 特性 | 无后台（3.8.*） | 无后台（3.9+） | 有后台 |
|---|---|---|---|---|
| 基础 | 完整 ChatGPT-Next-Web（每次发版合并原版） | ✓ | ✓ | ✓ |
| 文件解析 | 解析上传文件为 markdown 并与模型联合分析（pdf/word/ppt/excel/image(ocr)/audio/html/txt/zip） | × | × | ✓ |
| 文件上传与存储 | S3 存储（兼容阿里云 OSS、腾讯 COS、minio、AWS、Cloudflare R2 等） | × | ✓ | ✓ |
|  | 阿里云 | ✓ | ✓ | ✓ |
|  | 腾讯云 | ✓ | ✓ | ✓ |
|  | minio | ✓ | ✓ | ✓ |
|  | 自定义上传接口 | ✓ | ✓ | ✓ |
| 绘图 | midjourney 标准版 | ✓ | ✓ | ✓ |
|  | midjourney-plus（AI 换脸、局部重绘等） | × | ✓ | ✓ |
|  | midjourney 独立绘图面板 | × | ✓ | ✓ |
|  | Stable-Diffussion（sd-webui 接口） | ✓ | ✓ | ✓ |
|  | Dall-E-3（含走 OpenAI 画图接口的其他模型） | ✓ | ✓ | ✓ |
|  | gpt-image-1（支持重绘） | × | ✓ | ✓ |
|  | 绘图记录 | ✓ | ✓ | ✓ |
| 音乐 | suno（chat 格式） | ✓ | ✓ | ✓ |
| 视频 | luma | × | ✓ | ✓ |
| 多模态 | 识图、whisper、tts | ✓ | ✓ | ✓ |
| 逆向模型 | gpts、gpt-4o-all | ✓ | ✓ | ✓ |
| fastgpt | 将 fastgpt 知识库作为模型使用 | ✓ | ✓ | ✓ |
| 其他 | 翻译 | ✓ | ✓ | ✓ |
|  | 语音输入 | ✓ | ✓ | ✓ |
|  | 朗读文字 | ✓ | ✓ | ✓ |
|  | 自定义网站标题、副标题、icon | ✓ | ✓ | ✓ |
|  | 实时展示用户输入 token 数量 | ✓ | ✓ | ✓ |
|  | 会话主题展示模型名称 | × | ✓ | ✓ |
|  | 支持用户自定义名称与头像 | × | ✓ | ✓ |
|  | 插件按钮自定义 | × | ✓ | ✓ |
| 登录注册 | 手机号 | × | × | ✓ |
|  | 邮箱 | × | × | ✓ |
|  | 公众号扫码 | × | × | ✓ |
| AI 管理 | 平台管理 | × | × | ✓ |
|  | 模型管理（可设默认、翻译、总结、识图） | × | × | ✓ |
|  | apikey 管理 | × | × | ✓ |
| 套餐管理 | 套餐资源 | × | × | ✓ |
|  | 套餐信息 | × | × | ✓ |
|  | 套餐兑换码 | × | × | ✓ |
| 订单管理 | 订单信息 | × | × | ✓ |
| 会员管理 | 会员信息 | × | × | ✓ |
|  | 会员套餐 | × | × | ✓ |
| 会话管理 | 会话主题 | × | × | ✓ |
|  | 会话消息 | × | × | ✓ |
| 支付方式 | 微信支付 | × | × | ✓ |
|  | 易支付 | × | × | ✓ |
|  | 虎皮椒支付 | × | × | ✓ |
| 其它 | 敏感词管理 | × | × | ✓ |
|  | 快捷提示词管理 | × | × | ✓ |

## 详细说明
- [无后台版本特性](./docs/无后台版本详细功能说明.md)
- [有后台版本特性](./docs/有后台版本详细功能说明.md)
- [参数说明](./docs/参数说明.md)
- [需要准备什么](./docs/需要准备什么.md)

## 示例图片（无后台）
<details>
  <summary>展开查看</summary>

  <div style="display: flex;flex-direction: column">
    <div style="display: flex;flex-direction: row;">
      <img src="./images/img1.png" width="49%">
      <img src="./images/img2.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img3.png" width="49%">
      <img src="./images/img4.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img5.png" width="49%">
      <img src="./images/img6.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img7.png" width="49%">
      <img src="./images/img8.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img9.png" width="49%">
      <img src="./images/img10.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img11.png" width="49%">
      <img src="./images/img12.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img14.png" width="49%">
      <img src="./images/img15.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/img16.png" width="49%">
    </div>
  </div>

</details>

## 示例图片（有后台）
<details>
  <summary>展开查看</summary>

  <div style="display: flex;flex-direction: column">
    <div style="display: flex;flex-direction: row;">
      <img src="./images/backend/img1.png" width="49%">
      <img src="./images/backend/img2.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img3.png" width="49%">
      <img src="./images/backend/img4.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img5.png" width="49%">
      <img src="./images/backend/img6.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img7.png" width="49%">
      <img src="./images/backend/img8.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img9.png" width="49%">
      <img src="./images/backend/img17.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img11.png" width="49%">
      <img src="./images/backend/img12.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img13.png" width="49%">
      <img src="./images/backend/img14.png" width="49%">
    </div>
    <div style="display: flex;flex-direction: row">
      <img src="./images/backend/img15.png" width="49%">
      <img src="./images/backend/img16.png" width="49%">
    </div>
  </div>

</details>

## 无后台版本部署与启动
### 1. 拉取镜像
```shell
docker pull registry.cn-hangzhou.aliyuncs.com/ann-chat/chatgpt-next-web-pro:3.9.18
```
### 2. 启动应用
```shell
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY="sk-xxxxxx" \
  -e AUTHORIZE_CODE="授权码" \
  registry.cn-hangzhou.aliyuncs.com/ann-chat/chatgpt-next-web-pro:3.9.18
```
- `3000:3000` 为端口映射，左侧可自定义，右侧为容器内部端口（不可更改），例如：`3030:3000`、`3080:3000`。
- 如有中转地址，追加 `-e BASE_URL="https://xxxxxx"`，未追加时默认请求 `https://api.openai.com`。
- 其他参数通过追加 `-e <NAME>=<VALUE>`；`\` 为换行拼接。

## 有后台版本部署与启动
### 1. 下载 docker-compose.yml（位于 `/docker/with-backend/`）
```shell
curl -o docker-compose.yml https://github.com/vual/ChatGPT-Next-Web-Pro/tree/main/docker/with-backend/docker-compose.yml
```
若下载失败或下载为 HTML，请直接进入 `/docker/with-backend` 目录查看并复制 `docker-compose.yml` 内容，本地创建同名文件。

### 2. 编辑配置
- 根据需要修改 `docker-compose.yml` 中的环境变量。

### 3. 拉取并启动（如提示无 docker-compose 命令，请先安装）
```shell
docker compose pull
docker compose up -d
```
- 首次启动建议不加 `-d` 观察日志，无报错后结束运行，再以 `-d` 方式重新启动。
- [详细部署说明](./docs/后台版本部署步骤.md)
- [Nginx 参考配置](./docs/nginx.conf)

## 重要提示
- 后台管理默认账号密码 `admin/123456`，进入后务必立即修改密码。

## 常见问题
- [常见问题](./docs/常见问题.md)

## 授权码价格
> 授权绑定你自己的二级域名，绑定后仅能通过该域名访问；一年可修改绑定域名 3 次。可绑定公网 IP（不建议），试用可绑定内网 IP。

### 无后台版本（后续更新不会接入后台相关功能）
- 绑定 1 个域名或 IP：￥189/年，￥369/永久
- 绑定 2 个域名或 IP：￥339/年
- 绑定 3 个域名或 IP：￥469/年

### 有后台版本价格
- 一个授权码，绑定两个域名（用户端与管理端）：￥459/年，￥899/永久
- 授权不包含源码。可先试用，试用不收费。

## 源码可单独出售

## 授权码或者源码获取方式
- 微信：822784588

![image](./images/author.png)

## 交流群
![image](./img_2.png)


