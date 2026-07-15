import { QRCodeSVG } from 'qrcode.react';
import coaLogo from '../../../asset/coalogo.png';

export default function QRCodeDisplay({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG 
      id="qr-code-svg" 
      value={value} 
      size={size} 
      level={"H"} 
      includeMargin={false} 
      fgColor="#1A080E" 
      bgColor="white"
      imageSettings={{
        src: coaLogo,
        height: size * 0.25,
        width: size * 0.25,
        excavate: true,
      }}
    />
  );
}
