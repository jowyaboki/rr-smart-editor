import { TextObject, TextStyle, TextLayout } from '@ai-video-editor/shared';

export const TextEngine = {
  getStyleObject(textObj: TextObject): React.CSSProperties {
    const { style, layout, transform } = textObj;

    return {
      // Typography
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      letterSpacing: `${style.letterSpacing}px`,
      lineHeight: style.lineHeight,
      color: style.color,
      opacity: style.opacity,

      // Decorative
      textShadow: style.shadowColor ? `${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 0}px ${style.shadowBlur || 0}px ${style.shadowColor}` : 'none',
      WebkitTextStroke: style.strokeWidth ? `${style.strokeWidth}px ${style.strokeColor}` : 'none',
      backgroundColor: style.backgroundColor || 'transparent',

      // Layout
      width: layout.width === 'auto' ? 'auto' : `${layout.width}px`,
      height: layout.height === 'auto' ? 'auto' : `${layout.height}px`,
      padding: `${layout.padding}px`,
      textAlign: layout.textAlign,
      display: 'flex',
      alignItems: layout.verticalAlign === 'middle' ? 'center' : layout.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
      justifyContent: layout.textAlign === 'center' ? 'center' : layout.textAlign === 'right' ? 'flex-end' : 'flex-start',
      wordBreak: layout.wrap ? 'break-word' : 'normal',
      whiteSpace: layout.wrap ? 'pre-wrap' : 'nowrap',
      overflow: layout.overflow,

      // Transform
      transform: `rotate(${transform.rotation}deg) scale(${transform.scale})`,
      transformOrigin: `${transform.originX} ${transform.originY}`
    };
  }
};
