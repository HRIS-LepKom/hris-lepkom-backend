export const ujianProjectTemplate = ({ namaCalas }) => {
  const subject = "Wow, Kamu Lolos Ujian Praktek! Bersiap untuk Ujian Project 🏆";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border-left: 8px solid #23376c; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05); }
    .content { padding: 40px; color: #4a5568; line-height: 1.7; font-size: 15px; }
    .title-area { margin-bottom: 30px; }
    h1 { color: #23376c; font-size: 24px; margin-bottom: 5px; }
    .subtitle { color: #156935; font-weight: 600; font-size: 16px; }
    .checklist { background: #f7fafc; padding: 25px; border-radius: 8px; margin: 25px 0; }
    .checklist h4 { margin-top: 0; color: #2d3748; font-size: 16px; }
    ul { padding-left: 20px; margin: 0; }
    li { margin-bottom: 12px; color: #4a5568; }
    .footer { padding: 25px 40px; background: #23376c; color: #ffffff; font-size: 13px; text-align: center; border-radius: 0 0 12px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <div class="title-area">
        <h1>Luar Biasa, ${namaCalas}!</h1>
        <div class="subtitle">Kamu berhasil menaklukkan Ujian Praktek.</div>
      </div>
      
      <p>Kemampuan teknis dasar kamu sudah teruji. Namun, perjalanan belum usai. Tahap selanjutnya akan menguji kreativitas, logika, dan kemampuan <i>problem solving</i> kamu secara menyeluruh dalam <strong>Ujian Project</strong>.</p>
      
      <div class="checklist">
        <h4>Apa yang harus dilakukan selanjutnya?</h4>
        <ul>
          <li>Cek instruksi dan ketentuan project di dashboard rekrutmen.</li>
          <li>Perhatikan batas waktu pengerjaan project (deadline tidak bisa ditoleransi).</li>
          <li>Kerjakan dengan jujur dan tunjukkan kreativitas terbaikmu.</li>
          <li>Persiapkan diri untuk mempresentasikan hasil karyamu nanti.</li>
        </ul>
      </div>

      <p>Ini adalah kesempatan emas untuk menunjukkan potensi penuhmu. Jangan ragu untuk memberikan *effort* lebih!</p>
      
      <p style="margin-top: 40px;">Tetap semangat & jaga kesehatan,<br><strong style="color: #23376c;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nKamu berhasil lolos Ujian Praktek! Tahap selanjutnya adalah Ujian Project. Segera cek instruksi dan batas waktu di dashboard.\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
