'use client';

import { useEffect } from 'react';
import Script from 'next/script';

import { useIubenda } from '../contexts/IubendaContext';

export type BannerVersion = 'beta' | 'current' | 'stable';
type TcfPurposesKeys = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
type HexColor = `#${string}`;

export interface IubendaCookieSolutionBannerConfigInterface {
  // See https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide

  // Required
  siteId: number;
  cookiePolicyId: number;
  lang: string;

  // GDPR
  countryDetection?: boolean;
  enableGdpr?: boolean;
  gdprAppliesGlobally?: boolean;
  gdprApplies?: boolean;

  // GDPR > Per-category consent
  perPurposeConsent?: boolean;
  purposes?: string;

  // US State laws
  enableUspr?: boolean;
  usprApplies?: boolean;
  usprPurposes?: string;
  showBannerForUS?: boolean;
  noticeAtCollectionUrl?: string;

  // US State laws > CCPA
  enableCcpa?: boolean;
  ccpaApplies?: boolean;
  ccpaNoticeDisplay?: boolean;
  ccpaAcknowledgeOnDisplay?: boolean;
  ccpaAcknowledgeOnLoad?: boolean;
  ccpaLspa?: boolean;

  // LGPD
  enableLgpd?: boolean;
  lgpdAppliesGlobally?: boolean;
  lgpdApplies?: boolean;

  // IAB Transparency and Consent Framework
  enableTcf?: boolean;
  googleAdditionalConsentMode?: boolean;
  tcfPurposes?: {
    [key in TcfPurposesKeys]?: 'consent_not_needed' | false | 'li_only' | 'consent_only';
  };
  askConsentIfCMPNotFound?: boolean;
  newConsentAtVendorListUpdate?: number;
  tcfPublisherCC?: string;
  acceptTcfSpecialFeaturesWithAcceptBtn?: boolean;

  banner?: {
    // GDPR > Buttons
    acceptButtonDisplay?: boolean;
    customizeButtonDisplay?: boolean;
    rejectButtonDisplay?: boolean;
    closeButtonDisplay?: boolean;
    closeButtonRejects?: boolean;
    explicitWithdrawal?: boolean;

    // GDPR > Per-category consent
    listPurposes?: boolean;
    showPurposesToggles?: boolean;

    // Style and text

    // Style and text > Format and Position
    position?:
      | 'top'
      | 'bottom'
      | 'float-top-left'
      | 'float-top-right'
      | 'float-bottom-left'
      | 'float-bottom-right'
      | 'float-top-center'
      | 'float-bottom-center'
      | 'float-center';
    backgroundOverlay?: boolean;
    // Style and text > Theme

    // Style and text > Theme > Logo
    logo?: string;
    brandTextColor?: HexColor;
    brandBackgroundColor?: HexColor;

    // Style and text > Theme > Banner colors
    backgroundColor?: HexColor;
    textColor?: HexColor;

    // Style and text > Theme > Buttons
    acceptButtonColor?: HexColor;
    acceptButtonCaptionColor?: HexColor;
    customizeButtonColor?: HexColor;
    customizeButtonCaptionColor?: HexColor;
    rejectButtonColor?: HexColor;
    rejectButtonCaptionColor?: HexColor;
    continueWithoutAcceptingButtonColor?: HexColor;
    continueWithoutAcceptingButtonCaptionColor?: HexColor;

    // Style and text > Theme > Advanced settings
    applyStyles?: boolean;
    zIndex?: number;

    // Style and text > Text

    // Style and text > Text > Font size
    fontSize?: string;
    fontSizeCloseButton?: string;
    fontSizeBody?: string;

    // Style and text > Text > Banner copy
    // See https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide#text-banner-copy
    content?: string;
    acceptButtonCaption?: string;
    customizeButtonCaption?: string;
    rejectButtonCaption?: string;
    closeButtonCaption?: string;
    continueWithoutAcceptingButtonCaption?: boolean;
    useThirdParties?: boolean;

    // Style and text > Text > Advanced settings
    html?: string;

    // Style and text > Text > Footer
    footer?: {
      btnCaption?: string;
    };

    // Style and text > Text > i18n
    // See the following:
    // - https://cdn.iubenda.com/cs/i18n.json (Current channel)
    // - https://cdn.iubenda.com/cs/beta/i18n.json (Beta channel)
    // - https://cdn.iubenda.com/cs/stable/i18n.json (Stable channel)
    i18n?: any;

    // Privacy and cookie policy
    cookiePolicyLinkCaption?: string;

    // Advanced settings > Banner settings
    slideDown?: boolean;
    prependOnBody?: boolean;
  };

  // Style and text > Consent widget
  floatingPreferencesButtonDisplay?:
    | boolean
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'anchored-center-left'
    | 'anchored-center-right'
    | 'anchored-top-left'
    | 'anchored-top-right'
    | 'anchored-bottom-left'
    | 'anchored-bottom-right';

  // Style and text > Consent widget > Format and position
  floatingPreferencesButtonCaption?: string;
  floatingPreferencesButtonIcon?: boolean;
  floatingPreferencesButtonHover?: boolean;
  floatingPreferencesButtonRound?: boolean;
  floatingPreferencesButtonZIndex?: number;

  // Style and text > Consent widget > Colors
  floatingPreferencesButtonColor?: HexColor;
  floatingPreferencesButtonCaptionColor?: HexColor;

  // Privacy and cookie policy
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  privacyPolicyNoticeAtCollectionUrl?: string;
  cookiePolicyInOtherWindow?: boolean;

  // Advanced settings

