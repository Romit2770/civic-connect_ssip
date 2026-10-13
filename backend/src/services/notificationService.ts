import mongoose from 'mongoose';
import { Notification, INotification } from '../models/Notification';
import { emitToRole, emitToUser, emitToDepartment } from '../config/socket';

export interface CreateNotificationInput {
  userId: mongoose.Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  complaintId?: mongoose.Types.ObjectId | string;
  complaintNumber?: string;
  actionUrl?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<INotification> {
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    complaintId: input.complaintId,
    complaintNumber: input.complaintNumber,
    actionUrl: input.actionUrl,
  });

  // Emit real-time WebSocket notification to user
  emitToUser(input.userId, 'notification:new', {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    complaintId: notification.complaintId,
    complaintNumber: notification.complaintNumber,
    createdAt: notification.createdAt,
    isRead: false,
  });

  return notification;
}

export { emitToRole, emitToUser, emitToDepartment };
