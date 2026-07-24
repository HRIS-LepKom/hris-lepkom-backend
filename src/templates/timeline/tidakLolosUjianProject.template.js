export const tidakLolosUjianProjectTemplate = ({ namaCalas }) => {
  const subject = "Pengumuman Hasil Ujian Project Asisten LEPKOM";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border-top: 5px solid #a0aec0; }
    .content { padding: 40px 30px; color: #4a5568; line-height: 1.8; font-size: 15px; }
    .greeting { font-size: 20px; color: #2d3748; font-weight: 600; margin-bottom: 25px; }
    .highlight { background: #f7fafc; padding: 20px; border-left: 4px solid #a0aec0; border-radius: 4px; margin: 25px 0; color: #4a5568; }
    .footer { padding: 25px 30px; text-align: center; color: #a0aec0; font-size: 13px; background: #fdfdfd; border-top: 1px solid #edf2f7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <div class="greeting">Halo ${namaCalas},</div>
      
      <p>Terima kasih sudah mendedikasikan waktumu untuk mengerjakan Ujian Project Rekrutmen Asisten LEPKOM.</p>
      
      <div class="highlight">
        Setelah meninjau karya, logika, dan presentasimu, kami memohon maaf karena harus menyampaikan bahwa kamu <strong>tidak lolos</strong> pada tahap Ujian Project ini.
      </div>
      
      <p>Di tahap ini, penilaian kami tidak hanya sekadar pada hasil coding, namun juga melibatkan kreativitas, pemahaman, dan kemampuan penyampaian materi. Persaingan antar karya sangat kompetitif tahun ini.</p>
      
      <p>Mencapai tahap project adalah sebuah pencapaian yang patut diacungi jempol. Kami harap kamu dapat menjadikan ini sebagai pelajaran berharga untuk *project-project* hebatmu di masa depan.</p>
      
      <p style="margin-top: 40px;">Salam hangat,<br><strong style="color: #4a5568;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  const text = `Halo ${namaCalas},\n\nTerima kasih telah mengikuti Ujian Project. Sayangnya, kamu belum lolos ke tahap selanjutnya. Tetap semangat!\n\nPanitia Rekrutmen Asisten LEPKOM`;
  return { subject, html, text };
};
