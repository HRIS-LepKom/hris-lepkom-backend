export const ujianPraktekTemplate = ({ namaCalas }) => {
  const subject = "Persiapkan Dirimu! Jadwal Ujian Praktek Telah Tiba 💻";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .hero { background: #23376c; padding: 50px 30px; text-align: center; color: #ffffff; }
    .hero h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; }
    .hero p { margin-top: 15px; font-size: 16px; opacity: 0.9; }
    .content { padding: 40px 30px; color: #333; line-height: 1.8; font-size: 15px; }
    .ticket { background: #ffffff; border: 2px dashed #156935; border-radius: 8px; padding: 25px; margin: 30px 0; position: relative; }
    .ticket::before { content: 'ADMISSION TICKET'; position: absolute; top: -12px; left: 20px; background: #ffffff; padding: 0 10px; color: #156935; font-weight: 800; font-size: 12px; letter-spacing: 1px; }
    .ticket h3 { margin-top: 0; color: #23376c; font-size: 18px; }
    .ticket p { margin: 5px 0; font-size: 14px; }
    .footer { padding: 30px; text-align: center; color: #666; font-size: 13px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="hero">
      <h1>UJIAN PRAKTEK</h1>
      <p>Satu langkah lebih dekat menjadi Asisten LEPKOM.</p>
    </div>
    <div class="content">
      <p>Halo <strong>${namaCalas}</strong>,</p>
      <p>Dokumen kamu telah kami verifikasi dengan sukses! Kini saatnya kamu membuktikan kemampuan teknismu secara langsung melalui Ujian Praktek.</p>
      
      <div class="ticket">
        <h3>Detail Pelaksanaan Ujian</h3>
        <p>Jadwal dan Ruangan ujian kamu telah ditetapkan. Silakan masuk ke dashboard rekrutmen untuk melihat <strong>Kapan</strong> dan <strong>Di mana</strong> ujian kamu akan dilaksanakan, serta tata tertib yang berlaku.</p>
      </div>

      <p><strong>Tips dari kami:</strong> Istirahat yang cukup, review kembali materi dasar komputer & pemrograman, dan datang tepat waktu. Tenang saja, kerjakan dengan kemampuan terbaikmu!</p>
      
      <p style="margin-top: 40px;">Kami tunggu kehadiranmu di lab,<br><strong style="color: #23376c;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nDokumen diverifikasi! Tahap selanjutnya adalah Ujian Praktek. Cek jadwal dan ruangan di dashboard kamu.\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
