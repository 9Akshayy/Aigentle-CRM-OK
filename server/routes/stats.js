const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/stats - High-level pipeline and lead analytics
router.get('/', (req, res) => {
  try {
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;

    const pipelineStats = db.prepare(`
      SELECT 
        SUM(deal_value) as total_pipeline_value,
        SUM(deal_value * (probability / 100.0)) as weighted_pipeline_value,
        AVG(deal_value) as avg_deal_size
      FROM leads
      WHERE stage NOT IN ('Closed Won', 'Closed Lost')
    `).get();

    const wonStats = db.prepare(`
      SELECT 
        COUNT(*) as won_count,
        SUM(deal_value) as won_revenue
      FROM leads
      WHERE stage = 'Closed Won'
    `).get();

    const lostStats = db.prepare(`
      SELECT COUNT(*) as lost_count FROM leads WHERE stage = 'Closed Lost'
    `).get();

    const totalClosed = (wonStats.won_count || 0) + (lostStats.lost_count || 0);
    const winRate = totalClosed > 0 ? Math.round(((wonStats.won_count || 0) / totalClosed) * 100) : 0;

    // Stage breakdown
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const stageCounts = db.prepare(`
      SELECT stage, COUNT(*) as count, SUM(deal_value) as total_value
      FROM leads
      GROUP BY stage
    `).all();

    const stageMap = {};
    stageCounts.forEach(s => {
      stageMap[s.stage] = { count: s.count, value: s.total_value || 0 };
    });

    const stageBreakdown = stages.map(st => ({
      stage: st,
      count: stageMap[st] ? stageMap[st].count : 0,
      value: stageMap[st] ? stageMap[st].value : 0
    }));

    // Service breakdown
    const serviceBreakdown = db.prepare(`
      SELECT service, COUNT(*) as count, SUM(deal_value) as total_value
      FROM leads
      GROUP BY service
      ORDER BY total_value DESC
    `).all();

    // Priority breakdown
    const priorityBreakdown = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM leads
      GROUP BY priority
    `).all();

    // Source breakdown
    const sourceBreakdown = db.prepare(`
      SELECT source, COUNT(*) as count, SUM(deal_value) as total_value
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `).all();

    // Overdue tasks count
    const nowIso = new Date().toISOString();
    const overdueTasks = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE completed = 0 AND due_date < ?
    `).get(nowIso).count;

    // Upcoming tasks for today / this week
    const upcomingTasks = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE completed = 0 AND due_date >= ?
    `).get(nowIso).count;

    res.json({
      success: true,
      data: {
        totalLeads,
        totalPipelineValue: pipelineStats.total_pipeline_value || 0,
        weightedPipelineValue: Math.round(pipelineStats.weighted_pipeline_value || 0),
        avgDealSize: Math.round(pipelineStats.avg_deal_size || 0),
        wonRevenue: wonStats.won_revenue || 0,
        wonCount: wonStats.won_count || 0,
        winRate,
        stageBreakdown,
        serviceBreakdown,
        priorityBreakdown,
        sourceBreakdown,
        overdueTasks,
        upcomingTasks
      }
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
