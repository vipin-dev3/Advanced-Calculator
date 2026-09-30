export interface PlottedFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  isValid: boolean;
}

export interface GraphBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Point2D {
  x: number;
  y: number;
}

