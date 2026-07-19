import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ModelProvider } from "@/app/constant";

const BASE_URL =
  process.env.DISCORDCDN_PROXY_URL ?? "https://cdn.discordapp.com";

async function handle(req: NextRequest) {
  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const reqPath = `${req.nextUrl.pathname}`.replaceAll(
    "/api/cnd-discordapp/",
    "",
  );

  let fetchUrl = BASE_URL + `/${reqPath}`;
  return await fetch(fetchUrl, {
    method: req.method,
    body: req.body,
    cache: "no-store",
  });
}

export const GET = handle;

export const runtime = "nodejs";
