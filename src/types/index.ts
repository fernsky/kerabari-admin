export type FormAttachmentType =
  | "audio_monitoring"
  | "house_image"
  | "house_image_selfie"
  | "business_image"
  | "business_image_selfie";

export interface FormAttachment {
  path: string;
  type: FormAttachmentType;
}
