const db = require('../db');

class PickupModel {

  // Create pickup request from enquiry
  static async createFromEnquiry(enquiryId, data) {
    const { assigned_to, amount, scheduled_date } = data;
    
    // First get the enquiry details
    const [enquiry] = await db.query(`SELECT * FROM enquiries WHERE id = ?`, [enquiryId]);
    if (!enquiry[0]) {
      throw new Error('Enquiry not found');
    }

    const sql = `
      INSERT INTO pickup_requests 
      (enquiry_id, customer_name, phone, address, product, quantity, assigned_to, amount, scheduled_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `;
    const [result] = await db.query(sql, [
      enquiryId,
      enquiry[0].name,
      enquiry[0].phone,
      enquiry[0].location,
      enquiry[0].product,
      enquiry[0].quantity || 1,
      assigned_to,
      amount,
      scheduled_date
    ]);
    return result.insertId;
  }

  // Get all pickups with filters
  static async findAll(filters = {}) {
    let sql = `SELECT * FROM pickup_requests`;
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push(`(customer_name LIKE ? OR phone LIKE ? OR address LIKE ? OR product LIKE ?)`);
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    if (filters.status) {
      conditions.push(`status = ?`);
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY created_at DESC`;
    
    const [rows] = await db.query(sql, params);
    return rows;
  }

  // Get pickup by ID
  static async findById(id) {
    const [rows] = await db.query(`SELECT * FROM pickup_requests WHERE id = ?`, [id]);
    return rows[0];
  }

  // Update pickup status
  static async updateStatus(id, status) {
    let updateFields = `status = ?, updated_at = NOW()`;
    const params = [status];

    if (status === 'collected') {
      updateFields += `, collected_date = NOW()`;
    } else if (status === 'received') {
      updateFields += `, received_date = NOW()`;
    }

    const sql = `UPDATE pickup_requests SET ${updateFields} WHERE id = ?`;
    params.push(id);
    
    await db.query(sql, params);
  }

  // Assign pickup to staff
  static async assignPickup(id, staffName) {
    await db.query(
      `UPDATE pickup_requests SET assigned_to = ?, status = 'assigned', updated_at = NOW() WHERE id = ?`,
      [staffName, id]
    );
  }

  // Update pickup amount
  static async updateAmount(id, amount) {
    await db.query(
      `UPDATE pickup_requests SET amount = ?, updated_at = NOW() WHERE id = ?`,
      [amount, id]
    );
  }

  // Add received condition details
  static async addReceivedDetails(id, data) {
    const { photo_url, notes, condition } = data;
    await db.query(
      `UPDATE pickup_requests SET received_photo = ?, received_notes = ?, item_condition = ?, updated_at = NOW() WHERE id = ?`,
      [photo_url, notes, condition, id]
    );
  }

  // Delete pickup request
  static async delete(id) {
    await db.query(`DELETE FROM pickup_requests WHERE id = ?`, [id]);
  }

  // Dashboard statistics
  static async dashboardStats() {
    const [total] = await db.query(`SELECT COUNT(*) AS total FROM pickup_requests`);
    const [scheduled] = await db.query(`SELECT COUNT(*) AS count FROM pickup_requests WHERE status='scheduled'`);
    const [assigned] = await db.query(`SELECT COUNT(*) AS count FROM pickup_requests WHERE status='assigned'`);
    const [collected] = await db.query(`SELECT COUNT(*) AS count FROM pickup_requests WHERE status='collected'`);
    const [received] = await db.query(`SELECT COUNT(*) AS count FROM pickup_requests WHERE status='received'`);

    return {
      total: total[0].total,
      scheduled: scheduled[0].count,
      assigned: assigned[0].count,
      collected: collected[0].count,
      received: received[0].count
    };
  }

  // Get pickups by status
  static async findByStatus(status) {
    const [rows] = await db.query(`SELECT * FROM pickup_requests WHERE status = ? ORDER BY created_at DESC`, [status]);
    return rows;
  }

}

module.exports = PickupModel;