export type TableDisplayMode = "table" | "pie" | "bar";

export interface TableColorScheme {
  key: string;
  color: string;
}

export interface ContentItem {
  id: string;
  type: "paragraph" | "table";
  order: number;
}

export interface TableDisplayConfig extends ContentItem {
  type: "table";
  displayMode: TableDisplayMode;
  colorScheme: TableColorScheme[];
}

export interface ParagraphDisplayConfig extends ContentItem {
  type: "paragraph";
}

export interface DisplaySchema {
  content: Array<ParagraphDisplayConfig | TableDisplayConfig>;
}
