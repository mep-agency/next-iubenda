'use client';

import styles from './styles.module.scss';

import { CSSProperties, ReactNode, useEffect, useReducer, useState } from 'react';

import { IubendaConsentSolutionContext, useIubendaConsent } from '../../contexts/IubendaConsentSolutionContext';

const DEFAULT_WRAPPER_CLASS = 'mep-next-iubenda-wrapper';

type RequiredPurposes = (keyof IubendaConsentSolutionContext['consent']['purposes'])[];

interface Props {
  className?: string;
  useDefaultStyles?: boolean;
  requiredPurposes: RequiredPurposes;
  customLoadingNodes?: ReactNode;
  customConsentNotGrantedNodes?: ReactNode;
  style?: CSSProperties;
  children: ReactNode;
}

interface StateInterface {
  isLoading: boolean;
  isEnabled: boolean;
  requiredPurposes: RequiredPurposes;
}

interface UpdateRequiredPurposesActionInterface {
  type: 'update_required_purposes';
  requiredPurposes: RequiredPurposes;
}

interface UpdateConsentActionInterface {
  type: 'update_consent';
  consent: IubendaConsentSolutionContext['consent'];
}

type Action = UpdateRequiredPurposesActionInterface | UpdateConsentActionInterface;

const initialState: StateInterface = {
  isLoading: true,
  isEnabled: false,
  requiredPurposes: [],
};

const reducer = (state: StateInterface, action: Action): StateInterface => {
  switch (action.type) {
    case 'update_required_purposes':
      return {
        ...state,
        requiredPurposes: action.requiredPurposes,
      };
    case 'update_consent':
      return {
        ...state,
        isLoading: false,
        isEnabled: state.requiredPurposes.reduce(
          (isEnabled, purposeName) => isEnabled && action.consent.purposes[purposeName],
          true,
        ),
      };
    default:
      return state;
  }
};

const ConsentAwareWrapper = ({
  className,
  useDefaultStyles,
  requiredPurposes,
  customLoadingNodes,
  customConsentNotGrantedNodes,
  style,
  children,
}: Props) => {
  const { consent, openPreferences, i18nDictionary: t } = useIubendaConsent();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [computedClassName, setComputedClassName] = useState<string>();

  useEffect(() => {
    if (requiredPurposes.length < 1) {
      throw new Error('Required purposes array cannot be empty!');
    }

    dispatch({
      type: 'update_required_purposes',
      requiredPurposes,
    });
  }, [requiredPurposes]);

  useEffect(() => {
    if (consent.hasBeenLoaded === true) {
      dispatch({
        type: 'update_consent',
        consent,
      });
    }
  }, [consent, state.requiredPurposes]);

  useEffect(() => {
    const classNames: string[] = [DEFAULT_WRAPPER_CLASS];

    if (useDefaultStyles === undefined || useDefaultStyles === true) {
      classNames.push(styles.wrapper);
    }

    if (className !== undefined && className.length > 0) {
      classNames.push(className);
    }

    setComputedClassName(classNames.join(' '));
  }, [className, useDefaultStyles]);

  return computedClassName === undefined ? (
    <></>
  ) : (
    <div className={computedClassName} style={style}>
      {state.isEnabled === true
        ? children
        : state.isLoading === true
        ? customLoadingNodes ?? <div className="mep-next-iubenda-loading">{t.consentAwareWrapper.loading}</div>
        : customConsentNotGrantedNodes ?? (
            <div className="mep-next-iubenda-consent-not-granted">
              {t.consentAwareWrapper.consentNotGranted}
              <button onClick={() => openPreferences()}>{t.consentAwareWrapper.openPreferencesButtonText}</button>
            </div>
          )}
    </div>
  );
};

export default ConsentAwareWrapper;
