import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Department, DepartmentCode } from '../models/Department';
import { User } from '../models/User';
import { Complaint } from '../models/Complaint';
import { Ward } from '../models/Ward';
import { logAuditAction } from '../middleware/audit';

export async function getDepartments(_req: Request, res: Response) {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();

    // Aggregate worker counts and complaint counts per department
    const [workerCounts, activeComplaintCounts, resolvedComplaintCounts] = await Promise.all([
      User.aggregate([
        { $match: { role: { $in: ['field_officer', 'department_officer'] }, isActive: true } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: { status: { $in: ['submitted', 'routed', 'assigned', 'in_progress', 'resolution_submitted'] } } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: { status: { $in: ['resolved', 'closed'] } } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
    ]);

    const workerMap = new Map(workerCounts.map((w) => [w._id?.toString(), w.count]));
    const activeCompMap = new Map(activeComplaintCounts.map((c) => [c._id?.toString(), c.count]));
    const resolvedCompMap = new Map(resolvedComplaintCounts.map((c) => [c._id?.toString(), c.count]));

    const enriched = departments.map((d) => ({
      ...d,
      workerCount: workerMap.get(d._id.toString()) || 0,
      activeComplaintsCount: activeCompMap.get(d._id.toString()) || 0,
      resolvedComplaintsCount: resolvedCompMap.get(d._id.toString()) || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_DEPTS_FAILED', message: error.message },
    });
  }
}

export async function getDepartmentById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const department = await Department.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
        { slug: id.toLowerCase() },
        { code: id.toUpperCase() },
      ],
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found' },
      });
    }

    const workers = await User.find({
      departmentId: department._id,
      isActive: true,
    })
      .populate('wardId', 'wardNumber name zone')
      .select('name email phone role badgeNumber wardId avatar createdAt')
      .lean();

    res.json({ success: true, data: { department, workers } });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_DEPT_FAILED', message: error.message },
    });
  }
}

/**
 * Get all workers / staff assigned to a department with task metrics
 */
export async function getDepartmentWorkers(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const department = await Department.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
        { slug: id.toLowerCase() },
        { code: id.toUpperCase() },
      ],
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found' },
      });
    }

    const workers = await User.find({
      departmentId: department._id,
      role: { $in: ['field_officer', 'department_officer'] },
      isActive: true,
    })
      .populate('wardId', 'wardNumber name zone')
      .select('name email phone role badgeNumber wardId avatar createdAt')
      .lean();

    const workerIds = workers.map((w) => w._id);

    // Compute task metrics for each worker
    const [activeTasks, resolvedTasks] = await Promise.all([
      Complaint.aggregate([
        {
          $match: {
            assignedOfficerId: { $in: workerIds },
            status: { $in: ['assigned', 'in_progress', 'resolution_submitted'] },
          },
        },
        { $group: { _id: '$assignedOfficerId', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        {
          $match: {
            assignedOfficerId: { $in: workerIds },
            status: { $in: ['resolved', 'closed', 'verification_pending'] },
          },
        },
        { $group: { _id: '$assignedOfficerId', count: { $sum: 1 } } },
      ]),
    ]);

    const activeMap = new Map(activeTasks.map((t) => [t._id.toString(), t.count]));
    const resolvedMap = new Map(resolvedTasks.map((t) => [t._id.toString(), t.count]));

    const enrichedWorkers = await Promise.all(
      workers.map(async (w) => {
        const recentTasks = await Complaint.find({ assignedOfficerId: w._id })
          .select('complaintNumber title status priority createdAt')
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        return {
          ...w,
          activeTasksCount: activeMap.get(w._id.toString()) || 0,
          resolvedTasksCount: resolvedMap.get(w._id.toString()) || 0,
          recentTasks,
        };
      })
    );

    res.json({
      success: true,
      data: {
        department: {
          _id: department._id,
          name: department.name,
          code: department.code,
          slug: department.slug,
          description: department.description,
          icon: department.icon,
        },
        workers: enrichedWorkers,
        totalWorkers: enrichedWorkers.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_WORKERS_FAILED', message: error.message },
    });
  }
}

/**
 * Create a new Department (Admin only)
 */
export async function createDepartment(req: Request, res: Response) {
  try {
    const { name, code, slug, description, contactEmail, contactPhone, icon, categories, active } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Department name and description are required.' },
      });
    }

    const generatedSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')).toLowerCase();
    const finalCode = (code && code.trim() ? code.trim() : generatedSlug).toUpperCase();

    // Check duplicate
    const existing = await Department.findOne({
      $or: [{ slug: generatedSlug }, { code: finalCode }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_DEPARTMENT', message: `Department code '${finalCode}' or slug '${generatedSlug}' already exists.` },
      });
    }

    const deptCategories = Array.isArray(categories)
      ? categories
      : typeof categories === 'string'
      ? categories.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const newDept = await Department.create({
      name,
      code: finalCode,
      slug: generatedSlug,
      description,
      contactEmail,
      contactPhone,
      icon: icon || 'building-2',
      categories: deptCategories,
      active: active !== undefined ? active : true,
      isActive: active !== undefined ? active : true,
      notificationSettings: { emailAlerts: true, smsAlerts: true, inAppAlerts: true },
    });

    await logAuditAction({
      req,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: newDept._id.toString(),
      details: { name: newDept.name, code: newDept.code },
    });

    res.status(201).json({
      success: true,
      message: `Department '${newDept.name}' created successfully.`,
      data: newDept,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_DEPT_FAILED', message: error.message },
    });
  }
}

