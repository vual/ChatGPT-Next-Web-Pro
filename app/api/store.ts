import fs from "fs";

export function setStoreCode(code: string) {
  const data = {
    code,
    time: new Date().getTime(),
  };
  try {
    fs.writeFileSync(
      "/home/node/cache",
      Buffer.from(JSON.stringify(data)).toString("base64"),
      "utf-8",
    );
  } catch (e) {}
}

export function getStoreCode() {
  let data = {
    code: "",
    time: new Date().getTime(),
  };
  try {
    const dataStr = fs.readFileSync("/home/node/cache", "utf-8");
    data = JSON.parse(Buffer.from(dataStr, "base64").toString());
  } catch (e) {}
  return data;
}
