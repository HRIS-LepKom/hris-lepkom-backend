import * as service from './penugasan.service.js';

export const getAllRoomPlacements = async (req, res, next) => {
  try {
    const result = await service.getAllRoomPlacements(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailablePj = async (req, res, next) => {
  try {
    const { tanggal, jenisUjian, search } = req.query;
    const data = await service.getAvailablePj(tanggal, jenisUjian, search);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailablePenilai = async (req, res, next) => {
  try {
    const { tanggal, jenisUjian, search } = req.query;
    const data = await service.getAvailablePenilai(tanggal, jenisUjian, search);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const createAsistenPlacement = async (req, res, next) => {
  try {
    const data = await service.createAsistenPlacement(req.body, req.asisten._id);
    res.status(201).json({
      success: true,
      message: 'Penempatan asisten berhasil dibuat',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateAsistenPlacement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.updateAsistenPlacement(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Penempatan asisten berhasil diperbarui',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlacement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.deletePlacement(id);
    res.status(200).json({
      success: true,
      message: 'Penempatan ruangan berhasil dihapus',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCalas = async (req, res, next) => {
  try {
    const { tanggal, jenisUjian, search } = req.query;
    const data = await service.getAvailableCalas(tanggal, jenisUjian, search);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const updateCalasPlacement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.updateCalasPlacement(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Penempatan calas berhasil diperbarui',
      data
    });
  } catch (error) {
    next(error);
  }
};
