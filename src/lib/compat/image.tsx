import React from 'react';

export default function AppImage({ src, alt, fill, ...props }: any) {
  const style = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover',
      }
    : {};

  return <img src={src} alt={alt} style={style as any} {...props} />;
}
