const db = require('../db');

class EnquiryModel {

  // Add new enquiry
  static async create(data) {
    const { name, phone, location, message, inquiry_type, product, quantity = 1 } = data;
    const sql = `
      INSERT INTO enquiries
      (name, phone, location, message, inquiry_type, product, quantity, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    const [result] = await db.query(sql, [name, phone, location, message, inquiry_type, product, quantity]);
    return result.insertId;
  }

  // Get all enquiries with search and filters
  static async findAll(filters = {}) {
    let sql = `SELECT * FROM enquiries`;
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push(`(name LIKE ? OR phone LIKE ? OR location LIKE ? OR message LIKE ?)`);
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    if (filters.status) {
      conditions.push(`status = ?`);
      params.push(filters.status);
    }

    if (filters.inquiry_type) {
      conditions.push(`inquiry_type = ?`);
      params.push(filters.inquiry_type);
    }

    if (filters.product) {
      conditions.push(`product = ?`);
      params.push(filters.product);
    }

    if (filters.thisMonth) {
      conditions.push(`MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`);
    }

    if (filters.thisWeek) {
      conditions.push(`WEEK(created_at, 1) = WEEK(NOW(), 1) AND YEAR(created_at) = YEAR(NOW())`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY created_at DESC`;
    
    const [rows] = await db.query(sql, params);
    return rows;
  }

  // Get enquiry by ID
  static async findById(id) {
    const [rows] = await db.query(`SELECT * FROM enquiries WHERE id = ?`, [id]);
    return rows[0];
  }

  // Update enquiry
  static async update(id, data) {
    const { name, phone, location, message, inquiry_type, product, quantity, status } = data;
    const sql = `
      UPDATE enquiries 
      SET name=?, phone=?, location=?, message=?, inquiry_type=?, product=?, quantity=?, status=?, updated_at=NOW() 
      WHERE id=?
    `;
    await db.query(sql, [name, phone, location, message, inquiry_type, product, quantity, status, id]);
  }

  // Delete enquiry
  static async delete(id) {
    await db.query(`DELETE FROM enquiries WHERE id = ?`, [id]);
  }

  // Update status only
  static async updateStatus(id, status) {
    await db.query(`UPDATE enquiries SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
  }

  // Mark as contacted
  static async markContacted(id) {
    await db.query(`UPDATE enquiries SET contacted_at = NOW(), updated_at = NOW() WHERE id = ?`, [id]);
  }

  // Schedule pickup
  static async schedulePickup(id) {
    await db.query(`UPDATE enquiries SET scheduled_pickup_at = NOW(), updated_at = NOW() WHERE id = ?`, [id]);
  }

  // Dashboard statistics
  static async dashboardStats() {
    const [total] = await db.query(`SELECT COUNT(*) AS total FROM enquiries`);
    const [thisMonth] = await db.query(`SELECT COUNT(*) AS count FROM enquiries WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`);
    const [thisWeek] = await db.query(`SELECT COUNT(*) AS count FROM enquiries WHERE WEEK(created_at, 1) = WEEK(NOW(), 1) AND YEAR(created_at) = YEAR(NOW())`);
    const [converted] = await db.query(`SELECT COUNT(*) AS count FROM enquiries WHERE status='converted'`);
    const [pendingFollowup] = await db.query(`SELECT COUNT(*) AS count FROM enquiries WHERE status='pending' OR status='followup'`);

    return {
      total: total[0].total,
      thisMonth: thisMonth[0].count,
      thisWeek: thisWeek[0].count,
      converted: converted[0].count,
      pendingFollowup: pendingFollowup[0].count
    };
  }

  // Get enquiries by status
  static async findByStatus(status) {
    const [rows] = await db.query(`SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC`, [status]);
    return rows;
  }

  // Get this month enquiries
  static async getThisMonth() {
    const [rows] = await db.query(`
      SELECT * FROM enquiries 
      WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) 
      ORDER BY created_at DESC
    `);
    return rows;
  }

  // Get this week enquiries
  static async getThisWeek() {
    const [rows] = await db.query(`
      SELECT * FROM enquiries 
      WHERE WEEK(created_at, 1) = WEEK(NOW(), 1) AND YEAR(created_at) = YEAR(NOW()) 
      ORDER BY created_at DESC
    `);
    return rows;
  }

  // Get converted enquiries
  static async getConverted() {
    const [rows] = await db.query(`SELECT * FROM enquiries WHERE status = 'converted' ORDER BY created_at DESC`);
    return rows;
  }

}

module.exports = EnquiryModel;