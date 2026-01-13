import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

interface Settings {
    churchName: string;
    logoUrl?: string;
}

interface SettingsContextType {
    settings: Settings | null;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    refreshSettings: async () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings | null>(null);

    const refreshSettings = async () => {
        try {
            const res = await settingsAPI.get();
            setSettings({
                churchName: res.data.churchName,
                logoUrl: res.data.logoUrl
            });

            // Update document title and favicon
            if (res.data.churchName) {
                document.title = res.data.churchName + ' Admin';
            }
            if (res.data.logoUrl) {
                const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (link) link.href = res.data.logoUrl;
            }

        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
