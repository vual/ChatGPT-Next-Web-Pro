import Stream from "stream";
import { nanoid } from "nanoid";
import { ClientOptions } from "minio";
import { getConfig } from "@/app/api/util";

const BASE_URL =
  process.env.DISCORDCDN_PROXY_URL ?? "https://cdn.discordapp.com";
const OSS_TYPE = process.env.OSS_TYPE ?? "";
const END_POINT = process.env.OSS_ENDPOINT ?? "";
const PORT = parseInt(process.env.OSS_PORT ?? "0");
const HTTPS = Boolean(process.env.OSS_HTTPS == "true");
const ACCESS_KEY = process.env.OSS_ACCESS_KEY ?? "";
const SECRET_KEY = process.env.OSS_SECRET_KEY ?? "";
const BUCKET = process.env.OSS_BUCKET ?? "";
const OSS_DOMAIN = process.env.OSS_DOMAIN ?? "";
// 自定义上传文件接口
const FILE_UPLOAD_URL = process.env.FILE_UPLOAD_URL ?? "";
const FILE_UPLOAD_KEY = process.env.FILE_UPLOAD_KEY ?? "";

let aliOssClient: any = null;
let tencentOssClient: any = null;
let minioClient: any = null;
if (OSS_TYPE && END_POINT && ACCESS_KEY && SECRET_KEY) {
  console.log("oss params has");
  const OSS = require("ali-oss");
  const COS = require("cos-nodejs-sdk-v5");
  const Minio = require("minio");

  if (OSS_TYPE == "aliyun") {
    aliOssClient = new OSS({
      endpoint: END_POINT,
      accessKeyId: ACCESS_KEY,
      accessKeySecret: SECRET_KEY,
      bucket: BUCKET,
    });
  } else if (OSS_TYPE == "tencent") {
    tencentOssClient = new COS({
      SecretId: ACCESS_KEY,
      SecretKey: SECRET_KEY,
    });
  } else {
    const minioOptions: ClientOptions = {
      endPoint: END_POINT, //minio服务器ip
      accessKey: ACCESS_KEY, //username
      secretKey: SECRET_KEY, //password
      useSSL: HTTPS,
    };
    if (PORT > 0) {
      minioOptions.port = PORT;
    }
    minioClient = new Minio.Client(minioOptions);
  }
}

// 把文件上传到oss
async function uploadToOss(fileName: string, metadata: any, bufferStream: any) {
  let previewUrl = "";
  try {
    console.log("uploadToOss---OSS_TYPE: " + OSS_TYPE);
    // aliyun oss
    if (OSS_TYPE == "aliyun") {
      await aliOssClient.putStream(fileName, bufferStream);
      await aliOssClient.putACL(fileName, "public-read");
      previewUrl = aliOssClient.generateObjectUrl(fileName);
      if (OSS_DOMAIN) {
        previewUrl = previewUrl.replace(BUCKET + "." + END_POINT, OSS_DOMAIN);
      }
    }
    // tencent oss
    else if (OSS_TYPE == "tencent") {
      const params = {
        Bucket: BUCKET,
        Region: END_POINT,
        Key: fileName,
      };
      await tencentOssClient.putObject({
        ...params,
        Body: bufferStream,
        ContentLength: bufferStream.readableLength,
        ACL: "public-read",
      });
      previewUrl = tencentOssClient.getObjectUrl({
        ...params,
        Sign: true,
      });
      previewUrl = previewUrl.substring(0, previewUrl.indexOf("?"));
    }
    // minio
    else if (OSS_TYPE == "minio") {
      await minioClient.putObject(BUCKET, fileName, bufferStream, metadata);
      previewUrl = await minioClient.presignedUrl("get", BUCKET, fileName);
      previewUrl = previewUrl.substring(0, previewUrl.indexOf("?"));
    }

    // 直接强制https
    if (HTTPS && !previewUrl.startsWith("https")) {
      previewUrl = previewUrl.replace("http", "https");
    }
  } catch (e) {
    console.log("upload file to oss error!", e);
  }

  return previewUrl;
}

