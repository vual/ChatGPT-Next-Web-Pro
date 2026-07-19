import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { uploadImg, uploadFile } from "@/app/api/oss";
import { ModelProvider } from "@/app/constant";

const ossType = process.env.OSS_TYPE ?? "";
const endPoint = process.env.OSS_ENDPOINT ?? "";
const accessKey = process.env.OSS_ACCESS_KEY ?? "";
const secretKey = process.env.OSS_SECRET_KEY ?? "";
// 自定义上传文件接口
const FILE_UPLOAD_URL = process.env.FILE_UPLOAD_URL ?? "";

async function handle(req: NextRequest) {
  if ((!ossType || !endPoint || !accessKey || !secretKey) && !FILE_UPLOAD_URL) {
    return NextResponse.json({});
  }
  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const fileType = searchParams.get("fileType");
  if (fileType == "image") {
    const reqText = await req.text();
    const reqBody = JSON.parse(reqText);
    const imgUrlArr = await uploadImg(reqBody.imgUrl, reqBody.imgBase64Arr);
    return NextResponse.json({ imgUrlArr });
  } else if (fileType == "file") {
    const formData = await req.formData();
    const fileUrl = await uploadFile(formData.get("file") as File);
    return NextResponse.json({ fileUrl });
  }

  return NextResponse.json({});
}

export const GET = handle;

export const POST = handle;

export const runtime = "nodejs";