/**
 * Update an existing Department (Admin only)
 */
export async function updateDepartment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, slug, description, contactEmail, contactPhone, icon, categories, active } = req.body;

    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found.' },
      });
    }

    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase() as DepartmentCode;
    if (slug) dept.slug = slug.toLowerCase();
    if (description) dept.description = description;
    if (contactEmail !== undefined) dept.contactEmail = contactEmail;
    if (contactPhone !== undefined) dept.contactPhone = contactPhone;
    if (icon) dept.icon = icon;
    if (active !== undefined) {
      dept.active = active;
      dept.isActive = active;
    }
    if (categories !== undefined) {
      dept.categories = Array.isArray(categories)
        ? categories
        : typeof categories === 'string'
        ? categories.split(',').map((c) => c.trim()).filter(Boolean)
        : dept.categories;
    }

    await dept.save();

    await logAuditAction({
      req,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: dept._id.toString(),
      details: { name: dept.name, code: dept.code },
    });

    res.json({
      success: true,
      message: `Department '${dept.name}' updated successfully.`,
      data: dept,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_DEPT_FAILED', message: error.message },
    });
  }
}

/**
 * Add a new Field Officer / Worker to a Department
 */
export async function addDepartmentWorker(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, password, phone, role, badgeNumber, wardId } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found.' },
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, email, and password are required.' },
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'A user with this email already exists.' },
      });
    }

    const newWorker = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'field_officer',
      departmentId: department._id,
      wardId: wardId && mongoose.Types.ObjectId.isValid(wardId) ? new mongoose.Types.ObjectId(wardId) : undefined,
      badgeNumber: badgeNumber || `${department.code.substring(0, 3)}-FO-${Math.floor(100 + Math.random() * 900)}`,
      isActive: true,
    });

    await logAuditAction({
      req,
      action: 'WORKER_CREATED',
      entityType: 'User',
      entityId: newWorker._id.toString(),
      details: { name: newWorker.name, department: department.name, role: newWorker.role },
    });

    res.status(201).json({
      success: true,
      message: `Worker '${newWorker.name}' added to ${department.name}.`,
      data: {
        _id: newWorker._id,
        name: newWorker.name,
        email: newWorker.email,
        phone: newWorker.phone,
        role: newWorker.role,
        badgeNumber: newWorker.badgeNumber,
        wardId: newWorker.wardId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ADD_WORKER_FAILED', message: error.message },
    });
  }
}