// 把文件上传到自定义接口
async function uploadFileToCustomUrl(
  fileName: string,
  arrayBuffer?: any,
  file?: File,
) {
  let previewUrl = "";
  if (FILE_UPLOAD_URL) {
    try {
      console.log("uploadFileToCustomUrl---url: " + FILE_UPLOAD_URL);
      const formData = new FormData();
      if (!file && arrayBuffer) {
        file = new File([new Blob([arrayBuffer])], fileName);
      }
      formData.append("file", file as File);
      await fetch(FILE_UPLOAD_URL, {
        method: "post",
        body: formData,
        headers: {
          Authorization: "Bearer " + FILE_UPLOAD_KEY,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const dataStr = JSON.stringify(res);
          if (dataStr.includes("http")) {
            previewUrl = dataStr.substring(dataStr.indexOf("http"));
            previewUrl = previewUrl.substring(0, previewUrl.indexOf('"'));
          }
        });
    } catch (error) {
      console.log("uploadFileToCustomUrl---error: ", error);
    }
  }

  return previewUrl;
}

function streamToBuffer(stream: any) {
  return new Promise((resolve, reject) => {
    let chunks = [] as any[];
    stream.on("error", reject);
    stream.on("data", (chunk: any) => {
      chunks.push(chunk);
    });
    stream.on("end", resolve(Buffer.concat(chunks)));
  });
}

export async function uploadImg(imgUrl: string, imgBase64Arr: string[]) {
  const resultUrlArr = [] as string[];
  const authConfig = await getConfig();
  if (
    ((!OSS_TYPE || !END_POINT || !ACCESS_KEY || !SECRET_KEY) &&
      !FILE_UPLOAD_URL) ||
    authConfig.version == "" ||
    new Date(authConfig.expireDay).getTime() < new Date().getTime()
  ) {
    if (imgUrl) {
      return [imgUrl];
    }
    return resultUrlArr;
  }

  // 如果有源图片地址
  if (imgUrl) {
    if (imgUrl.indexOf("https://cdn.discordapp.com") > 0) {
      imgUrl = imgUrl.replace("https://cdn.discordapp.com", BASE_URL);
    } else if (imgUrl.indexOf("/api/cnd-discordapp")) {
      imgUrl = imgUrl.replace("/api/cnd-discordapp", BASE_URL);
    }

    let fileName = nanoid() + "_" + new Date().getTime() + ".";
    const metadata = {
      "content-type": "",
      "content-length": 0,
    };

    let previewUrl = "";

    try {
      const bufferStream = new Stream.PassThrough();
      let fileArrayBuffer = undefined;
      // 先下载图片
      await fetch(imgUrl, { method: "get", body: null })
        .then((response) => response.blob())
        .then((blob) => {
          fileName += blob.type.substring(blob.type.indexOf("/") + 1);
          metadata["content-type"] = blob.type;
          metadata["content-length"] = blob.size;
          return blob.arrayBuffer();
        })
        .then((arrayBuffer) => {
          fileArrayBuffer = arrayBuffer;
          bufferStream.end(Buffer.from(arrayBuffer));
        });

      // 上传图片
      previewUrl = await uploadFileToCustomUrl(fileName, fileArrayBuffer);
      if (!previewUrl) {
        previewUrl = await uploadToOss(fileName, metadata, bufferStream);
      }

      if (previewUrl) {
        resultUrlArr.push(previewUrl);
      }
    } catch (e) {
      console.log("fetch image error!", e);
    }
  }

  if (imgBase64Arr) {
    for (let imgBase64 of imgBase64Arr) {
      let suffix = "png";
      if (imgBase64.startsWith("data:image")) {
        const strArr = imgBase64.split(";");
        suffix = strArr[0].substring(strArr[0].indexOf("/") + 1);
        imgBase64 = strArr[1].split(",")[1];
      }
      let previewUrl = "";
      let fileName = nanoid() + "_" + new Date().getTime() + "." + suffix;

      const fileArrayBuffer = Buffer.from(imgBase64, "base64");

      // 上传图片
      previewUrl = await uploadFileToCustomUrl(fileName, fileArrayBuffer);
      if (!previewUrl) {
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(fileArrayBuffer);
        const metadata = {
          "content-type": "image/" + suffix,
          "content-length": bufferStream.readableLength,
        };
        previewUrl = await uploadToOss(fileName, metadata, bufferStream);
      }
      if (previewUrl) {
        resultUrlArr.push(previewUrl);
      }
    }
  }

  if (resultUrlArr.length < 1 && imgUrl) {
    resultUrlArr.push(imgUrl);
  }

  return resultUrlArr;
}

export async function uploadFile(file: File) {
  const authConfig = await getConfig();
  if (
    ((!OSS_TYPE || !END_POINT || !ACCESS_KEY || !SECRET_KEY) &&
      !FILE_UPLOAD_URL) ||
    authConfig.version == "" ||
    new Date(authConfig.expireDay).getTime() < new Date().getTime()
  ) {
    return "";
  }

  const dotIndex = file.name.lastIndexOf(".");
  const fileName =
    file.name.substring(0, dotIndex) +
    "_" +
    nanoid() +
    file.name.substring(dotIndex);
  const metadata = {
    "content-type": file.type,
    "content-length": file.size,
  };

  // 上传文件
  let previewUrl = await uploadFileToCustomUrl(fileName, null, file);
  if (!previewUrl) {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(Buffer.from(await file.arrayBuffer()));
    previewUrl = await uploadToOss(fileName, metadata, bufferStream);
  }

  return previewUrl;
}
