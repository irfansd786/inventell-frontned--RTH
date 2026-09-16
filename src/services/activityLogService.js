import { activityLogList } from '../data/activityLogData';

export const activityLogService = {
  getLogs: async () => activityLogList,
};
