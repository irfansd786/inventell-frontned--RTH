import { defaultSettingsData } from '../data/settingsData';

let currentSettings = { ...defaultSettingsData };

export const settingsService = {
  getSettings: async () => currentSettings,
  saveSettings: async (newSettings) => {
    currentSettings = { ...currentSettings, ...newSettings };
    return currentSettings;
  },
  resetSettings: async () => {
    currentSettings = { ...defaultSettingsData };
    return currentSettings;
  }
};
