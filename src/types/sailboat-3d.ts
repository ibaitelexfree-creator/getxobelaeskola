export type SailboatCategory = "Jarcia" | "Casco" | "Apéndices" | "Velamen";

export interface CameraCoordinates {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

export interface SailboatPart {
  id: string;
  category: SailboatCategory;
  label: string;
  camera: CameraCoordinates;
  description_html: string;
}
