export const penolakanTemplate = ({ namaCalas, alasanTidakLolos, deskripsiPenolakan }) => {
  const subject = "Pengumuman Hasil Rekrutmen Asisten LEPKOM";
  
  let deskripsi = "";
  
  switch (alasanTidakLolos) {
    case 'tidak_lolos_screening':
      deskripsi = "Berdasarkan evaluasi terhadap berkas administrasi dan data yang kamu berikan, kami menilai bahwa kualifikasi kamu belum sepenuhnya sesuai dengan kriteria spesifik yang kami butuhkan pada tahapan <strong>Screening Awal</strong>.";
      break;
    case 'tidak_hadir_ujian':
      deskripsi = "Sistem kami mencatat bahwa kamu <strong>Tidak Hadir</strong> pada sesi ujian yang telah dijadwalkan tanpa adanya konfirmasi yang sesuai prosedur. Oleh karena itu, kami tidak dapat melanjutkan proses seleksi kamu.";
      break;
    case 'tidak_lolos_penilaian':
      deskripsi = "Berdasarkan hasil rekapitulasi penilaian ujian (Praktek/Project) yang kamu lalui, dengan berat hati kami sampaikan bahwa perolehan nilai kamu <strong>belum mencapai standar kelulusan</strong> yang ditetapkan.";
      break;
    case 'ditolak_rapat_akhir':
      deskripsi = "Setelah melalui diskusi mendalam pada tahapan <strong>Rapat Keputusan Akhir</strong> yang melibatkan penilaian performa, attitude, dan kesesuaian kultur, dengan berat hati kami memutuskan untuk belum dapat menerima kamu bergabung.";
      break;
    case 'lainnya':
      deskripsi = deskripsiPenolakan || "Mohon maaf, saat ini kami belum dapat melanjutkan proses rekrutmen Anda.";
      break;
    default:
      deskripsi = "Dengan berat hati kami menginformasikan bahwa untuk saat ini kami <strong>belum dapat menerima kamu</strong> untuk bergabung sebagai Asisten LEPKOM.";
      break;
  }

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
    .highlight { background: #f7fafc; padding: 20px; border-left: 4px solid #718096; border-radius: 4px; margin: 25px 0; color: #4a5568; line-height: 1.6; }
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
        ${deskripsi}
      </div>
      
      <p>Kami memahami bahwa kabar ini mungkin mengecewakan. Namun, perlu diingat bahwa hasil ini sama sekali tidak mendefinisikan kemampuan atau potensimu secara keseluruhan. Keputusan ini dibuat murni karena penyesuaian kriteria spesifik yang kami cari untuk periode ini.</p>
      
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
  
  const text = `Halo ${namaCalas},\n\nTerima kasih atas partisipasimu. Setelah melalui pertimbangan mendalam, dengan berat hati kami sampaikan bahwa kamu belum dapat bergabung sebagai Asisten LEPKOM saat ini dengan alasan: ${deskripsi.replace(/<[^>]+>/g, '')}\n\nJangan patah semangat dan semoga sukses selalu!\n\nPanitia Rekrutmen Asisten LEPKOM`;
  
  return { subject, html, text };
};
