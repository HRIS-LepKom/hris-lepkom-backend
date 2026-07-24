export const screeningTemplate = ({ namaCalas }) => {
  const subject = "Pendaftaran Berhasil! Tahap Screening Dimulai 🚀";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(35, 55, 108, 0.05); }
    .header { background: linear-gradient(135deg, #23376c 0%, #1a2a54 100%); padding: 40px 30px; text-align: center; }
    .header h2 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #4a5568; line-height: 1.7; }
    .greeting { font-size: 20px; color: #2d3748; font-weight: 600; margin-bottom: 20px; }
    .status-box { background: #e6f4ea; border-left: 4px solid #156935; padding: 15px 20px; border-radius: 4px; margin: 30px 0; display: flex; align-items: center; }
    .status-text { color: #156935; font-weight: 600; font-size: 16px; }
    .footer { text-align: center; padding: 25px 30px; background: #f8fafc; font-size: 14px; color: #a0aec0; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>LEPKOM GUNADARMA</h2>
    </div>
    <div class="content">
      <div class="greeting">Halo ${namaCalas}, salam kenal! 👋</div>
      <p>Terima kasih atas antusiasme kamu untuk mendaftar sebagai Calon Asisten LEPKOM. Kami telah menerima data registrasi awal kamu dengan baik.</p>
      
      <div class="status-box">
        <span class="status-text">📌 Status Kamu Saat Ini: Sedang dalam Tahap Screening</span>
      </div>
      
      <p>Saat ini, tim kami sedang mereview data kamu. Mengingat banyaknya pendaftar, proses ini mungkin akan memakan waktu. Kami harap kamu bisa bersabar ya!</p>
      <p>Pastikan kamu rajin mengecek email ini dan dashboard rekrutmen LEPKOM untuk mengetahui hasil screening kamu nanti.</p>
      
      <p style="margin-top: 40px;">Semoga berhasil,<br><strong style="color: #23376c;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Laboratorium Teknik Informatika (LEPKOM).
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nTerima kasih telah mendaftar. Saat ini kamu berada di tahap Screening. Mohon tunggu informasi selanjutnya.\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
