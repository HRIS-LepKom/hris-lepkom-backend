export const tidakLolosScreeningTemplate = ({ namaCalas }) => {
  const subject = "Pengumuman Hasil Screening Calon Asisten LEPKOM";
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
      
      <p>Terima kasih atas partisipasi kamu dalam mendaftar sebagai Calon Asisten Laboratorium Teknik Informatika (LEPKOM).</p>
      
      <div class="highlight">
        Setelah meninjau profil dan data awalmu pada tahap screening, dengan sangat menyesal kami menginformasikan bahwa kamu <strong>belum dapat melanjutkan</strong> ke tahap berikutnya.
      </div>
      
      <p>Kriteria pada tahap awal sangat ketat dan mempertimbangkan banyak faktor penyesuaian dari sisi laboratorium. Keputusan ini bukanlah penilaian akhir atas potensimu, melainkan penyesuaian dengan kebutuhan kami saat ini.</p>
      
      <p>Terus kembangkan potensimu, karena selalu ada kesempatan lain di masa depan. Semangat terus!</p>
      
      <p style="margin-top: 40px;">Salam hangat,<br><strong style="color: #4a5568;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  const text = `Halo ${namaCalas},\n\nTerima kasih telah mendaftar. Sayangnya, kamu belum lolos pada tahap Screening awal kali ini. Tetap semangat!\n\nPanitia Rekrutmen Asisten LEPKOM`;
  return { subject, html, text };
};
