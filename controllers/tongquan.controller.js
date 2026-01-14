import { DashboardService } from "../services/tongquan.service.js";
import { logger } from "../config/logger.js";

export const DashboardController = {
  // API: /Dashboard/TongQuan
  getOverviewDaTa: async (req, res) => {
    try {
      const result = await DashboardService.getOverviewData();
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getOverview failed", err);
      res.status(500).json({ message: "Lỗi lấy dữ liệu Dashboard: " + err.message });
    }
  },

  // API: GET /api/Dashboard/TongQuan
  getOverview: async (req, res) => {
    try {
      logger.info("Controller: GET /Dashboard/TongQuan");
      
      // Gọi Service để lấy dữ liệu thống kê
      const stats = await DashboardService.getOverview();
      
      // Trả kết quả về cho client (File script.js sẽ nhận cái này)
      res.json(stats);
    } catch (err) {
      logger.error("Controller Error: Dashboard overview failed", err);
      // Trả về lỗi 500 nếu có sự cố DB
      res.status(500).json({ message: "Lỗi lấy dữ liệu tổng quan: " + err.message });
    }
  },


  Vebieudo: async (req, res) => {
    try {
      // Lấy năm từ query param, nếu không có thì lấy năm hiện tại
      const year = req.query.year || new Date().getFullYear(); 
      
      const data = await DashboardService.Vebieudo(year); // Truyền year vào Service
      res.json(data);
    } catch (err) {
      console.error("Lỗi API Vebieudo:", err);
      res.status(500).json({ message: err.message });
    }
  },
  // API: GET /api/Dashboard/Export
  exportToExcel: async (req, res) => {
    try {
      const workbook = await DashboardService.exportDashboardToExcel();

      // Thiết lập Header để trình duyệt hiểu là file tải xuống
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=BaoCaoTongQuan_" + Date.now() + ".xlsx"
      );

      // Ghi file ra response
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      res.status(500).json({ message: "Lỗi xuất báo cáo: " + err.message });
    }
  }
};