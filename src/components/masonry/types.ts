import { Ref } from "vue";

export interface ImageInfo {
  width: number;
  height: number;
  url: string;
  status: "error" | "success" | "pending";
}

export interface BlockInfo {
  left: number;
  top: number;
  width: number;
  height: number;
  isLaidOut: boolean;
  image: ImageInfo;
}

export type UpdateLoadCount = () => void;

export interface ScrollProps {
  isOver: Ref<boolean>;
  delay: number;
}

export interface ResizeHelper {
  normalizeProps: () => void;
  layout: () => void;
}
