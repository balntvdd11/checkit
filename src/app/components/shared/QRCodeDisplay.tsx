import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG 
      id="qr-code-svg" 
      value={value} 
      size={size} 
      level={"L"} 
      includeMargin={false} 
      fgColor="#1A080E" 
      bgColor="white" 
    />
  );
}
