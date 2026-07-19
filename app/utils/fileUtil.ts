import { nanoid } from "nanoid";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file as any);
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", (error) => reject(error));
  });
};

export const base64ToFile = (base64: string, filename: string): File => {
  // Extract content type and base64 data
  const arr = base64.split(",");
  const matchResult = arr[0].match(/:(.*?);/);
  const mime = matchResult ? matchResult[1] : "image/png";

  // Convert base64 to binary
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  // Create File object
  return new File([u8arr], filename, { type: mime });
};

export function getImageSuffix(url: string): string {
  if (url.includes(".webp")) {
    return "webp";
  } else if (url.includes(".jpeg") || url.includes(".jpg")) {
    return "jpeg";
  }
  return "png";
}

export function getImageFileFromUrl(url: string): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.addEventListener("error", (e) => reject(e));
    img.addEventListener("load", () => {
      // 创建canvas元素
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      // 设置canvas尺寸与图片相同
      canvas.width = img.width;
      canvas.height = img.height;

      // 将图片绘制到canvas上
      ctx.drawImage(img, 0, 0);

      const type = getImageSuffix(url);

      // 将canvas内容转换为Blob对象
      canvas.toBlob((blob) => {
        // 创建一个File对象
        if (blob) {
          const file = new File([blob], nanoid() + "." + type, {
            lastModified: Date.now(),
            type: blob.type,
          });

          resolve(file);
        } else {
          reject("read image error!");
        }
      }, "image/" + type); // 指定文件类型
    });
  });
}

export const getFileFromUrl = async (fileUrl: string, fileName: string) => {
  try {
    const res = await fetch(fileUrl);
    const blob = (await res.blob()) as Blob;
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (e) {
    console.log("fetch file error!", e);
  }
  return null;
};

export const wsrvUrl = (url: string) => {
  let urlStr = url;
  const arr = urlStr.split(/([a-z-]+)ttachments/gi, 3);
  if (arr.length === 3) {
    urlStr = `https://cdn.discordapp.com/${arr[1]}ttachments` + arr[2];
  }
  return `https://wsrv.nl/?url=` + encodeURIComponent(urlStr);
};

// export const saveImageByUrl = async (imageUrl: string, directory: string) => {
//   let file: File;
//   try {
//     file = await getImageFileFromUrl(imageUrl);
//   } catch (e) {
//     console.log('imageurl to file error!', e);
//     file = await getImageFileFromUrl(wsrvUrl(imageUrl));
//   }
//
//   try {
//     if (isServerMode) {
//       const metadata = await uploadService.uploadWithProgress(file, {
//         directory,
//       });
//
//       if (metadata.path) {
//         return metadata.path;
//       }
//     }
//
//     // 本地存储base64
//     const base64 = await fileToBase64(file);
//     return base64;
//   } catch (e) {
//     console.log('save image error', e);
//   }
//   return imageUrl;
// };
//
// export const saveFileByUrl = async (fileUrl: string, fileType: string, directory: string) => {
//   if (isServerMode && fileUrl && fileUrl.startsWith('http')) {
//     let file: File;
//     try {
//       file = await getFileFromUrl(fileUrl, nanoid() + '.' + fileType);
//       const metadata = await uploadService.uploadWithProgress(file, {
//         directory,
//       });
//
//       if (metadata.path) {
//         return metadata.path;
//       }
//     } catch (e) {
//       console.log('fetch file or save file to oss', e);
//     }
//   }
//   return fileUrl;
// };
//
// export const saveImageByBase64 = async (base64: string) => {
//   try {
//     const uploadServer = serverConfigSelectors.enableUploadFileToServer(
//       window.global_serverConfigStore.getState(),
//     );
//
//     if (uploadServer) {
//       let imgBase64 = base64;
//       let suffix = 'png';
//       if (imgBase64.startsWith('data:image')) {
//         const strArr = imgBase64.split(';');
//         suffix = strArr[0].slice(Math.max(0, strArr[0].indexOf('/') + 1));
//         imgBase64 = strArr[1].split(',')[1];
//       }
//       let fileName = nanoid() + '_' + Date.now() + '.' + suffix;
//
//       const fileArrayBuffer = Buffer.from(imgBase64, 'base64');
//
//       // 精确到以 h 为单位的 path
//       const date = (Date.now() / 1000 / 60 / 60).toFixed(0);
//       const dirname = `${fileEnv.NEXT_PUBLIC_S3_FILE_PATH}/${date}`;
//       const pathname = `${dirname}/${fileName}`;
//
//       const url = await edgeClient.upload.createS3PreSignedUrl.mutate({ pathname });
//       const res = await fetch(url, {
//         body: fileArrayBuffer,
//         headers: { 'Content-Type': 'image/' + suffix },
//         method: 'PUT',
//       });
//
//       if (res.ok) {
//         return url;
//       }
//     }
//   } catch (e) {
//     console.log('save image base64 error', e);
//   }
//
//   // 如果上传失败，返回原base64
//   return base64;
// };
