export const tidakLolosKeputusanAkhirTemplate = ({ namaCalas }) => {
  const subject = "Pengumuman Keputusan Akhir Rekrutmen Asisten LEPKOM";
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
      
      <p>Pertama-tama, kami ingin memberikan apresiasi sebesar-besarnya atas usaha keras, waktu, dan dedikasi yang telah kamu berikan selama berbulan-bulan melalui setiap tahapan rekrutmen ini hingga mencapai tahap evaluasi akhir.</p>
      
      <div class="highlight">
        Berdasarkan hasil rapat penentuan akhir dari seluruh dewan penilai, dengan sangat berat hati kami sampaikan bahwa saat ini kami <strong>belum dapat menerima kamu</strong> untuk bergabung sebagai Asisten LEPKOM.
      </div>
      
      <p>Keputusan akhir ini merupakan hasil komparasi total nilai keseluruhan dari ratusan kandidat dan ketersediaan kuota asisten tahun ini. Menembus hingga tahap rapat akhir membuktikan bahwa kamu memiliki kualitas yang sangat baik dan pantas diperhitungkan.</p>
      
      <p>Jangan biarkan hasil ini menghentikan langkahmu. Teruslah berkarya, belajar, dan berkembang. Kami yakin masa depan yang luar biasa sedang menantimu.</p>
      
      <p style="margin-top: 40px;">Salam hangat,<br><strong style="color: #4a5568;">Panitia Rekrutmen Asisten LEPKOM</strong></p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;
  const text = `Halo ${namaCalas},\n\nTerima kasih atas perjuanganmu hingga tahap akhir. Berdasarkan evaluasi rapat penentuan akhir, dengan sangat menyesal kamu belum diterima sebagai Asisten LEPKOM. Tetap semangat!\n\nPanitia Rekrutmen Asisten LEPKOM`;
  return { subject, html, text };
};
