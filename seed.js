import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Asisten from './src/models/asisten.model.js';
import Calas from './src/models/calas.model.js';
import { ASISTEN_ROLES } from './src/models/asisten.model.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // BYPASS SRV & TXT lookup yang diblokir provider (Indihome/Telkomsel dll)
    const directURI = 'mongodb://lepkom:$3Mentara@ac-m1h7g51-shard-00-00.n0air3o.mongodb.net:27017,ac-m1h7g51-shard-00-01.n0air3o.mongodb.net:27017,ac-m1h7g51-shard-00-02.n0air3o.mongodb.net:27017/lepkom?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=lepkom';
    
    await mongoose.connect(directURI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected!');

    console.log('Clearing old data...');
    await Asisten.deleteMany({});
    await Calas.deleteMany({});
    console.log('Old data cleared.');

    const defaultPassword = 'password123';

    // 1. Buat Asisten untuk setiap Role secara berurutan (Satu persatu)
    console.log('Seeding Asisten secara berurutan...');
    for (let i = 0; i < ASISTEN_ROLES.length; i++) {
      const role = ASISTEN_ROLES[i];
      console.log(`Sedang membuat akun asisten: ${role}...`);
      
      const ast = new Asisten({
        idAsisten: `AST-${i + 100}`,
        npm: `5042${i}123`,
        nama: `User ${role.replace(/_/g, ' ').toUpperCase()}`,
        email: `${role}@staff.gunadarma.ac.id`,
        kelasSaatIni: '4IA01',
        role: role,
        password: defaultPassword,
        wajibGantiPassword: false,
        isActive: true,
      });
      
      await ast.save();
      console.log(`Akun ${role} berhasil dibuat!`);
    }

    console.log('Semua Asisten berhasil dibuat!');

    // 2. Buat Calon Asisten (Calas)
    console.log('Seeding Calas...');
    const calas = new Calas({
      idCalas: 'CLS-001',
      gelombangDaftar: 'Gelombang 1',
      npm: '12345678',
      namaCalas: 'User Calon Asisten 1',
      kelas: '3IA01',
      jenisKelamin: 'Laki-laki',
      noKtp: '3170000000000001',
      noHp: '081234567890',
      emailCalas: 'calas1@student.gunadarma.ac.id',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('2002-01-01'),
      alamatLengkap: 'Jl. Margonda Raya No. 100, Depok',
      asalSekolah: 'SMA 1 Jakarta',
      wilayah: 'Depok',
      jurusan: 'Informatika',
      ipk: 3.8,
      namaIbu: 'Ibu Calas',
      namaAyah: 'Ayah Calas',
      noHpOrtu: '081299998888',
      password: defaultPassword,
      daftarVia: 'mandiri',
      statusRekrutmen: {
        tahapSaatIni: 'registrasi',
        hasil: 'proses',
        alasanTidakLolos: null,
      }
    });

    await calas.save();
    console.log('Calas seeded successfully!');
    console.log('\n--- Kredensial untuk Testing ---');
    console.log(`Password (Semua Akun): ${defaultPassword}`);
    console.log(`Calas: NPM = 12345678, Email = calas1@student.gunadarma.ac.id`);
    ASISTEN_ROLES.forEach((role, i) => {
      console.log(`Asisten (${role}): ID = AST-${i + 100}, Email = ${role}@staff.gunadarma.ac.id`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
