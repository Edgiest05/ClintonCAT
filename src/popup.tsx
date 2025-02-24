import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as styles from './popup.module.css';
import Preferences from './preferences';
import ChromeSyncStorage from './storage/chrome-sync-storage';
import ChromeLocalStorage from './storage/chrome-local-storage';

const Popup = () => {
    const [isEnabled, setIsEnabled] = useState(Preferences.isEnabled.value);

    Preferences.isEnabled.addListener('enable-options', (result: boolean) => {
        setIsEnabled(result);
    });

    const handleToggleEnabled = () => {
        Preferences.isEnabled.value = !Preferences.isEnabled.value;
    };

    const openCATPage = () => {
        // TODO:
    };

    const allowThisSite = () => {
        const domain = window.location.hostname; // TODO: gets extension name instead of open tab domain
        Preferences.domainExclusions.delete(domain);
    };

    const excludeThisSite = () => {
        const domain = window.location.hostname; // TODO: gets extension name instead of open tab domain
        Preferences.domainExclusions.add(domain);
    };

    const openOptionsPage = () => {
        void chrome.runtime.openOptionsPage();
    };

    return (
        <div className={styles.popupContainer}>
            <p className={styles.popupTitle}>ClintonCAT</p>
            <div className={styles.divider} />
            <label className={styles.toggleLabel}>
                <span>{isEnabled ? 'Disable' : 'Enable'} ClintonCAT</span>
                <input type="checkbox" checked={isEnabled} onChange={handleToggleEnabled} />
                <span className={`${styles.toggleSlider} ${isEnabled ? styles.toggled : ''}`} />
            </label>

            <div className={styles.divider} />
            <div className={styles.buttonGroup}>
                <button className={styles.popupButton} onClick={openCATPage}>
                    Open CAT page
                </button>
                <button className={styles.popupButton} onClick={allowThisSite}>
                    Allow this site
                </button>
                <button className={styles.popupButton} onClick={excludeThisSite}>
                    Exclude this site
                </button>
                <button className={styles.popupButton} onClick={openOptionsPage}>
                    Go to Options
                </button>
            </div>
            <div className={styles.divider} />
        </div>
    );
};

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement instanceof HTMLElement) {
    const root = createRoot(rootElement);
    void Preferences.initDefaults(new ChromeSyncStorage(), new ChromeLocalStorage()).then(() => {
        root.render(
            <React.StrictMode>
                <Popup />
            </React.StrictMode>
        );
    });
} else {
    throw Error('No root element was found');
}
