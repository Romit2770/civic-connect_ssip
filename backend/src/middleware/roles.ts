import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    // Super Admin has access everywhere
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: [${roles.join(', ')}]. Your role: ${req.user.role}`,
        },
      });
    }

    next();
  };
}

export const requireStaff = requireRole(
  'field_officer',
  'field_worker',
  'department_officer',
  'municipal_admin',
  'super_admin'
);

export const requireAdmin = requireRole('municipal_admin', 'super_admin');

export const requireDepartmentAdmin = requireRole(
  'department_officer',
  'municipal_admin',
  'super_admin'
);
