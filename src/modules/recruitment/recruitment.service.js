import RecruitmentSetting from '../../models/recruitmentSetting.model.js';


const getSetting = async () => {
  const setting = await RecruitmentSetting.findOneAndUpdate(
    { key: 'recruitment_setting' },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .populate('diaktifkanOleh',    'idAsisten nama')
    .populate('dinonaktifkanOleh', 'idAsisten nama');
  return setting;
};


export const getStatus = async () => {
  return getSetting();
};

export const activate = async ({ activatedBy, gelombangAktif }) => {
  const setting = await RecruitmentSetting.findOne({ key: 'recruitment_setting' });

  if (setting?.isActive) {
    const err = new Error('Periode rekrutmen sudah dalam kondisi aktif');
    err.statusCode = 409;
    throw err;
  }

  const updated = await RecruitmentSetting.findOneAndUpdate(
    { key: 'recruitment_setting' },
    {
      isActive:         true,
      gelombangAktif:   gelombangAktif ?? null,
      diaktifkanOleh:   activatedBy,
      diaktifkanPada:   new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('diaktifkanOleh', 'idAsisten nama');

  return updated;
};

export const deactivate = async ({ deactivatedBy }) => {
  const setting = await RecruitmentSetting.findOne({ key: 'recruitment_setting' });

  if (!setting?.isActive) {
    const err = new Error('Periode rekrutmen sudah dalam kondisi nonaktif');
    err.statusCode = 409;
    throw err;
  }

  const updated = await RecruitmentSetting.findOneAndUpdate(
    { key: 'recruitment_setting' },
    {
      isActive:            false,
      gelombangAktif:      null,
      dinonaktifkanOleh:   deactivatedBy,
      dinonaktifkanPada:   new Date(),
    },
    { new: true }
  ).populate('dinonaktifkanOleh', 'idAsisten nama');

  return updated;
};
