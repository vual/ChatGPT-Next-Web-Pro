import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { uploadImg } from "@/app/api/oss";
import { ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { getServerSideConfig } from "@/app/config/server";

const BASE_URL = process.env.STABLE_DIFFUSION_BASE_URL ?? "";
const API_KEY = process.env.STABLE_DIFFUSION_API_KEY ?? "";
const TIMEOUT =
  parseInt(process.env.STABLE_DIFFUSION_TIMEOUT ?? "10") * 60 * 1000;
const hideSdSetting = !!process.env.HIDE_SD_SETTING;

const serverConfig = getServerSideConfig();
async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[stable-diffusion Route] params ", params);

  const custom_base_url = hideSdSetting ? "" : req.headers.get("sd-proxy-url");

  if (!BASE_URL && !custom_base_url) {
    return NextResponse.json(
      {
        error: true,
        msg: "please set STABLE_DIFFUSION_BASE_URL in .env.",
      },
      {
        status: 500,
      },
    );
  }

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const reqPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/stable-diffusion/",
    "/sdapi/v1/",
  );

  let fetchBaseUrl = custom_base_url ? custom_base_url : BASE_URL;
  if (fetchBaseUrl.endsWith("/")) {
    fetchBaseUrl = fetchBaseUrl.slice(0, -1);
  }

  let fetchUrl = `${fetchBaseUrl}${reqPath}`;

  console.log("[stable-diffusion fetchUrl] ", fetchUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT);

  const fetchOptions: RequestInit = {
    //@ts-ignore
    headers: {
      Authorization: "Bearer " + API_KEY,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
    signal: controller.signal,
    //@ts-ignore
    duplex: "half",
    redirect: "manual",
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    if (res.status !== 200) {
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    // 开启了s3，则直接返回，让浏览器去上传。
    if (serverConfig.enable_s) {
      return res;
    }

    const data = await res.json();
    // 后台直接把图片上传到oss
    if (data.images || data.image) {
      const imgUrlArr = await uploadImg("", data.images || [data.image]);
      if (imgUrlArr) {
        data.imgUrlArr = imgUrlArr;
        data.images = [];
        data.image = "";
      }
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      statusText: res.statusText,
    });
  } catch (e) {
    console.error("[Stable-diffusion] ", e);
    return NextResponse.json(prettyObject(e));
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
