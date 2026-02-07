import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
interface QRCodeGeneratorProps {
  slug: string;
  venueName: string;
}

export function QRCodeGenerator({ slug, venueName }: QRCodeGeneratorProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const checkinUrl = `${window.location.origin}/checkin/${slug}`;

  const downloadQR = useCallback(() => {
    const svgElement = svgRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size + 120;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // QR code
      const padding = 64;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      // Venue name text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(venueName, size / 2, size + 40);

      // "Scan to check in" text
      ctx.font = '24px system-ui';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan to check in', size / 2, size + 80);

      const link = document.createElement('a');
      link.download = `${slug}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [slug, venueName]);

  return (
    <Card className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-white">QR Code</h3>
        <p className="text-sm text-gray-400 mt-1">
          Print this and display it at your venue
        </p>
      </div>

      <div ref={svgRef} className="inline-block bg-white p-6 rounded-2xl mx-auto">
        <QRCodeSVG
          value={checkinUrl}
          size={256}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 break-all">{checkinUrl}</p>
        <Button onClick={downloadQR}>Download PNG</Button>
      </div>
    </Card>
  );
}
