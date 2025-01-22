import { and, eq } from "drizzle-orm";
import { attachmentTypesEnum, surveyAttachments } from "../../db/schema";
import axios from "axios";
import { getValueFromNestedField } from "@/server/utils/data";
import { ODKConfig } from "../types";

export async function handleAttachment(
  submission: any,
  attachmentPath: any,
  ctx: any,
  odkConfig: ODKConfig,
) {
  const attachmentName = getValueFromNestedField(
    submission,
    attachmentPath.path,
  );
  if (!attachmentName) return;

  if (await attachmentExists(ctx, submission.__id, attachmentName)) {
    return;
  }

  const attachment = await downloadAttachment(
    submission,
    attachmentName,
    odkConfig,
  );

  await uploadToStorage(ctx, submission.__id, attachmentName, attachment);
  await recordAttachment(
    ctx,
    submission.__id,
    attachmentName,
    attachmentPath.type,
  );
}

async function attachmentExists(
  ctx: any,
  submissionId: string,
  attachmentName: string,
) {
  const existingAttachment = await ctx.db
    .select()
    .from(surveyAttachments)
    .where(
      and(
        eq(surveyAttachments.dataId, submissionId),
        eq(surveyAttachments.name, attachmentName),
      ),
    )
    .limit(1);

  if (existingAttachment.length > 0) {
    console.log(
      `Attachment ${attachmentName} for submission ${submissionId} already exists in the database.`,
    );
    return true;
  }
  return false;
}

async function downloadAttachment(
  submission: any,
  attachmentName: string,
  odkConfig: any,
) {
  const { siteEndpoint, odkProjectId, odkFormId, token } = odkConfig;
  const attachmentUrl = `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}/submissions/${submission.__id}/attachments/${attachmentName}`;

  const response = await axios.get(attachmentUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "arraybuffer",
  });

  return response.data;
}

async function uploadToStorage(
  ctx: any,
  submissionId: string,
  attachmentName: string,
  attachment: Buffer,
) {
  if (!process.env.BUCKET_NAME) {
    throw new Error("Bucket name not found");
  }

  const lastSevenDigits = submissionId.slice(-7);
  const newAttachmentName = `${lastSevenDigits}_${attachmentName}`;

  await ctx.minio.putObject(
    process.env.BUCKET_NAME,
    newAttachmentName,
    attachment,
  );

  return newAttachmentName;
}

async function recordAttachment(
  ctx: any,
  submissionId: string,
  attachmentName: string,
  attachmentType: string,
) {
  const lastSevenDigits = submissionId.slice(-7);
  const newAttachmentName = `${lastSevenDigits}_${attachmentName}`;

  await ctx.db
    .insert(surveyAttachments)
    .values({
      dataId: submissionId,
      type: attachmentType as (typeof attachmentTypesEnum.enumValues)[number],
      name: newAttachmentName,
    })
    .onConflictDoNothing();
}
