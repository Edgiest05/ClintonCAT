import ObservableSet from '@/common/observables/observable-set';
import ObservableValue from '@/common/observables/observable-value';
import { IStorageBackend } from '@/storage/istorage-backend';
import { Nullable } from '@/utils/types';

export enum NotificationType {
    ICON_ONLY,
    TOAST,
    OTHER_TAB,
    NOTIFICATION,
    TOTAL_NOTIFICATION_TYPES,
}

export default class Preferences {
    static readonly IS_ENABLED_KEY = 'is_enabled';
    static readonly DOMAIN_EXCLUSIONS_KEY = 'domain_exclusions';
    static readonly NOTFICATION_TYPE_KEY = 'notification_type';
    static readonly DEFAULT_DOMAIN_EXCLUSIONS = ['rossmanngroup.com'];

    static isEnabled = new ObservableValue<boolean>(true);
    static domainExclusions = new ObservableSet<string>();
    static notificationType = new ObservableValue<NotificationType>(NotificationType.ICON_ONLY);

    // Injected storage backends  (TODO: do we need both?)
    // Sync is used to share data across browsers if logged in, e.g. plugin settings
    // Local is for 'this' browser only storage and can have more space available, e.g. for the pages db
    private static preferenceStore: Nullable<IStorageBackend> = null;
    private static localStore: Nullable<IStorageBackend> = null;

    /**
     * Inject whichever storage backends you want to use (sync, local, or even mocks for testing).
     */
    static setBackingStores(preferenceStore: IStorageBackend, localStore: IStorageBackend) {
        this.preferenceStore = preferenceStore;
        this.localStore = localStore;
    }

    private static clearAllListeners() {
        this.isEnabled.removeAllListeners();
        this.domainExclusions.removeAllListeners();
        this.notificationType.removeAllListeners();
    }

    private static addDefaultCallbacks() {
        this.isEnabled.addListener(this.IS_ENABLED_KEY, (result: boolean) => {
            void this.setPreference(Preferences.IS_ENABLED_KEY, result);
        });
        this.domainExclusions.addListener(this.DOMAIN_EXCLUSIONS_KEY, (result: string[]) => {
            void this.setPreference(Preferences.DOMAIN_EXCLUSIONS_KEY, result);
        });
        this.notificationType.addListener(this.NOTFICATION_TYPE_KEY, (result: NotificationType) => {
            void this.setPreference(Preferences.NOTFICATION_TYPE_KEY, result as number);
        });
    }

    /**
     * Get defaults from preferenceStorage, if available,
     * otherwise use some default values. This method needs to
     * be called for each context to initialize storage correctly
     */
    static async initDefaults(preferenceStore: IStorageBackend, localStore: IStorageBackend) {
        console.log('Defaulting settings');
        this.setBackingStores(preferenceStore, localStore);
        this.clearAllListeners();

        // Attempt preference retrieval
        const rawIsEnabled = await this.getPreference(this.IS_ENABLED_KEY);
        if (typeof rawIsEnabled === 'boolean') {
            this.isEnabled.value = rawIsEnabled;
            this.addDefaultCallbacks();
        } else {
            this.addDefaultCallbacks();
            this.isEnabled.value = true;
        }
        const rawDomainExclusions = await this.getPreference(this.DOMAIN_EXCLUSIONS_KEY);
        if (Array.isArray(rawDomainExclusions)) {
            this.domainExclusions.value = rawDomainExclusions.filter(
                (item): item is string => typeof item === 'string'
            );
            this.addDefaultCallbacks();
        } else {
            this.addDefaultCallbacks();
            this.domainExclusions.value = Preferences.DEFAULT_DOMAIN_EXCLUSIONS;
        }
        const rawNotificationType = await this.getPreference(this.NOTFICATION_TYPE_KEY);
        if (typeof rawNotificationType === 'number') {
            this.notificationType.value = rawNotificationType as NotificationType;
            this.addDefaultCallbacks();
        } else {
            this.addDefaultCallbacks();
            this.notificationType.value = NotificationType.ICON_ONLY;
        }
    }

    public static dump(): void {
        const msg: string =
            `IsEnabled = ${Preferences.isEnabled.toString()}, ` +
            `DomainExclusions = ${Preferences.domainExclusions.toString()}`;
        console.log(msg);
    }

    /**
     * Actual reading/writing now delegated to the injected preference store
     */
    static async setPreference(key: string, value: unknown): Promise<void> {
        if (!this.preferenceStore) {
            throw new Error('No preferenceStore defined! Call setBackingStores() first.');
        }
        await this.preferenceStore.set(key, value);
        console.log(`(setPreference) ${key} = ${JSON.stringify(value)}`);
    }

    static async getPreference(key: string): Promise<unknown> {
        if (!this.preferenceStore) {
            throw new Error('No preferenceStore defined! Call setBackingStores() first.');
        }
        const value = await this.preferenceStore.get(key);
        console.log(`(getPreference) ${key} =>`, value);
        return value;
    }

    // TODO: decide whether to use localStore or preferenceStore
    static async setStorage(key: string, value: unknown): Promise<void> {
        if (!this.localStore) {
            throw new Error('No localStore defined! Call setBackingStores() first.');
        }
        await this.localStore.set(key, value);
        console.log(`(setStorage) ${key} = ${JSON.stringify(value)}`);
    }

    static async getStorage(key: string): Promise<unknown> {
        if (!this.localStore) {
            throw new Error('No localStore defined! Call setBackingStores() first.');
        }
        const value = await this.localStore.get(key);
        console.log(`(getStorage) ${key} =>`, value);
        return value;
    }
}
