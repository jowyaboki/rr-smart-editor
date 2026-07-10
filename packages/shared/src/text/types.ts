export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: 'normal' | 'italic';
  letterSpacing: number;
  lineHeight: number;
  paragraphSpacing?: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  opacity: number;
}

export interface TextLayout {
  width: number | 'auto';
  height: number | 'auto';
  padding: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  wrap: boolean;
  overflow: 'visible' | 'hidden' | 'ellipsis';
}

export interface TextObject {
  id: string;
  content: string;
  style: TextStyle;
  layout: TextLayout;
  transform: {
    rotation: number;
    scale: number;
    originX: string | number;
    originY: string | number;
  };
}

export interface TextPreset {
  id: string;
  name: string;
  object: Partial<TextObject>;
}

export interface TextTheme {
  styles: TextStyle[];
  defaultStyleId: string;
}
