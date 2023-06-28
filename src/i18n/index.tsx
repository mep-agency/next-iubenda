export const I18N_DEFAULT_LANG = 'en';

export interface I18nDictionaryInterface {
  consentAwareWrapper: {
    loading: string;
    consentNotGranted: string;
    openPreferencesButtonText: string;
  };
}

export const i18nDictionaries: { [key: string]: I18nDictionaryInterface } = {
  en: {
    consentAwareWrapper: {
      loading: 'Loading consent data...',
      consentNotGranted: 'Consent is not granted for this content. Please update your preferences to enable it.',
      openPreferencesButtonText: 'Open preferences',
    },
  },
  it: {
    consentAwareWrapper: {
      loading: 'Caricamento dati consenso...',
      consentNotGranted:
        'È stato negato il consenso per questo contenuto. Puoi cambiare le tue preferenze per visualizzarlo.',
      openPreferencesButtonText: 'Apri preferenze',
    },
  },
};
