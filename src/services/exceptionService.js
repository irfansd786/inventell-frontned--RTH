import { exceptionsSummaryKPIs, exceptionsList } from '../data/exceptionsData';

export const exceptionService = {
  getSummary: async () => exceptionsSummaryKPIs,
  getExceptions: async () => exceptionsList,
  updateExceptionStatus: async (id, status, assignedTo, note) => {
    const item = exceptionsList.find((e) => e.id === id);
    if (item) {
      if (status) item.status = status;
      if (assignedTo) item.assignedTo = assignedTo;
      if (note) item.notes += ` | Note: ${note}`;
    }
    return item;
  },
  resolveException: async (id) => {
    const item = exceptionsList.find((e) => e.id === id);
    if (item) {
      item.status = 'Resolved';
    }
    return item;
  },
};
