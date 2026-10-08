import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  text: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<Props> = ({
  text,
  size = 140,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  className = '',
}) => {
  const [svgUrl, setSvgUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      text,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err, string) => {
        if (!err && string && isMounted) {
          const blob = new Blob([string], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          setSvgUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
      if (svgUrl) URL.revokeObjectURL(svgUrl);
    };
  }, [text, fgColor, bgColor]);

  if (!svgUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white/10 animate-pulse rounded ${className}`}
      />
    );
  }

  return (
    <img
      src={svgUrl}
      alt={`QR Code for ${text}`}
      width={size}
      height={size}
      className={`block object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
