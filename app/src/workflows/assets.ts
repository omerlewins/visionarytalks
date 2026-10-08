import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { PayloadRequest } from "payload";
import { submissionKey } from "./engine";
import { responseStep, type ProviderCheckpoint } from "./openai";
import { readBlobDocument } from "../cms/blob-storage";
export async function documentPackets(
  ids: (number | string)[],
  req: PayloadRequest,
) {
  const packets = [];
  let bytes = 0;
  for (const id of ids) {
    const doc = await req.payload.findByID({
      collection: "source-documents",
      id,
      req,
    });
    let content: Buffer;
    if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
      content = await readBlobDocument(req, "source-documents", doc);
    } else if (process.env.S3_BUCKET) {
      const s3 = new S3Client({
        region: process.env.S3_REGION ?? "auto",
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
      const result = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `${(doc as any).prefix ?? "private"}/${doc.filename}`,
        }),
      );
      content = Buffer.from(await result.Body!.transformToByteArray());
    } else {
      const root = path.resolve("media/private");
      const file = path.resolve(root, doc.filename!);
      if (!file.startsWith(root + path.sep))
        throw new Error("Invalid stored document path");
      content = await readFile(file);
    }
    bytes += content.length;
    if (bytes > 8 * 1024 * 1024)
      throw new Error(
        "NEEDS_INPUT: Source packet exceeds 8 MB. Split the packet.",
      );
    packets.push({
      id: doc.id,
      title: doc.title,
      mime: doc.mimeType,
      base64: content.toString("base64"),
    });
  }
  return packets;
}
export async function illustrate(
  packet: Record<string, any>,
  jobKey: string,
  req: PayloadRequest,
  checkpoint: ProviderCheckpoint = {},
  save: (checkpoint: ProviderCheckpoint) => Promise<void> = async () => {},
) {
  const key = `illustration:${jobKey}`;
  const prior = await req.payload.find({
    collection: "generated-assets",
    req,
    where: { key: { equals: key } },
    limit: 1,
  });
  if (prior.docs[0]) return (prior.docs[0].data as any).mediaID as number;
  const endpoint = process.env.IMAGE_PROVIDER_URL,
    token = process.env.IMAGE_PROVIDER_TOKEN;
  if (process.env.IMAGE_PROVIDER !== "openai" && (!endpoint || !token))
    throw new Error(
      "NEEDS_INPUT: Text draft saved. Connect the approved illustration provider or choose an approved existing image.",
    );
  if (packet.workflow === "leader" && !packet.referenceImages?.length)
    throw new Error(
      "NEEDS_INPUT: A leader portrait requires an identity reference before image generation.",
    );
  let result: any;
  if (process.env.IMAGE_PROVIDER === "openai") {
    const model = process.env.OPENAI_IMAGE_ORCHESTRATOR_MODEL,
      imageModel = process.env.OPENAI_IMAGE_MODEL;
    if (!model || !imageModel)
      throw new Error(
        "NEEDS_INPUT: Configure approved image generation models",
      );
    const style = await readFile(
      path.resolve("public/reference/satya-nadella-illustration.png"),
    );
    const references = [];
    for (const id of packet.referenceImages ?? []) {
      const media = await req.payload.findByID({
        collection: "media",
        id,
        req,
      });
      if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
        references.push({
          type: "input_image",
          image_url: `data:${media.mimeType};base64,${(await readBlobDocument(req, "media", media)).toString("base64")}`,
        });
      } else if (process.env.S3_BUCKET) {
        const s3 = new S3Client({
          region: process.env.S3_REGION ?? "auto",
          endpoint: process.env.S3_ENDPOINT,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        });
        const file = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `${(media as any).prefix ?? "media"}/${media.filename}`,
          }),
        );
        references.push({
          type: "input_image",
          image_url: `data:${media.mimeType};base64,${Buffer.from(await file.Body!.transformToByteArray()).toString("base64")}`,
        });
      } else {
        const root = path.resolve("media"),
          file = path.resolve(root, media.filename!);
        if (!file.startsWith(root + path.sep))
          throw new Error("Invalid reference path");
        references.push({
          type: "input_image",
          image_url: `data:${media.mimeType};base64,${(await readFile(file)).toString("base64")}`,
        });
      }
    }
    const response = await responseStep(
      {
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Create an editorial illustration of ${packet.name}. The first image is STYLE ONLY, never the subject identity. Remaining images are identity references. Monochrome engraved drawing, fine crosshatching, natural proportions. No text, chart, numbers, quotations or logos. Human likeness review is mandatory.`,
              },
              {
                type: "input_image",
                image_url: `data:image/png;base64,${style.toString("base64")}`,
              },
              ...references,
            ],
          },
        ],
        tools: [
          {
            type: "image_generation",
            model: imageModel,
            output_format: "webp",
          },
        ],
      },
      checkpoint,
      save,
    );
    const generated = response.output.find(
      (o: any) => o.type === "image_generation_call",
    );
    if (!generated?.result) throw new Error("Image provider returned no image");
    result = {
      base64: generated.result,
      alt: `Editorial illustration of ${packet.name}`,
      provider: "openai",
      model: imageModel,
    };
  } else {
    if (new URL(endpoint!).protocol !== "https:")
      throw new Error("Image provider requires HTTPS");
    const response = await fetch(endpoint!, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(40000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": key,
      },
      body: JSON.stringify({
        subject: packet.name,
        referenceIDs: packet.referenceImages,
        promptVersion: "monochrome-editorial-v1",
        instructions:
          "Black-and-white engraved editorial illustration, fine crosshatching, natural proportions. Match the approved Visionary Talks reference style. No text, numerical claims, charts, invented logos or quotations. Identity likeness requires human review.",
      }),
    });
    if (!response.ok)
      throw new Error(`Image provider failed (${response.status})`);
    const body = await response.text();
    if (body.length > 6 * 1024 * 1024)
      throw new Error("Image response exceeds upload limit");
    result = JSON.parse(body);
  }
  if (
    typeof result.base64 !== "string" ||
    !result.alt ||
    !result.provider ||
    !result.model
  )
    throw new Error("Image response requires base64, alt, provider and model");
  const buffer = await sharp(Buffer.from(result.base64, "base64"), {
    limitInputPixels: 24000000,
  })
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  const hash = submissionKey(buffer.toString("base64"));
  const existing = await req.payload.find({
    collection: "media",
    where: { checksum: { equals: hash } },
    req,
    limit: 1,
  });
  const media =
    existing.docs[0] ??
    (await req.payload.create({
      collection: "media",
      req,
      file: {
        data: buffer,
        mimetype: "image/webp",
        name: `editorial-${hash}.webp`,
        size: buffer.length,
      },
      data: {
        alt: result.alt,
        credit:
          "AI-generated editorial illustration. Likeness review required.",
        generated: true,
        approved: false,
        checksum: hash,
        provenance: {
          provider: result.provider,
          model: result.model,
          promptVersion: "monochrome-editorial-v1",
          referenceIDs: packet.referenceImages,
          createdAt: new Date().toISOString(),
        },
      },
    }));
  await req.payload.create({
    collection: "generated-assets",
    req,
    data: {
      name: packet.name,
      key,
      state: "needs_likeness_review",
      data: { mediaID: media.id, checksum: hash },
    },
  });
  return media.id;
}