  // Advanced settings > Consent collection settings
  reloadOnConsent?: boolean;
  askConsentAtCookiePolicyUpdate?: boolean;
  enableRemoteConsent?: boolean;
  invalidateConsentWithoutLog?: boolean | `${number}-${number}-${number}`;
  googleConsentMode?: boolean | 'template';

  // Development
  inlineDelay?: number;
  consentOnScrollDelay?: number;
  rebuildIframe?: boolean;

  // Development > Callbacks
  callback?: {
    onReady?: () => void;
    onBannerShown?: () => void;
    onBannerClosed?: () => void;
    onCookiePolicyShown?: () => void;
    onConsentGiven?: () => void;
    onConsentFirstGiven?: () => void;
    onConsentRejected?: () => void;
    onConsentFirstRejected?: () => void;
    onPreferenceExpressed?: () => void;
    onPreferenceFirstExpressed?: () => void;
    onPreferenceExpressedOrNotNeeded?: (preferences: any) => void;
    onPreferenceNotNeeded?: () => void;
    onConsentRead?: () => void;
    onStartupFailed?: (error: string) => void;
    onError?: (error: string) => void;
    onFatalError?: (error: string) => void;
    onActivationDone?: () => void;
    onBeforePreload?: () => void;
    onCcpaAcknowledged?: () => void;
    onCcpaFirstAcknowledged?: () => void;
    onCcpaOptOut?: () => void;
    onCcpaFirstOptOut?: () => void;
    on2ndLayerShown?: () => void;
  },

  // Development > Debugging
  skipSaveConsent?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'nolog';

  preferenceCookie?: {
    // Development > Cookie expiration
    expireAfter?: number;
  };

  ccpaCookie?: {
    // Development > Cookie expiration
    expireAfter?: number;
  };

  // Development > Local consent domain and path
  localConsentDomain?: string;
  localConsentDomainExact?: boolean;
  localConsentPath?: string;

  // Development > Further parameters
  whitelabel?: boolean;
  invalidateConsentBefore?: number | `${number}-${number}-${number}`;
  maxCookieSize?: number;
  maxCookieChunks?: number;
  timeoutLoadConfiguration?: number;
  startOnDomReady?: boolean;
}

const validateConfig = (config: IubendaCookieSolutionBannerConfigInterface): void => {
  if (config.enableGdpr === false && config.enableLgpd === false && config.enableUspr === false) {
    throw new Error('You must enable at least one of the following flags: "enableGdpr", "enableLgpd" or "enableUspr"');
  }

  if (config.enableTcf === true && config.enableGdpr !== true) {
    throw new Error('IAB Transparency and Consent Framework can only be enabled if GDPR is enabled too');
  }

  // TODO: Remove warnings about incomplete features...
  if (config.enableLgpd === true) {
    console.warn(
      'The support for LGPD is incomplete may not work properly. Please report any issues to help us finalizing this feature: https://github.com/mep-agency/next-iubenda/issues',
    );
  }

  if (config.enableUspr === true) {
    console.warn(
      'The support for the US State laws is incomplete may not work properly. Please report any issues help us finalizing this feature: https://github.com/mep-agency/next-iubenda/issues',
    );
  }

  if (config.enableTcf === true) {
    console.warn(
      'The support for the IAB Transparency and Consent Framework is incomplete may not work properly. Please report any issues help us finalizing this feature: https://github.com/mep-agency/next-iubenda/issues',
    );
  }
};

interface Props {
  config: IubendaCookieSolutionBannerConfigInterface;
  version: BannerVersion;
}

const IubendaCookieSolutionBanner = ({ config, version }: Props) => {
  const { dispatchUserPreferences } = useIubenda();
  const versionPath = version === 'current' ? '' : `/${version}`;

  useEffect(() => {
    validateConfig(config);

    (window as any)._iub = (window as any)._iub || [];
    (window as any)._iub.csConfiguration = config;

    const callback = config.callback || {};
    (window as any)._iub.csConfiguration.callback = Object.assign(callback, {
      onPreferenceExpressedOrNotNeeded: function (preferences: any) {
        // TODO: Figure out what the "preferences.consent" property really means since it's behavior is not documented.

        if (!preferences) {
          dispatchUserPreferences({ type: 'consent_not_needed' });
          if(callback.onPreferenceExpressedOrNotNeeded) callback.onPreferenceExpressedOrNotNeeded(preferences);
          return;
        } else {
          dispatchUserPreferences({
            type: 'update',
            rawData: preferences,
          });
          if(callback.onPreferenceExpressedOrNotNeeded) callback.onPreferenceExpressedOrNotNeeded(preferences);
        }
      },
    });
  }, [config, dispatchUserPreferences]);

  return (
    <>
      {/* Scripts for IAB Transparency and Consent Framework */}
      {config.enableTcf === true ? (
        <>
          <Script key="iubenda_tcf" src={`//cdn.iubenda.com/cs/tcf${versionPath}/stub-v2.js`} type="text/javascript" />
          <Script
            key="iubenda_safe_tcf"
            src={`//cdn.iubenda.com/cs/tcf${versionPath}/safe-tcf-v2.js`}
            type="text/javascript"
          />
        </>
      ) : (
        <></>
      )}

      {/* Scripts for US State laws */}
      {config.enableUspr === true ? (
        <Script key="iubenda_gpp" src={`//cdn.iubenda.com/cs/gpp${versionPath}/stub.js`} type="text/javascript" />
      ) : (
        <></>
      )}

      {/* Scripts for basic Consent Solution */}
      <Script key="iubenda_cs" src={`//cdn.iubenda.com/cs${versionPath}/iubenda_cs.js`} type="text/javascript" async />
    </>
  );
};

export default IubendaCookieSolutionBanner;
