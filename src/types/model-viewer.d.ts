// JSX typing for the <model-viewer> custom element (@google/model-viewer), limited to the attributes this site uses.
// Boolean attributes are passed as "" (present) or undefined (absent), as React 19 does for custom elements.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src: string;
  alt: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  "camera-controls"?: string;
  "interaction-prompt"?: "auto" | "none";
  "shadow-intensity"?: string;
  exposure?: string;
  "environment-image"?: string;
  "camera-orbit"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
