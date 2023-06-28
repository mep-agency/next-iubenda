'use client';

import React, { createContext, ReactNode, useContext, useReducer } from 'react';

import IubendaBanner, { IubendaConsentSolutionBannerConfigInterface } from '../components/IubendaConsentSolutionBanner';
import { I18N_DEFAULT_LANG, I18nDictionaryInterface, i18nDictionaries } from '../i18n';

interface Props {
  bannerConfig: IubendaConsentSolutionBannerConfigInterface;
  lang?: string;
  fallbackLang?: string;
  customI18nDictionaries?: typeof i18nDictionaries;
  children: ReactNode;
}

export interface IubendaConsentSolutionContext {
  consent: {
    // When set to true, the consent value has been updated at least once by the banner
    hasBeenLoaded: boolean;
    purposes: {
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
      purposes: {
        [key: string]: boolean;
      };
      timestamp: string;
      version: string;
    };
  };
  dispatchConsent: (action: ConsentDispatcherAction) => void;
  showCookiePolicy: () => void;
  openPreferences: () => void;
  showTcfVendors: () => void;
  resetCookies: () => void;
  i18nDictionary: I18nDictionaryInterface;
}

const consentInitialState: IubendaConsentSolutionContext['consent'] = {
  hasBeenLoaded: false,
  purposes: {
    necessary: false,
    functionality: false,
    experience: false,
    measurement: false,
    marketing: false,
  },
};

interface ConsentDispatcherUpdateActionInterface {
  type: 'update';
  rawData: IubendaConsentSolutionContext['consent']['rawData'];
}

interface ConsentDispatcherNotNeededActionInterface {
  type: 'not_needed';
}

interface ConsentDispatcherResetActionInterface {
  type: 'reset';
}

type ConsentDispatcherAction =
  | ConsentDispatcherUpdateActionInterface
  | ConsentDispatcherNotNeededActionInterface
  | ConsentDispatcherResetActionInterface;

const consentDispatcher = (
  state: IubendaConsentSolutionContext['consent'],
  action: ConsentDispatcherAction,
): IubendaConsentSolutionContext['consent'] => {
  switch (action.type) {
    case 'update':
      if (action.rawData === undefined) {
        throw new Error('Invalid Iubenda consent raw data.');
      }

      return {
        hasBeenLoaded: true,
        purposes: {
          necessary: action.rawData.purposes['1'] === true,
          functionality: action.rawData.purposes['2'] === true,
          experience: action.rawData.purposes['3'] === true,
          measurement: action.rawData.purposes['4'] === true,
          marketing: action.rawData.purposes['5'] === true,
        },
        rawData: action.rawData,
      };
    case 'not_needed':
      // When the consent is "not needed" it means everything should be enabled by default.
      const newConsent = consentInitialState;

      newConsent.purposes.necessary = true;
      newConsent.purposes.functionality = true;
      newConsent.purposes.experience = true;
      newConsent.purposes.measurement = true;
      newConsent.purposes.marketing = true;

      return newConsent;
    case 'reset':
      return consentInitialState;
    default:
      return state;
  }
};

const IubendaConsentSolutionContext = createContext({} as IubendaConsentSolutionContext);

export function useIubendaConsent() {
  return useContext(IubendaConsentSolutionContext);
}

export const IubendaConsentProvider = ({ bannerConfig, lang, fallbackLang, customI18nDictionaries, children }: Props) => {
  const [consent, dispatchConsent] = useReducer(consentDispatcher, consentInitialState);
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

  const value: IubendaConsentSolutionContext = {
    consent,
    dispatchConsent,
    showCookiePolicy: () => (window as any)._iub.cs.api.showCP(),
    openPreferences: () => (window as any)._iub.cs.api.openPreferences(),
    showTcfVendors: () => (window as any)._iub.cs.api.showTcfVendors(),
    resetCookies: () => (window as any)._iub.cs.api.resetCookies(),
    i18nDictionary,
  };

  return (
    <IubendaConsentSolutionContext.Provider value={value}>
      {children}

      <IubendaBanner config={bannerConfig} />
    </IubendaConsentSolutionContext.Provider>
  );
};
