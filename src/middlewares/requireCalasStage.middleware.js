import { sendError } from '../utils/apiResponse.js';

export const requireCalasStage = (...allowedStages) => {
  return (req, res, next) => {
    if (!req.calas) {
      return sendError(res, 'Akses ditolak, Anda belum login sebagai calas', 401);
    }
    const tahapSaatIni = req.calas.statusRekrutmen?.tahapSaatIni;
    const hasil = req.calas.statusRekrutmen?.hasil;
    
    if (hasil !== 'proses') {
      return sendError(
        res,
        `Aksi ini tidak diizinkan karena status hasil rekrutmen Anda adalah "${hasil}". Hanya calas dengan status "proses" yang diizinkan.`,
        403
      );
    }

    if (!allowedStages.includes(tahapSaatIni)) {
      return sendError(
        res, 
        `Aksi ini tidak diizinkan pada tahap rekrutmen saat ini (${tahapSaatIni}). Harus berada di tahap: ${allowedStages.join(', ')}`, 
        403
      );
    }
    next();
  };
};
