import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ModelProvider } from "@/app/constant";
import { getFileFromUrl } from "@/app/utils/fileUtil";

async function handle(req: NextRequest) {
  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const formData = await req.formData();
  const reqForm = new FormData();
  reqForm.append("token", "annyun-llm-niubility");
  if (formData.has("file")) {
    reqForm.append("file", formData.get("file") as File);
  } else if (formData.has("url")) {
    const file = await getFileFromUrl(
      formData.get("url") as string,
      formData.get("name") as string,
    );
    reqForm.append("file", file as File);
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    body: formData,
    //@ts-ignore
    duplex: "half",
    redirect: "manual",
  };

  try {
    const res = await fetch("http://annyun-llm:8000/upload", fetchOptions);
    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } catch (e) {
    console.error("[convert file err] ", e);
  } finally {
  }
}

export const GET = handle;

export const POST = handle;

export const runtime = "edge";
