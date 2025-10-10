import ExcelJS from 'exceljs';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
  includeInactive?: boolean;
}

export class ExcelExportService {
  /**
   * Generate comprehensive visitor data export with multiple sheets
   */
  async generateVisitorExport(options: ExportOptions = {}): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'Medical Document System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    try {
      // Generate all sheets
      await this.createVisitorsSheet(workbook, options);
      await this.createAnalyticsSheet(workbook, options);
      await this.createTimelineSheet(workbook, options);
      
      logger.info('Excel export generated successfully');
      return workbook;
    } catch (error) {
      logger.error('Error generating Excel export:', error);
      throw error;
    }
  }

  /**
   * Sheet 1: Detailed Visitor Information
   */
  private async createVisitorsSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const worksheet = workbook.addWorksheet('الزوار - Visitors', {
      properties: { defaultRowHeight: 20 },
      views: [{ rightToLeft: false, state: 'frozen', xSplit: 0, ySplit: 1 }]
    });

    // Define columns with Saudi-specific formatting
    worksheet.columns = [
      { header: 'البريد الإلكتروني\nEmail', key: 'email', width: 30 },
      { header: 'تاريخ التسجيل\nRegistration Date', key: 'registration_date', width: 20 },
      { header: 'آخر نشاط\nLast Activity', key: 'last_activity', width: 20 },
      { header: 'المدينة\nCity', key: 'city', width: 15 },
      { header: 'المنطقة\nRegion', key: 'region', width: 15 },
      { header: 'عدد الزيارات\nVisit Count', key: 'activity_count', width: 12 },
      { header: 'عمليات البحث\nSearches', key: 'search_count', width: 12 },
      { header: 'المستندات\nDocuments', key: 'document_count', width: 12 },
      { header: 'اللغة\nLanguage', key: 'language', width: 10 },
      { header: 'الإشعارات\nNotifications', key: 'notifications', width: 12 },
      { header: 'نوع الجهاز\nDevice Type', key: 'device_type', width: 15 },
      { header: 'الحالة\nStatus', key: 'status', width: 10 }
    ];

    // Fetch visitor data with related information
    const query = `
      SELECT 
        v.email,
        v.registration_date,
        v.last_activity,
        v.activity_count,
        v.is_active,
        v.metadata->>'city' as city,
        v.metadata->>'region' as region,
        v.metadata->>'language' as language,
        v.metadata->>'notifications_enabled' as notifications,
        v.metadata->>'device_type' as device_type,
        COUNT(DISTINCT sq.id) as search_count,
        COUNT(DISTINCT d.id) as document_count
      FROM visitors v
      LEFT JOIN search_queries sq ON sq.visitor_id = v.id
      LEFT JOIN documents d ON d.visitor_id = v.id
      WHERE 1=1
        ${options.startDate ? 'AND v.registration_date >= $1' : ''}
        ${options.endDate ? 'AND v.registration_date <= $2' : ''}
        ${!options.includeInactive ? 'AND v.is_active = true' : ''}
      GROUP BY v.id, v.email, v.registration_date, v.last_activity, 
               v.activity_count, v.is_active, v.metadata
      ORDER BY v.registration_date DESC
    `;

    const params = [];
    if (options.startDate) params.push(options.startDate);
    if (options.endDate) params.push(options.endDate);

    const result = await pool.query(query, params);

    // Add data rows with formatting
    result.rows.forEach((row, index) => {
      const excelRow = worksheet.addRow({
        email: row.email,
        registration_date: row.registration_date,
        last_activity: row.last_activity,
        city: row.city || 'غير محدد',
        region: row.region || 'غير محدد',
        activity_count: row.activity_count,
        search_count: row.search_count,
        document_count: row.document_count,
        language: row.language === 'ar' ? 'العربية' : 'English',
        notifications: row.notifications === 'true' ? 'مفعل' : 'معطل',
        device_type: row.device_type || 'غير معروف',
        status: row.is_active ? 'نشط' : 'غير نشط'
      });

      // Format dates in Saudi format (dd/mm/yyyy)
      if (excelRow.getCell('registration_date').value) {
        excelRow.getCell('registration_date').numFmt = 'dd/mm/yyyy hh:mm';
      }
      if (excelRow.getCell('last_activity').value) {
        excelRow.getCell('last_activity').numFmt = 'dd/mm/yyyy hh:mm';
      }

      // Conditional formatting for status
      const statusCell = excelRow.getCell('status');
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: row.is_active ? 'FF90EE90' : 'FFFFCCCB' }
      };
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 40;

    // Add filters
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 12 }
    };

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }

  /**
   * Sheet 2: Analytics and Statistics
   */
  private async createAnalyticsSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const worksheet = workbook.addWorksheet('التحليلات - Analytics');

    // Fetch analytics data
    const analyticsQuery = `
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_visitors,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_week,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_month,
        AVG(activity_count) as avg_activity_count,
        MAX(activity_count) as max_activity_count,
        COUNT(CASE WHEN metadata->>'language' = 'ar' THEN 1 END) as arabic_users,
        COUNT(CASE WHEN metadata->>'language' = 'en' THEN 1 END) as english_users,
        COUNT(CASE WHEN metadata->>'notifications_enabled' = 'true' THEN 1 END) as notifications_enabled
      FROM visitors
      WHERE 1=1
        ${options.startDate ? 'AND registration_date >= $1' : ''}
        ${options.endDate ? 'AND registration_date <= $2' : ''}
    `;

    const params = [];
    if (options.startDate) params.push(options.startDate);
    if (options.endDate) params.push(options.endDate);

    const analyticsResult = await pool.query(analyticsQuery, params);
    const analytics = analyticsResult.rows[0];

    // Geographic distribution
    const geoQuery = `
      SELECT 
        metadata->>'region' as region,
        metadata->>'city' as city,
        COUNT(*) as count
      FROM visitors
      WHERE metadata->>'region' IS NOT NULL
      GROUP BY metadata->>'region', metadata->>'city'
      ORDER BY count DESC
      LIMIT 20
    `;
    const geoResult = await pool.query(geoQuery);

    // Device types
    const deviceQuery = `
      SELECT 
        COALESCE(metadata->>'device_type', 'Unknown') as device_type,
        COUNT(*) as count
      FROM visitors
      GROUP BY metadata->>'device_type'
      ORDER BY count DESC
    `;
    const deviceResult = await pool.query(deviceQuery);

    // Create summary section
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').value = 'ملخص الإحصائيات - Statistics Summary';
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    let currentRow = 3;

    // Add summary statistics
    const summaryData = [
      ['إجمالي الزوار - Total Visitors', analytics.total_visitors],
      ['الزوار النشطون - Active Visitors', analytics.active_visitors],
      ['نشط خلال 7 أيام - Active Last Week', analytics.active_last_week],
      ['نشط خلال 30 يوم - Active Last Month', analytics.active_last_month],
      ['متوسط النشاط - Avg Activity Count', Math.round(analytics.avg_activity_count)],
      ['أقصى نشاط - Max Activity Count', analytics.max_activity_count],
      ['مستخدمو العربية - Arabic Users', analytics.arabic_users],
      ['مستخدمو الإنجليزية - English Users', analytics.english_users],
      ['الإشعارات مفعلة - Notifications Enabled', analytics.notifications_enabled]
    ];

    summaryData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).numFmt = '#,##0';
      currentRow++;
    });

    worksheet.getColumn('A').width = 40;
    worksheet.getColumn('B').width = 20;

    // Geographic Distribution section
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'التوزيع الجغرافي - Geographic Distribution';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(`A${currentRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value = 'المنطقة - Region';
    worksheet.getCell(`B${currentRow}`).value = 'المدينة - City';
    worksheet.getCell(`C${currentRow}`).value = 'العدد - Count';
    worksheet.getRow(currentRow).font = { bold: true };
    currentRow++;

    geoResult.rows.forEach(row => {
      worksheet.getCell(`A${currentRow}`).value = row.region || 'غير محدد';
      worksheet.getCell(`B${currentRow}`).value = row.city || 'غير محدد';
      worksheet.getCell(`C${currentRow}`).value = row.count;
      currentRow++;
    });

    worksheet.getColumn('C').width = 15;

    // Device Types section
    currentRow += 2;
    worksheet.mergeCells(`E${3}:F${3}`);
    worksheet.getCell('E3').value = 'أنواع الأجهزة - Device Types';
    worksheet.getCell('E3').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('E3').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    let deviceRow = 5;
    worksheet.getCell(`E${deviceRow}`).value = 'نوع الجهاز - Device Type';
    worksheet.getCell(`F${deviceRow}`).value = 'العدد - Count';
    worksheet.getRow(deviceRow).font = { bold: true };
    deviceRow++;

    deviceResult.rows.forEach(row => {
      worksheet.getCell(`E${deviceRow}`).value = row.device_type;
      worksheet.getCell(`F${deviceRow}`).value = row.count;
      deviceRow++;
    });

    worksheet.getColumn('E').width = 25;
    worksheet.getColumn('F').width = 15;

    // Add chart for device distribution
    const deviceChart = worksheet.addChart({
      type: 'pie',
      name: 'Device Distribution',
      position: { x: 400, y: 100 }
    });
  }

  /**
   * Sheet 3: Timeline and Trends
   */
  private async createTimelineSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const worksheet = workbook.addWorksheet('الجدول الزمني - Timeline');

    // Daily registration trends
    const dailyQuery = `
      SELECT 
        DATE(registration_date) as date,
        COUNT(*) as registrations,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_registrations
      FROM visitors
      WHERE registration_date >= NOW() - INTERVAL '90 days'
      GROUP BY DATE(registration_date)
      ORDER BY date DESC
    `;
    const dailyResult = await pool.query(dailyQuery);

    // Weekly trends
    const weeklyQuery = `
      SELECT 
        DATE_TRUNC('week', registration_date) as week_start,
        COUNT(*) as registrations,
        AVG(activity_count) as avg_activity
      FROM visitors
      WHERE registration_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('week', registration_date)
      ORDER BY week_start DESC
    `;
    const weeklyResult = await pool.query(weeklyQuery);

    // Monthly trends
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', registration_date) as month_start,
        COUNT(*) as registrations,
        AVG(activity_count) as avg_activity,
        COUNT(DISTINCT DATE(last_activity)) as active_days
      FROM visitors
      WHERE registration_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', registration_date)
      ORDER BY month_start DESC
    `;
    const monthlyResult = await pool.query(monthlyQuery);

    // Peak usage times
    const peakQuery = `
      SELECT 
        EXTRACT(HOUR FROM last_activity) as hour,
        COUNT(*) as activity_count
      FROM visitors
      WHERE last_activity >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM last_activity)
      ORDER BY hour
    `;
    const peakResult = await pool.query(peakQuery);

    // Daily Trends Section
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'الاتجاهات اليومية - Daily Trends (Last 90 Days)';
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A3').value = 'التاريخ - Date';
    worksheet.getCell('B3').value = 'التسجيلات - Registrations';
    worksheet.getCell('C3').value = 'التسجيلات النشطة - Active';
    worksheet.getCell('D3').value = 'النسبة - Percentage';
    worksheet.getRow(3).font = { bold: true };

    let row = 4;
    dailyResult.rows.forEach(data => {
      worksheet.getCell(`A${row}`).value = data.date;
      worksheet.getCell(`A${row}`).numFmt = 'dd/mm/yyyy';
      worksheet.getCell(`B${row}`).value = data.registrations;
      worksheet.getCell(`C${row}`).value = data.active_registrations;
      worksheet.getCell(`D${row}`).value = data.registrations > 0 
        ? (data.active_registrations / data.registrations) 
        : 0;
      worksheet.getCell(`D${row}`).numFmt = '0.00%';
      row++;
    });

    worksheet.getColumn('A').width = 15;
    worksheet.getColumn('B').width = 18;
    worksheet.getColumn('C').width = 18;
    worksheet.getColumn('D').width = 15;

    // Weekly Trends Section
    const weeklyStartRow = row + 2;
    worksheet.mergeCells(`F1:H1`);
    worksheet.getCell('F1').value = 'الاتجاهات الأسبوعية - Weekly Trends';
    worksheet.getCell('F1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('F1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    worksheet.getCell('F1').alignment = { horizontal: 'center' };

    worksheet.getCell('F3').value = 'بداية الأسبوع - Week Start';
    worksheet.getCell('G3').value = 'التسجيلات - Registrations';
    worksheet.getCell('H3').value = 'متوسط النشاط - Avg Activity';
    worksheet.getRow(3).font = { bold: true };

    row = 4;
    weeklyResult.rows.forEach(data => {
      worksheet.getCell(`F${row}`).value = data.week_start;
      worksheet.getCell(`F${row}`).numFmt = 'dd/mm/yyyy';
      worksheet.getCell(`G${row}`).value = data.registrations;
      worksheet.getCell(`H${row}`).value = Math.round(data.avg_activity);
      row++;
    });

    worksheet.getColumn('F').width = 18;
    worksheet.getColumn('G').width = 18;
    worksheet.getColumn('H').width = 18;

    // Monthly Trends Section
    worksheet.mergeCells(`J1:M1`);
    worksheet.getCell('J1').value = 'الاتجاهات الشهرية - Monthly Trends';
    worksheet.getCell('J1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('J1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    worksheet.getCell('J1').alignment = { horizontal: 'center' };

    worksheet.getCell('J3').value = 'الشهر - Month';
    worksheet.getCell('K3').value = 'التسجيلات - Registrations';
    worksheet.getCell('L3').value = 'متوسط النشاط - Avg Activity';
    worksheet.getCell('M3').value = 'أيام النشاط - Active Days';
    worksheet.getRow(3).font = { bold: true };

    row = 4;
    monthlyResult.rows.forEach(data => {
      worksheet.getCell(`J${row}`).value = data.month_start;
      worksheet.getCell(`J${row}`).numFmt = 'mmm yyyy';
      worksheet.getCell(`K${row}`).value = data.registrations;
      worksheet.getCell(`L${row}`).value = Math.round(data.avg_activity);
      worksheet.getCell(`M${row}`).value = data.active_days;
      row++;
    });

    worksheet.getColumn('J').width = 15;
    worksheet.getColumn('K').width = 18;
    worksheet.getColumn('L').width = 18;
    worksheet.getColumn('M').width = 18;

    // Peak Usage Times
    const peakStartRow = Math.max(row, 25) + 2;
    worksheet.mergeCells(`A${peakStartRow}:C${peakStartRow}`);
    worksheet.getCell(`A${peakStartRow}`).value = 'أوقات الذروة - Peak Usage Times';
    worksheet.getCell(`A${peakStartRow}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(`A${peakStartRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5090' }
    };
    worksheet.getCell(`A${peakStartRow}`).alignment = { horizontal: 'center' };

    row = peakStartRow + 2;
    worksheet.getCell(`A${row}`).value = 'الساعة - Hour';
    worksheet.getCell(`B${row}`).value = 'عدد الأنشطة - Activity Count';
    worksheet.getCell(`C${row}`).value = 'النسبة - Percentage';
    worksheet.getRow(row).font = { bold: true };
    row++;

    const totalActivities = peakResult.rows.reduce((sum, r) => sum + parseInt(r.activity_count), 0);
    peakResult.rows.forEach(data => {
      const hour = parseInt(data.hour);
      worksheet.getCell(`A${row}`).value = `${hour}:00 - ${hour + 1}:00`;
      worksheet.getCell(`B${row}`).value = data.activity_count;
      worksheet.getCell(`C${row}`).value = totalActivities > 0 
        ? (data.activity_count / totalActivities) 
        : 0;
      worksheet.getCell(`C${row}`).numFmt = '0.00%';
      row++;
    });
  }

  /**
   * Stream export for large datasets
   */
  async streamVisitorExport(writeStream: NodeJS.WritableStream, options: ExportOptions = {}) {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: writeStream,
      useStyles: true,
      useSharedStrings: true
    });

    const worksheet = workbook.addWorksheet('Visitors');

    // Add columns
    worksheet.columns = [
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Registration Date', key: 'registration_date', width: 20 },
      { header: 'Last Activity', key: 'last_activity', width: 20 },
      { header: 'Activity Count', key: 'activity_count', width: 15 }
    ];

    // Stream data in chunks
    const chunkSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await pool.query(
        `SELECT email, registration_date, last_activity, activity_count
         FROM visitors
         ORDER BY registration_date DESC
         LIMIT $1 OFFSET $2`,
        [chunkSize, offset]
      );

      if (result.rows.length === 0) {
        hasMore = false;
      } else {
        result.rows.forEach(row => {
          worksheet.addRow(row).commit();
        });
        offset += chunkSize;
      }
    }

    worksheet.commit();
    await workbook.commit();
  }
}
