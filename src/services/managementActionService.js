import { managementActionsList } from '../data/managementActionsData';

export const managementActionService = {
  getActions: async () => managementActionsList,
  updateActionStatus: async (id, newStatus) => {
    const item = managementActionsList.find((a) => a.id === id);
    if (item) item.status = newStatus;
    return item;
  }
};
