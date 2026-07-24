export const keputusanAkhirTemplate = ({ namaCalas }) => {
  const subject = "Kerja Kerasmu Selesai! Kini Saatnya Menunggu Keputusan Akhir ⏳";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
    .illustration { background: #e6f4ea; padding: 40px; text-align: center; }
    .icon { font-size: 50px; line-height: 1; margin: 0; }
    .content { padding: 40px; color: #4a5568; line-height: 1.7; font-size: 15px; text-align: center; }
    h2 { color: #156935; font-size: 22px; margin-top: 0; margin-bottom: 20px; }
    .quote { font-style: italic; color: #718096; margin: 30px 0; padding: 0 20px; }
    .footer { padding: 20px; background: #fdfdfd; border-top: 1px solid #edf2f7; color: #a0aec0; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="illustration">
      <div class="icon">☕</div>
    </div>
    <div class="content">
      <h2>Take a deep breath, ${namaCalas}.</h2>
      <p>Seluruh tahapan tes telah berhasil kamu lalui. Dari pendaftaran, melengkapi berkas, hingga mengerjakan ujian praktek dan mempresentasikan project akhirmu.</p>
      
      <p>Kami tahu itu tidak mudah. Terima kasih banyak atas waktu, dedikasi, dan kerja keras yang telah kamu curahkan selama proses rekrutmen ini.</p>
      
      <div class="quote">
        "Saat ini panitia dan koordinator sedang melakukan rekapitulasi nilai dan rapat penentuan akhir. Statusmu sekarang adalah <strong>Menunggu Keputusan Akhir</strong>."
      </div>
      
      <p>Silakan istirahat, fokus kembali pada kuliahmu, dan berdoalah untuk hasil yang terbaik. Pengumuman akhir akan segera kami kabari melalui email dan dashboard.</p>

      <p style="margin-top: 40px;">Salam hangat,<br><strong style="color: #23376c;">Tim Penilai & Panitia LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `Halo ${namaCalas},\n\nSeluruh tahapan tes telah selesai. Saat ini kami sedang melakukan evaluasi akhir. Silakan bersabar dan berdoa untuk hasil terbaik. Pengumuman akan segera menyusul.\n\nTim Penilai & Panitia LEPKOM`;
  
  return { subject, html, text };
};
