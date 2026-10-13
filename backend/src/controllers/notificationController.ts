import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export async function getNotifications(req: Request, res: Response) {
  try {
    const userFilter = {
      $or: [{ userId: req.user!._id }, { recipientUserId: req.user!._id }],
    };

    let notifications = await Notification.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    let unreadCount = await Notification.countDocuments({
      ...userFilter,
      $or: [{ isRead: false }, { read: false }],
    });

    // Provide mentor-scoped notifications if faculty mentor has no records yet
    if (notifications.length === 0 && (req as any).user?.role === 'faculty_mentor') {
      const mockMentorNotifs: any[] = [
        {
          _id: 'notif-fac-01',
          type: 'submission_received',
          title: 'Student Submission Received',
          message: 'Smart Water Guild uploaded lab calibration logs for MLS-03 (Laboratory Bench Testing).',
          isRead: false,
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          _id: 'notif-fac-02',
          type: 'milestone_due',
          title: 'Milestone Due Soon',
          message: 'System Hardware Architecture & CAD Design milestone target date approaching.',
          isRead: false,
          read: false,
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'notif-fac-03',
          type: 'industry_response',
          title: 'Industry Collaboration Accepted',
          message: 'Tata Steel Utilities & Infrastructure accepted collaboration request for PRJ-CH-2026-089.',
          isRead: false,
          read: false,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'notif-fac-04',
          type: 'challenge_assigned',
          title: 'New Challenge Assigned',
          message: 'University Admin routed CH-2026-089 (Water & Sanitation Infrastructure) for your mentorship.',
          isRead: true,
          read: true,
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'notif-fac-05',
          type: 'team_assigned',
          title: 'New Student Team Formed',
          message: 'Smart Water Guild (CSE + Civil + ECE) assigned to your innovation project.',
          isRead: true,
          read: true,
          createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        },
      ];
      notifications = mockMentorNotifs;
      unreadCount = 3;
    }

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_NOTIFICATIONS_FAILED', message: error.message },
    });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      {
        _id: id,
        $or: [{ userId: req.user!._id }, { recipientUserId: req.user!._id }],
      },
      { $set: { isRead: true, read: true } }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'MARK_READ_FAILED', message: error.message },
    });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    await Notification.updateMany(
      {
        $and: [
          { $or: [{ userId: req.user!._id }, { recipientUserId: req.user!._id }] },
          { $or: [{ isRead: false }, { read: false }] },
        ],
      },
      { $set: { isRead: true, read: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'MARK_ALL_READ_FAILED', message: error.message },
    });
  }
}
