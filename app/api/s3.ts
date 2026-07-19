import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_S3_REGION = "us-east-1";

const fileEnv = {
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_REGION: process.env.S3_REGION,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_SET_ACL: process.env.S3_SET_ACL !== "0",
  S3_ENABLE_PATH_STYLE: process.env.S3_ENABLE_PATH_STYLE === "1",
};

export class S3 {
  private readonly client: S3Client;

  private readonly bucket: string;

  private readonly setAcl: boolean;

  constructor() {
    if (
      !fileEnv.S3_ACCESS_KEY_ID ||
      !fileEnv.S3_SECRET_ACCESS_KEY ||
      !fileEnv.S3_BUCKET
    )
      throw new Error(
        "S3 environment variables are not set completely, please check your env",
      );

    this.bucket = fileEnv.S3_BUCKET;
    this.setAcl = fileEnv.S3_SET_ACL;

    this.client = new S3Client({
      credentials: {
        accessKeyId: fileEnv.S3_ACCESS_KEY_ID,
        secretAccessKey: fileEnv.S3_SECRET_ACCESS_KEY,
      },
      endpoint: fileEnv.S3_ENDPOINT,
      forcePathStyle: fileEnv.S3_ENABLE_PATH_STYLE,
      region: fileEnv.S3_REGION || DEFAULT_S3_REGION,
    });
  }

  public async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.client.send(command);
  }

  public async deleteFiles(keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    });

    return this.client.send(command);
  }

  public async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`No body in response with ${key}`);
    }

    return response.Body.transformToString();
  }

  public async getFileByteArray(key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`No body in response with ${key}`);
    }

    return response.Body.transformToByteArray();
  }

  public async createPreSignedUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? "public-read" : undefined,
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  public async uploadContent(path: string, content: string) {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? "public-read" : undefined,
      Body: content,
      Bucket: this.bucket,
      Key: path,
    });

    return this.client.send(command);
  }

  public async createPreSignedUrlForPreview(
    key: string,
    expiresIn?: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresIn ?? 12 * 3600,
    });
  }
}
