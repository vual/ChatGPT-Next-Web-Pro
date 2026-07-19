import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { uploadImg } from "@/app/api/oss";
import { ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { getServerSideConfig } from "@/app/config/server";

const BASE_URL = process.env.MIDJOURNEY_PROXY_URL ?? null;
const API_SECRET = process.env.MIDJOURNEY_PROXY_API_SECRET ?? null;
const hideMjSetting = !!process.env.HIDE_MIDJOURNEY_SETTING;
const REPLACE_MJURL_WITH_BASEURL =
  process.env.REPLACE_MJURL_WITH_BASEURL ?? null;

const serverConfig = getServerSideConfig();

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Midjourney Route] params ", params);

  const customMjProxyUrl = req.headers.get("midjourney-proxy-url");
  const customMjProxySecret = req.headers.get("midjourney-proxy-secret");
  if (customMjProxyUrl && !customMjProxySecret) {
    return NextResponse.json(
      {
        error: true,
        msg: "please set MIDJOURNEY_API_KEY",
      },
      {
        status: 401,
      },
    );
  }
  let mjApiSecret = customMjProxySecret ? customMjProxySecret : API_SECRET;
  let mjProxyUrl = BASE_URL;
  if (
    !hideMjSetting &&
    customMjProxyUrl &&
    (customMjProxyUrl.startsWith("http://") ||
      customMjProxyUrl.startsWith("https://"))
  ) {
    mjProxyUrl = customMjProxyUrl;
  }

  // 如果没取到mj接口地址，则取openai的接口地址和key
  if (!mjProxyUrl && REPLACE_MJURL_WITH_BASEURL == "1") {
    mjProxyUrl = process.env.BASE_URL ?? "";
  }
  if (!mjApiSecret && REPLACE_MJURL_WITH_BASEURL == "1") {
    mjApiSecret = process.env.OPENAI_API_KEY ?? "";
  }

  if (!mjProxyUrl) {
    return NextResponse.json(
      {
        error: true,
        msg: "please set MIDJOURNEY_PROXY_URL in .env.",
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
    "/api/midjourney/",
    "",
  );

  if (mjProxyUrl.endsWith("/")) {
    mjProxyUrl = mjProxyUrl.slice(0, -1);
  }

  if (
    !mjProxyUrl.endsWith("mj") ||
    !mjProxyUrl.endsWith("mj-relax") ||
    !mjProxyUrl.endsWith("mj-fast") ||
    !mjProxyUrl.endsWith("mj-turbo")
  ) {
    mjProxyUrl += "/mj";
  }

  let fetchUrl = `${mjProxyUrl}/${reqPath}`;

  console.log("[MJ Proxy] ", fetchUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchOptions: RequestInit = {
    //@ts-ignore
    headers: {
      Authorization: "Bearer " + mjApiSecret,
      "mj-api-secret": mjApiSecret,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
    signal: controller.signal,
    //@ts-ignore
    duplex: "half",
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
    if (data?.status == "SUCCESS" && data.imageUrl) {
      const imgUrlArr = await uploadImg(data.imageUrl, []);
      if (imgUrlArr) {
        data.imageUrl = imgUrlArr[0];
      }
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      statusText: res.statusText,
    });
  } catch (e) {
    console.error("[Midjourney] ", e);
    return NextResponse.json(prettyObject(e));
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
