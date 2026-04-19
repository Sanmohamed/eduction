import Notification from "../models/Notification.js";

export async function createNotification({
  user,
  title,
  message,
  type = "system",
}) {
  return Notification.create({
    user,
    title,
    message,
    type,
    isRead: false,
  });
}