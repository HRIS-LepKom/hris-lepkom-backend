export const biodataTemplate = ({ namaCalas }) => {
  const subject = "Selamat! Kamu Lolos Screening - Waktunya Lengkapi Dokumen 📝";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border-top: 6px solid #156935; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .content { padding: 40px; color: #333; line-height: 1.6; }
    h1 { color: #156935; font-size: 22px; margin-top: 0; }
    .alert-box { background-color: #F3F6FB; border: 1px solid #23376c; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
    .alert-box strong { color: #23376c; display: block; font-size: 18px; margin-bottom: 10px; }
    ul { background: #fafafa; padding: 20px 20px 20px 40px; border-radius: 8px; margin: 20px 0; }
    li { margin-bottom: 10px; color: #555; }
    .btn { display: inline-block; background-color: #156935; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px; }
    .footer { padding: 20px 40px; text-align: center; color: #888; font-size: 13px; background: #fdfdfd; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <h1>Kabar Baik Untukmu, ${namaCalas}! 🎉</h1>
      <p>Setelah melalui proses seleksi yang cukup ketat di tahap awal, kami sangat senang memberitahukan bahwa kamu dinyatakan <strong>LOLOS SCREENING</strong>!</p>
      
      <div class="alert-box">
        <strong>Langkah Selanjutnya: Lengkapi Biodata & Dokumen</strong>
        <p style="margin: 0; font-size: 14px; color: #555;">Jangan biarkan kesempatan ini lewat begitu saja. Segera lengkapi berkasmu!</p>
      </div>

      <p>Silakan login ke dashboard rekrutmen dan siapkan beberapa dokumen wajib berikut dalam format PDF:</p>
      <ul>
        <li>Curriculum Vitae (CV) terbaru yang paling menarik</li>
        <li>Kartu Rencana Studi (KRS) aktif</li>
        <li>Rangkuman Nilai (DNS) terakhir</li>
      </ul>

      <div style="text-align: center; margin-top: 30px;">
        <a href="#" class="btn">Login ke Dashboard Sekarang</a>
      </div>

      <p style="margin-top: 40px; font-size: 14px;">Pastikan kamu melengkapi semuanya sebelum batas waktu yang ditentukan di dashboard ya. Kami tunggu kelengkapan berkasmu!</p>
      
      <p style="margin-top: 30px; font-weight: 500; color: #23376c;">Panitia Rekrutmen Asisten LEPKOM</p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nSelamat! Kamu lolos tahap Screening. Segera lengkapi biodata dan dokumen (CV, KRS, Rangkuman Nilai) di dashboard.\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
