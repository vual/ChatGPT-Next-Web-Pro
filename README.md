### 版本
#### 无后端：
- 版本号：3.2.1，更新日期：2023.12.01

### 特性（无后端版本）：
- 1.完整的[ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web)功能，并保持同步更新。最近同步时间：2023.11.30
- 2.增加对接midjourney绘图功能，该功能基于[ChatGPT-Midjourney](https://github.com/Licoy/ChatGPT-Midjourney)，使用antd进行了完全的重构，界面更加合理，参数更加全面。
- 3.支持图片上传上传至阿里云oss或Minio（私有化oss），方便图片永久存储，且预览加载更快。
- 4.增加了所有绘画记录页面。
- 5.接入了stable-diffussion，文生图、图生图、后期处理、图片信息，近乎完整的参数设置，以及图片完成后的菜单按钮。
- 6.stable-diffusion加入了lora模型。
- 7.增加翻译功能，自动识别输入的内容是中文还是英文（如果大部分是中文，则翻译成英文，反之亦然）。
- 8.设置里增加自定义mj代理密钥，且兼容oneapi的mj代理，并增加环境变量 HIDE_MIDJOURNEY_SETTING，如果设成1，则隐藏mj设置。
- 9.设置里增加展示聊天记录占用存储情况，浏览器localstorage只有5m，存储快满时，建议导出数据备份，然后删除浏览器存的对话。
- 10.增加支持gpt4-vision-preview识图功能，可以上传多张图片。建议配合OSS使用，不然受限于浏览器localstorage只有5m，本地聊天记录不保存图片信息，配置了则会保存图片链接。由于国外无法访问国内oss，只会把图片base64发送出去。

### 特性（有后端版本）：
- 1.包含无后端版本的完整功能。
- 2.正在接入后端管理，目前已实现公众号扫码登录，待其它功能实现后发布。

### 后续待实现
- 【完成】1.接入stable diffussion绘画。
- 【doing】2.接入后端管理，增加账号登录功能。
- 【     】3.权限管理，角色分配，绘画权限，知识库权限，聊天记录保存、查阅等。
- 【     】4.微信扫码、企微免登。
- 【     】5.接入主流知识库，如fastGPT、Dify等。
- 【     】6.联网搜索。
- 【     】7.function call。
- 【     】8.接入DALL-E。
- 【     】9.待思考。。。

### 示例图片
![image](./images/img1.png)
![image](./images/img2.png)
![image](./images/img3.png)
![image](./images/img4.png)
![image](./images/img5.png)
![image](./images/img6.png)
![image](./images/img7.png)
![image](./images/img8.png)

### 增加的参数
| 参数名称                        | 必填 | 说明                                                                                                                                                                                                                                                    |
|-----------------------------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MIDJOURNEY_PROXY_URL        | 否  | Midjourney代理地址，详细请看[midjourney-proxy](https://github.com/novicezk/midjourney-proxy)                                                                                                                                                                   |
| MIDJOURNEY_PROXY_API_SECRET | 否  | Midjourney代理地址接口密钥，详细请看[midjourney-proxy](https://github.com/novicezk/midjourney-proxy)                                                                                                                                                               |
| HIDE_MIDJOURNEY_SETTING     | 否  | 如果需要隐藏Midjourney设置，则把值设成 1                                                                                                                                                                                                                            |
| DISCORDCDN_PROXY_URL        | 否  | Discordcdn图片地址代理，不填的话，如果访问不了discordcdn，就获取不到图片                                                                                                                                                                                                        |
| STABLE_DIFFUSION_BASE_URL   | 否  | Stable-diffusion的接口地址，需要启动[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)，[开启api](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API)。如果要用该功能，必须要配置后面的OSS相关参数，因为stable-diffusion返回的是图片base64，需要有地方存图片 |
| STABLE_DIFFUSION_TIMEOUT    | 否  | Stable-diffusion的接口超时时间，默认10分钟                                                                                                                                                                                                                        |
| OSS_TYPE                    | 否  | OSS 类型，取值( aliyun 或 minio )。填了代表需要上传到oss，且下面的相关参数都得填，具体看下面的参数说明                                                                                                                                                                                       |
| OSS_ENDPOINT                | 否  | 服务器地址，如：aliyun：oss-accelerate.aliyuncs.com，minio：192.168.2.120(这边只填ip，不需要http前缀，端口填在下面那个参数)                                                                                                                                                           |
| OSS_PORT                    | 否  | type为minio，且endpoint为ip时，则需要有端口                                                                                                                                                                                                                       |
| OSS_HTTPS                   | 否  | type为minio，根据实际情况开启，如果endpoint是ip，那就false                                                                                                                                                                                                             |
| OSS_ACCESS_KEY              | 否  | aliyun则填accessKeyId，minio则填username                                                                                                                                                                                                                   |
| OSS_SECRET_KEY              | 否  | aliyun则填accessKeySecret，minio则填password                                                                                                                                                                                                               |
| OSS_BUCKET                  | 否  | 桶名称（minio的桶权限需要设成public，阿里云的可以不要，但上传的文件会设成public）                                                                                                                                                                                                     |
| OSS_DOMAIN                  | 否  | aliyun oss 绑定的域名, 2019.9.23后创建的bucket，需要绑定域名，不然无法预览                                                                                                                                                                                                   |
| AUTHORIZE_CODE              | 是  | 授权码，获取方式，请看后面                                                                                                                                                                                                                                         |

### 需要准备什么
如果你没有直通的网络环境，则需要准备以下事项
- 1.一个域名，因为代理discord，openai，以及aliyun-oss，都需要域名
- 2.部署discord代理，项目地址[discord-proxy](https://github.com/vual/discord-proxy)，fork到自己仓库，然后使用vercel进行部署，绑定自己的域名。
- 3.部署[midjourney-proxy](https://github.com/novicezk/midjourney-proxy)，详细请到对应项目查看。
- 4.部署[openai代理](https://github.com/vual/vercel-proxy-openai)，fork到自己仓库，然后使用vercel进行部署，绑定自己的域名。
- 5.获取阿里云oss的endpoint，key等，[详细参考](https://zhuanlan.zhihu.com/p/445967642) ，bucket可以不用设为公共读，但上传的图片会自动设成公共读。2019.9.23后创建的bucket，需要绑定自己的域名，才能预览。[跨域问题](https://help.aliyun.com/zh/oss/the-no-access-control-allow-origin-error-message-is-still-reported-when-you-call-oss-after-setting-cross-domain-rules)
- 6.部署minio私有化oss，bucket必须要设成public。
- 7.使用stable-diffusion功能需要启动[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)，详细启动方式请到对应项目查看：https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API

### 启动
```shell
docker pull registry.cn-hangzhou.aliyuncs.com/ann-chat/chatgpt-next-web-pro:3.2.1

docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY="sk-xxxx" \
  -e AUTHORIZE_CODE="授权码" \
  registry.cn-hangzhou.aliyuncs.com/ann-chat/chatgpt-next-web-pro:3.2.1
```

### 授权码价格
#### 无后端版本（后续更新也不会接入后端相关功能）：
- 绑定1个域名或IP，限时特惠：￥99
- 绑定2个域名或IP，限时特惠：￥159
- 绑定3个域名或IP，限时特惠：￥199

（付费即永久授权，可以先试用，试用不收费）

### 授权码获取方式
微信：822784588

![image](./images/author.png)


