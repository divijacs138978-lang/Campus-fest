import { CampusPass } from '../types';
import QRCode from 'qrcode';

export async function downloadPassAsPNG(pass: CampusPass, format: '9:16' | '1:1') {
  const width = 1080;
  const height = format === '9:16' ? 1920 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background deep plum
  ctx.fillStyle = '#5E1250';
  ctx.fillRect(0, 0, width, height);

  // Gradient vignette
  const radGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
  radGrad.addColorStop(0, 'rgba(138, 31, 110, 0.4)');
  radGrad.addColorStop(1, 'rgba(42, 10, 35, 0.9)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // Kraft Card Bounding Box
  const pad = 80;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const cardX = pad;
  const cardY = pad;

  // Draw Kraft Envelope Backing
  ctx.fillStyle = '#A98258';
  ctx.strokeStyle = '#2A1A14';
  ctx.lineWidth = 8;
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fill();
  ctx.stroke();

  // Draw Cream Letter Paper inside
  const innerPad = 40;
  const letX = cardX + innerPad;
  const letY = cardY + innerPad;
  const letW = cardW - innerPad * 2;
  const letH = cardH - innerPad * 2;

  ctx.fillStyle = '#F3E6CE';
  ctx.strokeStyle = '#2A1A14';
  ctx.lineWidth = 6;
  roundRect(ctx, letX, letY, letW, letH, 32);
  ctx.fill();
  ctx.stroke();

  // Header banner
  ctx.fillStyle = '#8E2A2A';
  ctx.font = 'bold 32px "Special Elite", monospace';
  ctx.fillText('★ FESTORA OFFICIAL EVENT PASS ★', letX + 50, letY + 80);

  // Student Name
  ctx.fillStyle = '#2A1A14';
  ctx.font = 'bold 48px "Chonburi", "Alfa Slab One", serif';
  ctx.fillText(pass.studentName, letX + 50, letY + 160);

  // Student Roll & Dept
  ctx.fillStyle = '#8E2A2A';
  ctx.font = 'bold 30px "Special Elite", monospace';
  ctx.fillText(`ROLL NO: ${pass.studentRollNumber}  •  ${pass.studentDepartment}`, letX + 50, letY + 215);

  // Event Announcement
  ctx.fillStyle = '#5E1250';
  ctx.font = 'bold 24px "Special Elite", monospace';
  ctx.fillText('CONFIRMED EVENT:', letX + 50, letY + 280);

  ctx.fillStyle = '#2A1A14';
  ctx.font = 'bold 50px "Chonburi", "Alfa Slab One", serif';
  ctx.fillText(pass.eventTitle, letX + 50, letY + 350, letW - 100);

  // Date and Venue Box
  ctx.fillStyle = 'rgba(169, 130, 88, 0.25)';
  ctx.strokeStyle = '#2A1A14';
  ctx.lineWidth = 4;
  roundRect(ctx, letX + 50, letY + 410, letW - 100, 160, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8E2A2A';
  ctx.font = 'bold 34px "Special Elite", monospace';
  ctx.fillText(`WHEN: ${pass.eventDate} • ${pass.eventTime}`, letX + 80, letY + 470);

  ctx.fillStyle = '#2A1A14';
  ctx.font = 'bold 30px "Special Elite", monospace';
  ctx.fillText(`VENUE: ${pass.eventVenue}`, letX + 80, letY + 525);

  // QR Code Generation
  try {
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ regId: pass.code, eventId: pass.eventId, email: pass.studentEmail }),
      {
        margin: 1,
        width: 280,
        color: { dark: '#2A1A14', light: '#FFFFFF' },
      }
    );
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => (qrImg.onload = resolve));

    const qrSize = 240;
    const qrX = letX + (letW - qrSize) / 2;
    const qrY = format === '9:16' ? letY + 630 : letY + 580;

    // QR Box
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2A1A14';
    ctx.lineWidth = 6;
    roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
    ctx.fill();
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Code below QR
    ctx.fillStyle = '#8E2A2A';
    ctx.font = 'bold 40px "Special Elite", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pass.code, width / 2, qrY + qrSize + 65);

    ctx.fillStyle = '#2A1A14';
    ctx.font = 'bold 26px "Special Elite", monospace';
    ctx.fillText(`SEAT: ${pass.seatLabel || `NO. #${pass.seatNo}`} • NON-TRANSFERABLE CAMPUS ENTRY`, width / 2, qrY + qrSize + 115);

    ctx.fillStyle = 'rgba(42, 26, 20, 0.6)';
    ctx.font = 'italic 28px "Lora", serif';
    ctx.fillText('Present this stamped pass at the check-in desk scanner.', width / 2, letY + letH - 50);
  } catch (err) {
    console.error('Error rendering QR for pass PNG', err);
  }

  // Trigger download
  const link = document.createElement('a');
  link.download = `CAMPUS_POST_${pass.studentRollNumber}_${pass.code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
