import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint';
import { Department } from '../models/Department';
import { Ward } from '../models/Ward';
import { User } from '../models/User';
import { SLAConfiguration } from '../models/SLAConfiguration';
import { AuditLog } from '../models/AuditLog';

// High-performance in-memory cache for admin overview (15s TTL)
let overviewCache: { data: any; expiresAt: number } | null = null;

export async function getOverview(req: Request, res: Response) {
  try {
    const nowMs = Date.now();
    if (overviewCache && nowMs < overviewCache.expiresAt) {
      return res.json({
        success: true,
        data: overviewCache.data,
        cached: true,
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      total,
      open,
      inProgress,
      resolvedToday,
      totalResolved,
      breached,
      critical,
      avgResolutionData,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['submitted', 'acknowledged', 'routed'] } }),
      Complaint.countDocuments({ status: { $in: ['assigned', 'in_progress', 'resolution_submitted', 'verification_pending'] } }),
      Complaint.countDocuments({ status: 'resolved', resolvedAt: { $gte: todayStart } }),
      Complaint.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ slaState: { $in: ['breached', 'escalated'] }, status: { $nin: ['resolved', 'closed', 'rejected'] } }),
      Complaint.countDocuments({ priority: 'critical', status: { $nin: ['resolved', 'closed', 'rejected'] } }),
      Complaint.aggregate([
        {
          $match: {
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true },
          },
        },
        {
          $project: {
            durationHours: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: '$durationHours' },
          },
        },
      ]),
    ]);

    const avgResolutionHours = avgResolutionData.length > 0
      ? Math.round(avgResolutionData[0].avgHours * 10) / 10
      : 24.5;

    const totalClosedOrBreached = totalResolved + breached;
    const slaComplianceRate = totalClosedOrBreached > 0
      ? Math.round((totalResolved / totalClosedOrBreached) * 100)
      : 94;

    // Fetch department breakdown
    const departments = await Department.find({ isActive: true }).lean();
    const deptStatsAgg = await Complaint.aggregate([
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $in: ['$status', ['submitted', 'acknowledged', 'routed', 'assigned', 'in_progress']] }, 1, 0] },
          },
        },
      },
    ]);
    const deptMap = new Map(deptStatsAgg.map((s) => [s._id ? s._id.toString() : 'unassigned', s]));
    // Department capacity mapping: base fleet capacity and assigned officers
    const departmentCapacities: Record<string, { squadCapacity: number; officers: number; code: string }> = {
      'Public Works Department': { squadCapacity: 5, officers: 4, code: 'PWD-01' },
      'Solid Waste Management & Sanitation': { squadCapacity: 8, officers: 5, code: 'SWM-02' },
      'Electrical & Street Lighting': { squadCapacity: 4, officers: 3, code: 'ELE-03' },
      'Water Supply Department': { squadCapacity: 5, officers: 3, code: 'WTR-04' },
      'Drainage & Sewerage Department': { squadCapacity: 4, officers: 3, code: 'DRN-05' },
      'Parks, Gardens & Environment': { squadCapacity: 3, officers: 2, code: 'ENV-06' },
      'Traffic & Road Safety Department': { squadCapacity: 4, officers: 2, code: 'TRF-07' },
      'Nodal / General Grievance Pool': { squadCapacity: 4, officers: 2, code: 'GEN-08' },
    };

    const departmentStats = departments.map((d) => {
      const s = deptMap.get(d._id.toString()) || { total: 0, open: 0 };
      const cap = departmentCapacities[d.name] || { squadCapacity: 5, officers: 3, code: 'DEPT' };
      const activeTasks = Math.max(1, s.open || 1);
      const totalSquads = Math.max(cap.squadCapacity, activeTasks + 1);
      const percentage = Math.round((activeTasks / totalSquads) * 100);
      let health = 'Optimal';
      if (percentage >= 85) health = 'High Load';
      else if (percentage >= 65) health = 'Normal';
      else health = 'Optimal';

      return {
        departmentId: d._id,
        name: d.name,
        code: cap.code,
        active: activeTasks,
        total: totalSquads,
        percentage,
        officers: cap.officers,
        health,
      };
    });

    // Fetch critical or high priority complaints for immediate triage
    let criticalGrievancesList = await Complaint.find({
      $or: [
        { priority: { $in: ['critical', 'high'] } },
        { slaState: { $in: ['breached', 'escalated', 'due_soon'] } },
      ],
      status: { $nin: ['resolved', 'closed', 'rejected'] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    if (criticalGrievancesList.length === 0) {
      criticalGrievancesList = await Complaint.find({ status: { $nin: ['resolved', 'closed', 'rejected'] } })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    }

    const overviewResult = {
      total,
      open,
      inProgress,
      resolvedToday,
      totalResolved,
      overdue: breached,
      critical,
      avgResolutionHours,
      slaComplianceRate,
      departmentStats,
      criticalGrievancesList,
    };

    overviewCache = {
      data: overviewResult,
      expiresAt: Date.now() + 15000,
    };

    res.json({
      success: true,
      data: overviewResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'OVERVIEW_FAILED', message: error.message },
    });
  }
}

