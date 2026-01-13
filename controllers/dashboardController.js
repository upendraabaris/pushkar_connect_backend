const { query } = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // Total complaints
    const totalComplaints = await query(
      'SELECT COUNT(*) as count FROM complaints'
    );

    // Resolved complaints
    const resolvedComplaints = await query(
      "SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'"
    );

    // Active development works
    const activeWorks = await query(
      "SELECT COUNT(*) as count FROM development_works WHERE status IN ('planned', 'in_progress')"
    );

    // Upcoming events
    const upcomingEvents = await query(
      `SELECT COUNT(*) as count FROM events 
       WHERE event_date >= CURRENT_DATE AND status = 'upcoming'`
    );

    // Complaints by status
    const complaintsByStatus = await query(
      `SELECT status, COUNT(*) as count 
       FROM complaints 
       GROUP BY status`
    );

    // Monthly complaints trend (last 12 months)
    const monthlyTrend = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
       FROM complaints
       WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month ASC`
    );

    // Recent complaints
    const recentComplaints = await query(
      `SELECT complaint_id, citizen_name, category, status, created_at
       FROM complaints
       ORDER BY created_at DESC
       LIMIT 5`
    );

    // Recent events
    const recentEvents = await query(
      `SELECT event_id, title, event_date, status
       FROM events
       ORDER BY event_date ASC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalComplaints: parseInt(totalComplaints.rows[0].count),
          resolvedComplaints: parseInt(resolvedComplaints.rows[0].count),
          activeWorks: parseInt(activeWorks.rows[0].count),
          upcomingEvents: parseInt(upcomingEvents.rows[0].count),
        },
        complaintsByStatus: complaintsByStatus.rows,
        monthlyTrend: monthlyTrend.rows.map(row => ({
          month: row.month,
          count: parseInt(row.count)
        })),
        recentComplaints: recentComplaints.rows,
        recentEvents: recentEvents.rows,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
