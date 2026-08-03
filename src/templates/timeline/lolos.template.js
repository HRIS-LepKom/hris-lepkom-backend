export const lolosTemplate = ({ namaCalas, clientUrl }) => {
  const subject = "SELAMAT! Kamu Resmi Menjadi Asisten LEPKOM 🎉🎉🎉";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(21, 105, 53, 0.15); border: 2px solid #156935; }
    .confetti { background: linear-gradient(135deg, #156935 0%, #1a8f46 100%); padding: 60px 30px; text-align: center; color: #ffffff; }
    .confetti h1 { font-family: 'Inter', sans-serif; font-weight: 900; font-size: 36px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .confetti p { font-size: 18px; opacity: 0.9; margin-top: 10px; }
    .content { padding: 40px 30px; color: #333; line-height: 1.8; font-size: 16px; text-align: center; }
    .welcome { font-size: 22px; color: #23376c; font-weight: 700; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #23376c; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; margin-top: 25px; transition: background 0.3s; }
    .footer { padding: 25px; background: #fdfdfd; color: #888; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="confetti">
      <h1>CONGRATULATIONS!</h1>
      <p>Your hard work paid off.</p>
    </div>
    <div class="content">
      <div class="welcome">Selamat Datang di Keluarga Besar LEPKOM, ${namaCalas}!</div>
      
      <p>Berdasarkan hasil evaluasi komprehensif dari seluruh tahapan rekrutmen yang panjang dan ketat, kami dengan sangat bangga mengumumkan bahwa kamu <strong>DINYATAKAN LOLOS</strong>.</p>
      
      <p>Kamu telah membuktikan bahwa kamu memiliki dedikasi, skill, dan etos kerja yang kami cari. Kami tidak sabar untuk melihat kontribusi luar biasamu bersama kami di laboratorium.</p>

      <div style="background: #e6f4ea; padding: 20px; border-radius: 12px; margin: 30px 0;">
        <p style="margin: 0; color: #156935; font-weight: 700;">Langkah Selanjutnya:</p>
        <p style="margin: 5px 0 0 0; color: #333; font-size: 14px;">Silakan login ke dashboard kamu untuk melihat detail terkait jadwal briefing perdana, kelengkapan administrasi akhir, dan proses onboarding asisten baru.</p>
      </div>

      <a href="${clientUrl}" class="btn">Menuju Dashboard</a>
      
      <p style="margin-top: 40px; font-weight: 700; color: #23376c; font-size: 18px;">Sekali lagi, Selamat!</p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `SELAMAT ${namaCalas}!\n\nKamu dinyatakan LOLOS dan diterima sebagai Asisten Laboratorium Teknik Informatika (LEPKOM). Selamat bergabung di keluarga besar kami!\n\nSilakan login ke dashboard melalui tautan berikut untuk info briefing perdana: ${clientUrl}\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