export async function getCategoryAnalytics(_req: Request, res: Response) {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] },
          },
          breached: {
            $sum: { $cond: [{ $in: ['$slaState', ['breached', 'escalated']] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_FAILED', message: error.message },
    });
  }
}

export async function getDepartmentAnalytics(_req: Request, res: Response) {
  try {
    const departments = await Department.find({ isActive: true }).lean();
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $in: ['$status', ['submitted', 'acknowledged', 'routed', 'assigned', 'in_progress']] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          overdue: {
            $sum: { $cond: [{ $in: ['$slaState', ['breached', 'escalated']] }, 1, 0] },
          },
        },
      },
    ]);

    const statMap = new Map(stats.map((s) => [s._id ? s._id.toString() : 'unassigned', s]));

    const result = departments.map((dept) => {
      const s = statMap.get(dept._id.toString()) || { total: 0, open: 0, resolved: 0, overdue: 0 };
      const resolved = s.resolved || 0;
      const total = s.total || 0;
      return {
        _id: dept._id,
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        total,
        open: s.open || 0,
        resolved,
        overdue: s.overdue || 0,
        efficiencyPercent: total > 0 ? Math.round((resolved / total) * 100) : 100,
      };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_FAILED', message: error.message },
    });
  }
}

export async function getWardAnalytics(_req: Request, res: Response) {
  try {
    const wards = await Ward.find({ isActive: true }).sort({ wardNumber: 1 }).lean();
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$wardId',
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $in: ['$status', ['submitted', 'acknowledged', 'routed', 'assigned', 'in_progress']] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] },
          },
        },
      },
    ]);

    const statMap = new Map(stats.map((s) => [s._id ? s._id.toString() : 'unassigned', s]));

    const result = wards.map((w) => {
      const s = statMap.get(w._id.toString()) || { total: 0, open: 0, resolved: 0, critical: 0 };
      return {
        _id: w._id,
        wardNumber: w.wardNumber,
        name: w.name,
        zone: w.zone,
        population: w.population,
        total: s.total || 0,
        open: s.open || 0,
        resolved: s.resolved || 0,
        critical: s.critical || 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_FAILED', message: error.message },
    });
  }
}

export async function getTrendsAnalytics(_req: Request, res: Response) {
  try {
    const days = 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          isResolved: { $in: ['$status', ['resolved', 'closed']] },
        },
      },
      {
        $group: {
          _id: '$day',
          reported: { $sum: 1 },
          resolved: { $sum: { $cond: ['$isResolved', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_FAILED', message: error.message },
    });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '30', entityType } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit as string, 10) || 30);

    const query: any = {};
    if (entityType) query.entityType = entityType;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUDIT_LOG_FAILED', message: error.message },
    });
  }
}

export async function getSLAConfigurations(_req: Request, res: Response) {
  try {
    const configs = await SLAConfiguration.find().sort({ category: 1, priority: 1 });
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SLA_FETCH_FAILED', message: error.message },
    });
  }
}

export async function updateSLAConfiguration(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { responseTimeHours, resolutionTimeHours, warningThresholdPercent } = req.body;

    const config = await SLAConfiguration.findByIdAndUpdate(
      id,
      { responseTimeHours, resolutionTimeHours, warningThresholdPercent },
      { new: true }
    );

    res.json({ success: true, message: 'SLA standard updated', data: config });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SLA_UPDATE_FAILED', message: error.message },
    });
  }
}
