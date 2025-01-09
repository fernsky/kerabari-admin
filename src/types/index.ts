export type FormAttachmentType = "survey_image" | "audio_monitoring";

export interface FormAttachment {
  path: string;
  type: FormAttachmentType;
}
