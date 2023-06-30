'use client';

import React, { createContext, ReactNode, useContext, useReducer } from 'react';

import IubendaBanner, {
  BannerVersion,
  IubendaCookieSolutionBannerConfigInterface,
} from '../components/IubendaCookieSolutionBanner';
import { I18N_DEFAULT_LANG, I18nDictionaryInterface, i18nDictionaries } from '../i18n';

interface Props {
  bannerConfig: IubendaCookieSolutionBannerConfigInterface;
  bannerVersion?: BannerVersion;
  lang?: string;
  fallbackLang?: string;
  customI18nDictionaries?: typeof i18nDictionaries;
  children: ReactNode;
}

export interface IubendaContext {
  userPreferences: {
    // When set to true, the consent value has been updated at least once by the banner
    hasBeenLoaded: boolean;
    gdprPurposes: {
      // See https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide#per-category-consent
      necessary: boolean;
      functionality: boolean;
      experience: boolean;
      measurement: boolean;
      marketing: boolean;
    };
    rawData?: {
      // Raw data returned by Iubenda
      consent?: boolean;
      id: number;
      purposes?: {
        [key: string]: boolean;
      };
      timestamp: string;
      version: string;
    };
  };
  dispatchUserPreferences: (action: UserPreferencesDispatcherAction) => void;
  showCookiePolicy: () => void;
  openPreferences: () => void;
  showTcfVendors: () => void;
  resetCookies: () => void;
  i18nDictionary: I18nDictionaryInterface;
}

const userPreferencesInitialState: IubendaContext['userPreferences'] = {
  hasBeenLoaded: false,
  gdprPurposes: {
    necessary: false,
    functionality: false,
    experience: false,
    measurement: false,
    marketing: false,
  },
};

interface UserPreferencesDispatcherUpdateActionInterface {
  type: 'update';
  rawData: IubendaContext['userPreferences']['rawData'];
}

interface UserPreferencesDispatcherConsentNotNeededActionInterface {
  type: 'consent_not_needed';
}

interface UserPreferencesDispatcherResetActionInterface {
  type: 'reset';
}

type UserPreferencesDispatcherAction =
  | UserPreferencesDispatcherUpdateActionInterface
  | UserPreferencesDispatcherConsentNotNeededActionInterface
  | UserPreferencesDispatcherResetActionInterface;

const userPreferencesDispatcher = (
  state: IubendaContext['userPreferences'],
  action: UserPreferencesDispatcherAction,
): IubendaContext['userPreferences'] => {
  switch (action.type) {
    case 'update':
      if (action.rawData === undefined) {
        throw new Error('Invalid user preferences (Iubenda raw data).');
      }

      return {
        hasBeenLoaded: true,
        gdprPurposes: {
          necessary: action.rawData.purposes?.['1'] === true,
          functionality: action.rawData.purposes?.['2'] === true,
          experience: action.rawData.purposes?.['3'] === true,
          measurement: action.rawData.purposes?.['4'] === true,
          marketing: action.rawData.purposes?.['5'] === true,
        },
        rawData: action.rawData,
      };
    case 'consent_not_needed':
      // When the consent is "not needed" it means everything should be enabled by default.
      const newUserPreferences = userPreferencesInitialState;

      newUserPreferences.gdprPurposes.necessary = true;
      newUserPreferences.gdprPurposes.functionality = true;
      newUserPreferences.gdprPurposes.experience = true;
      newUserPreferences.gdprPurposes.measurement = true;
      newUserPreferences.gdprPurposes.marketing = true;

      return newUserPreferences;
    case 'reset':
      return userPreferencesInitialState;
    default:
      return state;
  }
};

const IubendaContext = createContext({} as IubendaContext);

export const useIubenda = () => {
  return useContext(IubendaContext);
};

export const IubendaProvider = ({
  bannerConfig,
  bannerVersion,
  lang,
  fallbackLang,
  customI18nDictionaries,
  children,
}: Props) => {
  const [userPreferences, dispatchUserPreferences] = useReducer(userPreferencesDispatcher, userPreferencesInitialState);
  const fallbackLangCode = fallbackLang ?? I18N_DEFAULT_LANG;
  const langCode = lang ?? fallbackLangCode;
  const i18nDictionary =
    (customI18nDictionaries ?? i18nDictionaries)[langCode.toLowerCase()] ??
    (customI18nDictionaries ?? i18nDictionaries)[langCode.split('-')[0].toLowerCase()] ??
    (customI18nDictionaries ?? i18nDictionaries)[fallbackLangCode.toLowerCase()] ??
    (customI18nDictionaries ?? i18nDictionaries)[fallbackLangCode.split('-')[0].toLowerCase()];

  if (i18nDictionary === undefined) {
    throw new Error(`Cannot find any i18n dictionary for lang "${langCode}" with fallback to "${fallbackLangCode}".`);
  }

  const value: IubendaContext = {
    userPreferences,
    dispatchUserPreferences,
    showCookiePolicy: () => (window as any)._iub.cs.api.showCP(),
    openPreferences: () => (window as any)._iub.cs.api.openPreferences(),
    showTcfVendors: () => (window as any)._iub.cs.api.showTcfVendors(),
    resetCookies: () => (window as any)._iub.cs.api.resetCookies(),
    i18nDictionary,
  };

  return (
    <IubendaContext.Provider value={value}>
      {children}

      <IubendaBanner config={bannerConfig} version={bannerVersion ?? 'current'} />
    </IubendaContext.Provider>
  );
};
