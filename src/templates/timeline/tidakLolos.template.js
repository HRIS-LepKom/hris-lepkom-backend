export const tidakLolosTemplate = ({ namaCalas }) => {
  const subject = "Pengumuman Hasil Rekrutmen Asisten LEPKOM";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border-top: 5px solid #718096; }
    .content { padding: 40px 30px; color: #4a5568; line-height: 1.8; font-size: 15px; }
    .greeting { font-size: 20px; color: #2d3748; font-weight: 600; margin-bottom: 25px; }
    .highlight { background: #f7fafc; padding: 20px; border-left: 4px solid #718096; border-radius: 4px; margin: 25px 0; color: #4a5568; }
    .footer { padding: 25px 30px; text-align: center; color: #a0aec0; font-size: 13px; background: #fdfdfd; border-top: 1px solid #edf2f7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <div class="greeting">Halo ${namaCalas},</div>
      
      <p>Pertama-tama, kami ingin mengucapkan terima kasih banyak atas partisipasi, keberanian, dan antusiasme kamu untuk mendaftar menjadi bagian dari Asisten Laboratorium Teknik Informatika (LEPKOM).</p>
      
      <p>Kami sangat menghargai waktu dan usaha maksimal yang telah kamu tunjukkan selama proses seleksi berlangsung. Kami melihat banyak sekali potensi dari para pendaftar tahun ini, termasuk kamu.</p>
      
      <div class="highlight">
        Setelah melalui diskusi dan pertimbangan yang mendalam dari seluruh aspek penilaian, dengan berat hati kami menginformasikan bahwa untuk saat ini kami <strong>belum dapat menerima kamu</strong> untuk bergabung sebagai Asisten LEPKOM.
      </div>
      
      <p>Kami memahami bahwa kabar ini mungkin mengecewakan. Namun, perlu diingat bahwa hasil ini sama sekali tidak mendefinisikan kemampuan atau potensimu secara keseluruhan. Keputusan ini dibuat murni karena terbatasnya kuota serta penyesuaian kriteria spesifik yang kami cari untuk periode ini.</p>
      
      <p>Jangan pernah patah semangat! Kami berharap kamu menjadikan pengalaman ini sebagai batu loncatan untuk terus belajar dan berkembang. Kesempatan besar lainnya pasti akan selalu terbuka untukmu di masa depan.</p>
      
      <p style="margin-top: 40px;">Semoga sukses selalu dalam studi dan karirmu ke depannya,<br><strong style="color: #4a5568;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nTerima kasih atas partisipasimu. Setelah melalui pertimbangan mendalam, dengan berat hati kami sampaikan bahwa kamu belum dapat bergabung sebagai Asisten LEPKOM saat ini.\n\nJangan patah semangat dan semoga sukses selalu!\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
