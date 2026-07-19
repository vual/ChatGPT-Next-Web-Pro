import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

const BASE_URL = process.env.LUMA_PROXY_URL ?? null;
const API_KEY = process.env.LUMA_API_KEY ?? null;

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Luma Route] params ", params);

  const customProxyUrl = req.headers.get("luma-proxy-url");
  const customApiKey = req.headers.get("luma-api-key");
  if (customProxyUrl && !customApiKey) {
    return NextResponse.json(
      {
        error: true,
        msg: "please set LUMA_API_KEY",
      },
      {
        status: 401,
      },
    );
  }
  let apiKey = customApiKey ? customApiKey : API_KEY;
  let proxyUrl = BASE_URL;
  if (
    customProxyUrl &&
    (customProxyUrl.startsWith("http://") ||
      customProxyUrl.startsWith("https://"))
  ) {
    proxyUrl = customProxyUrl;
  }

  if (!proxyUrl) {
    return NextResponse.json(
      {
        error: true,
        msg: "please set LUMA_PROXY_URL in .env.",
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
    "/api/luma/",
    "",
  );

  if (proxyUrl.endsWith("/")) {
    proxyUrl = proxyUrl.slice(0, -1);
  }

  let fetchUrl = `${proxyUrl}/${reqPath}`;

  console.log("[luma Proxy] ", fetchUrl);

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
      Authorization: "Bearer " + apiKey,
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

    return res;
  } catch (e) {
    console.error("[Luma] ", e);
    return NextResponse.json(prettyObject(e));
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
