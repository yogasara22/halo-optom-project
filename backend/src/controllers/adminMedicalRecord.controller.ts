import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { MedicalRecord } from '../entities/MedicalRecord';
import { User } from '../entities/User';
import { Between, Like, LessThan, MoreThan } from 'typeorm';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// Fungsi untuk mendapatkan statistik rekam medis
export const getMedicalRecordStats = async (_: Request, res: Response) => {
  try {
    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    
    // Mendapatkan total rekam medis
    const totalRecords = await medicalRecordRepo.count({
      where: { is_deleted: false }
    });
    
    // Mendapatkan rekam medis yang dibuat dalam 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = await medicalRecordRepo.count({
      where: {
        is_deleted: false,
        created_at: MoreThan(thirtyDaysAgo)
      }
    });
    
    // Mendapatkan jumlah pasien aktif (pasien yang memiliki rekam medis)
    const activePatients = await medicalRecordRepo
      .createQueryBuilder('record')
      .select('record.patient_id')
      .where('record.is_deleted = :isDeleted', { isDeleted: false })
      .distinct(true)
      .getCount();
    
    // Mendapatkan jumlah rekam medis per bulan (untuk bulan ini)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRecords = await medicalRecordRepo.count({
      where: {
        is_deleted: false,
        created_at: MoreThan(startOfMonth)
      }
    });
    
    return res.json({
      totalRecords,
      recentRecords,
      activePatients,
      monthlyRecords
    });
  } catch (err) {
    console.error('getMedicalRecordStats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fungsi untuk mendapatkan semua rekam medis dengan pagination dan filter
export const getAllMedicalRecords = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      optometristId,
      patientId,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Buat query filter
    const whereClause: any = {
      is_deleted: false // Hanya tampilkan yang belum dihapus
    };
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereClause.created_at = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    }
    
    // Filter berdasarkan optometris
    if (optometristId) {
      whereClause.optometrist = { id: optometristId as string };
    }
    
    // Filter berdasarkan pasien
    if (patientId) {
      whereClause.patient = { id: patientId as string };
    }
    
    // Filter berdasarkan pencarian (diagnosis atau notes)
    if (search) {
      whereClause.diagnosis = Like(`%${search}%`);
    }

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    
    // Hitung total records untuk pagination
    const total = await medicalRecordRepo.count({ where: whereClause });
    
    // Ambil data dengan pagination
    const records = await medicalRecordRepo.find({
      where: whereClause,
      order: { created_at: 'DESC' },
      skip,
      take: Number(limit),
      relations: ['patient', 'optometrist', 'appointment']
    });

    return res.json({
      data: records,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getAllMedicalRecords error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fungsi untuk mengunduh laporan rekam medis dalam format PDF atau Excel
export const downloadMedicalRecordsReport = async (req: Request, res: Response) => {
  try {
    const {
      format = 'pdf',
      startDate,
      endDate,
      optometristId,
      patientId
    } = req.query;

    // Buat query filter
    const whereClause: any = {
      is_deleted: false // Hanya tampilkan yang belum dihapus
    };
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereClause.created_at = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    }
    
    // Filter berdasarkan optometris
    if (optometristId) {
      whereClause.optometrist = { id: optometristId as string };
    }
    
    // Filter berdasarkan pasien
    if (patientId) {
      whereClause.patient = { id: patientId as string };
    }

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    
    // Ambil semua data yang sesuai filter
    const records = await medicalRecordRepo.find({
      where: whereClause,
      order: { created_at: 'DESC' },
      relations: ['patient', 'optometrist', 'appointment']
    });

    // Jika tidak ada data
    if (records.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data rekam medis yang sesuai dengan filter' });
    }

    // Generate laporan sesuai format yang diminta
    if (format === 'excel') {
      return generateExcelReport(records, res);
    } else {
      return generatePDFReport(records, res);
    }
  } catch (err) {
    console.error('downloadMedicalRecordsReport error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fungsi untuk mengunduh laporan rekam medis per pasien
export const downloadPatientMedicalRecordsReport = async (req: Request, res: Response) => {
  try {
    const { patient_id } = req.params;
    const { format = 'pdf', startDate, endDate } = req.query;

    // Validasi patient_id
    const userRepo = AppDataSource.getRepository(User);
    const patient = await userRepo.findOne({ where: { id: patient_id } });

    if (!patient) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan' });
    }

    // Buat query filter
    const whereClause: any = {
      patient: { id: patient_id },
      is_deleted: false // Hanya tampilkan yang belum dihapus
    };
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereClause.created_at = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    }

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    
    // Ambil semua data yang sesuai filter
    const records = await medicalRecordRepo.find({
      where: whereClause,
      order: { created_at: 'DESC' },
      relations: ['patient', 'optometrist', 'appointment']
    });

    // Jika tidak ada data
    if (records.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data rekam medis untuk pasien ini' });
    }

    // Generate laporan sesuai format yang diminta
    if (format === 'excel') {
      return generateExcelReport(records, res, patient.name);
    } else {
      return generatePDFReport(records, res, patient.name);
    }
  } catch (err) {
    console.error('downloadPatientMedicalRecordsReport error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fungsi untuk mengedit rekam medis (opsional)
export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes, attachments } = req.body;

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    const record = await medicalRecordRepo.findOne({
      where: { id },
      relations: ['patient', 'optometrist', 'appointment']
    });

    if (!record) {
      return res.status(404).json({ message: 'Catatan medis tidak ditemukan' });
    }

    // Update fields
    if (diagnosis !== undefined) record.diagnosis = diagnosis;
    if (prescription !== undefined) record.prescription = prescription;
    if (notes !== undefined) record.notes = notes;
    if (attachments !== undefined) record.attachments = attachments;

    await medicalRecordRepo.save(record);

    return res.json({
      message: 'Catatan medis berhasil diperbarui',
      data: record
    });
  } catch (err) {
    console.error('updateMedicalRecord error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fungsi untuk menghapus rekam medis (soft delete)
export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    const record = await medicalRecordRepo.findOne({ where: { id } });

    if (!record) {
      return res.status(404).json({ message: 'Catatan medis tidak ditemukan' });
    }

    // Soft delete implementation
    record.is_deleted = true;
    record.deleted_at = new Date();
    await medicalRecordRepo.save(record);

    return res.json({
      message: 'Catatan medis berhasil dihapus',
      deleted_id: id
    });
  } catch (err) {
    console.error('deleteMedicalRecord error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function untuk generate Excel report
const generateExcelReport = async (records: MedicalRecord[], res: Response, patientName?: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Medical Records');

  // Set header
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Pasien', key: 'patient', width: 20 },
    { header: 'Optometris', key: 'optometrist', width: 20 },
    { header: 'Diagnosis', key: 'diagnosis', width: 30 },
    { header: 'Resep', key: 'prescription', width: 30 },
    { header: 'Catatan', key: 'notes', width: 30 }
  ];

  // Add data
  records.forEach(record => {
    worksheet.addRow({
      id: record.id,
      date: record.created_at.toLocaleDateString('id-ID'),
      patient: record.patient.name,
      optometrist: record.optometrist.name,
      diagnosis: record.diagnosis || '-',
      prescription: record.prescription || '-',
      notes: record.notes || '-'
    });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };

  // Set filename
  const filename = patientName
    ? `medical_records_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    : `medical_records_report_${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
};

// Helper function untuk generate PDF report
const generatePDFReport = async (records: MedicalRecord[], res: Response, patientName?: string) => {
  // Create a document
  const doc = new PDFDocument();
  
  // Set filename
  const filename = patientName
    ? `medical_records_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    : `medical_records_report_${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Pipe the PDF to the response
  doc.pipe(res);

  // Add title
  doc.fontSize(16).text('Laporan Rekam Medis', { align: 'center' });
  if (patientName) {
    doc.fontSize(14).text(`Pasien: ${patientName}`, { align: 'center' });
  }
  doc.moveDown();

  // Add date
  doc.fontSize(10).text(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}`, { align: 'right' });
  doc.moveDown();

  // Add records
  records.forEach((record, index) => {
    // Add separator if not the first record
    if (index > 0) {
      doc.moveDown();
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    }

    doc.fontSize(12).text(`Rekam Medis #${index + 1}`, { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).text(`ID: ${record.id}`);
    doc.fontSize(10).text(`Tanggal: ${record.created_at.toLocaleDateString('id-ID')}`);
    doc.fontSize(10).text(`Pasien: ${record.patient.name}`);
    doc.fontSize(10).text(`Optometris: ${record.optometrist.name}`);
    doc.moveDown(0.5);
    
    doc.fontSize(10).text('Diagnosis:', { continued: true }).text(record.diagnosis || '-');
    doc.fontSize(10).text('Resep:', { continued: true }).text(record.prescription || '-');
    doc.fontSize(10).text('Catatan:', { continued: true }).text(record.notes || '-');
  });

  // Finalize PDF
  doc.end();
};