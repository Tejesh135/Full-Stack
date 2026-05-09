import ActivityLog from "../models/ActivityLog.js";

const logActivity = async ({ action, entityType, entityId, message, performedBy }) => {
  if (!performedBy) return;
  await ActivityLog.create({
    action,
    entityType,
    entityId,
    message,
    performedBy
  });
};

export default logActivity;
