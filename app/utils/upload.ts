import {
  getHeaders,
  getHeadersForUpload,
  getUploadUrl,
} from "@/app/client/api";
import { useAccessStore } from "@/app/store";
import { getImageFileFromUrl, wsrvUrl } from "@/app/utils/fileUtil";
import { nanoid } from "nanoid";
import urlJoin from "url-join";

export function uploadImageToOss(
  imgUrl: string | null,
  imgBase64Arr: string[] | null,
): Promise<string[]> {
  const accessStore = useAccessStore.getState();
  if (accessStore.enable_s) {
    return new Promise<string[]>((resolve) => {
      uploadImageToS3(imgUrl, imgBase64Arr).then((imgUrlArr) =>
        resolve(imgUrlArr),
      );
    });
  }
  return new Promise((resolve, reject) => {
    try {
      fetch("/api/upload-oss?fileType=image", {
        method: "POST",
        body: JSON.stringify({ imgUrl: imgUrl, imgBase64Arr: imgBase64Arr }),
        headers: {
          ...getHeaders(),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          resolve(res?.imgUrlArr ? res.imgUrlArr : []);
        });
    } catch (e) {
      console.log("upload oss error !", e);
      resolve([]);
    }
  });
}

export async function uploadFileToFileServer(formData: FormData) {
  let fileUrl = "";
  if (useAccessStore.getState().enable_s) {
    return uploadFileToS3(formData.get("file") as File);
  }
  try {
    await fetch(getUploadUrl("file"), {
      method: "POST",
      body: formData,
      headers: getHeadersForUpload(),
    })
      .then((res) => res.json())
      .then((res) => {
        const dataStr = JSON.stringify(res);
        if (dataStr.includes("http")) {
          fileUrl = dataStr.substring(dataStr.indexOf("http"));
          fileUrl = fileUrl.substring(0, fileUrl.indexOf('"'));
        }
      });
  } catch (e) {
    console.log("upload file error !", e);
  }
  return fileUrl;
}

export async function uploadImageToS3(
  imgUrl: string | null,
  imgBase64Arr: string[] | null,
) {
  let imgUrlArr = [] as string[];
  let files = [] as File[];
  if (imgUrl) {
    let file: File;
    try {
      file = await getImageFileFromUrl(imgUrl);
    } catch (e) {
      console.log("imgUrl to file error!", e);
      file = await getImageFileFromUrl(wsrvUrl(imgUrl));
    }
    files.push(file);
  } else if (imgBase64Arr) {
    for (let imgBase64 of imgBase64Arr) {
      let suffix = "png";
      if (imgBase64.startsWith("data:image")) {
        const strArr = imgBase64.split(";");
        suffix = strArr[0].slice(Math.max(0, strArr[0].indexOf("/") + 1));
        imgBase64 = strArr[1].split(",")[1];
      }
      let fileName = nanoid() + "_" + Date.now() + "." + suffix;

      const fileArrayBuffer = Buffer.from(imgBase64, "base64");
      const blob = new Blob([fileArrayBuffer], { type: "image/" + suffix });
      // 创建File对象
      const file = new File([blob], fileName, { type: "image/" + suffix });
      files.push(file);
    }
  }

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file) => {
        const fileUrl = await uploadFileToS3(file, "images");
        if (fileUrl) {
          imgUrlArr.push(fileUrl);
        }
      }),
    );
  }

  return imgUrlArr;
}

export async function uploadFileToS3(file: File, directory?: string) {
  let fileUrl = "";
  try {
    const filename = `${file.name}-${nanoid()}.${file.name.split(".").at(-1)}`;

    // 精确到以 h 为单位的 path
    const date = new Date().toISOString().split("T")[0];
    const dirname = `${directory || "files"}/${date}`;
    const path = `${dirname}/${filename}`;
    const res = await fetch("/api/get-signed-url", {
      method: "POST",
      headers: {
        ...getHeaders(),
      },
      body: JSON.stringify({
        type: "upload",
        path,
      }),
    });
    const data = await res.json();
    if (data.url) {
      const uploadRes = await fetch(data.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      console.log("uploadRes", uploadRes);
      fileUrl = urlJoin(useAccessStore.getState().public_domain, path);
    }
  } catch (e) {
    console.log("upload file to s3 error", e);
  }

  return fileUrl;
}
