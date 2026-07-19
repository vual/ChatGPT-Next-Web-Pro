import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ModelProvider } from "@/app/constant";
import { getServerSideConfig } from "@/app/config/server";
import { S3 } from "@/app/api/s3";

const serverConfig = getServerSideConfig();
async function handle(req: NextRequest) {
  if (!serverConfig.enable_s) {
    return NextResponse.json({});
  }
  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  let url = "";
  let urls = [] as string[];
  let s3 = new S3();
  const reqJson = await req.json();
  if (reqJson.type === "upload") {
    url = await s3.createPreSignedUrl(reqJson.path);
  } else {
    if (reqJson.path) {
      url = await s3.createPreSignedUrlForPreview(reqJson.path);
    } else {
      for (let i = 0; i < reqJson.paths.length; i++) {
        urls.push(await s3.createPreSignedUrlForPreview(reqJson.paths[i]));
      }
    }
  }

  return NextResponse.json({ url, urls });
}

export const GET = handle;

export const POST = handle;
