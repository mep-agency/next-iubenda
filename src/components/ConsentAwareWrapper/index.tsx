'use client';

import styles from './styles.module.scss';

import { CSSProperties, ReactNode, useEffect, useReducer, useState } from 'react';

import { IubendaContext, useIubenda } from '../../contexts/IubendaContext';

const DEFAULT_WRAPPER_CLASS = 'mep-next-iubenda-wrapper';

type RequiredGdprPurposes = (keyof IubendaContext['userPreferences']['gdprPurposes'])[];

interface Props {
  className?: string;
  useDefaultStyles?: boolean;
  requiredGdprPurposes: RequiredGdprPurposes;
  customLoadingNodes?: ReactNode;
  customConsentNotGrantedNodes?: ReactNode;
  style?: CSSProperties;
  children: ReactNode;
}

interface StateInterface {
  isLoading: boolean;
  isEnabled: boolean;
  requiredGdprPurposes: RequiredGdprPurposes;
}

interface UpdateRequiredGdprPurposesActionInterface {
  type: 'update_required_purposes';
  requiredGdprPurposes: RequiredGdprPurposes;
}

interface UpdateConsentActionInterface {
  type: 'update_consent';
  consent: IubendaContext['userPreferences'];
}

type Action = UpdateRequiredGdprPurposesActionInterface | UpdateConsentActionInterface;

const initialState: StateInterface = {
  isLoading: true,
  isEnabled: false,
  requiredGdprPurposes: [],
};

const reducer = (state: StateInterface, action: Action): StateInterface => {
  switch (action.type) {
    case 'update_required_purposes':
      return {
        ...state,
        requiredGdprPurposes: action.requiredGdprPurposes,
      };
    case 'update_consent':
      return {
        ...state,
        isLoading: false,
        isEnabled: state.requiredGdprPurposes.reduce(
          (isEnabled, purposeName) => isEnabled && action.consent.gdprPurposes[purposeName],
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
  requiredGdprPurposes,
  customLoadingNodes,
  customConsentNotGrantedNodes,
  style,
  children,
}: Props) => {
  const { userPreferences: consent, openPreferences, i18nDictionary: t } = useIubenda();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [computedClassName, setComputedClassName] = useState<string>();

  useEffect(() => {
    if (requiredGdprPurposes.length < 1) {
      throw new Error('Required purposes array cannot be empty!');
    }

    dispatch({
      type: 'update_required_purposes',
      requiredGdprPurposes: requiredGdprPurposes,
    });
  }, [requiredGdprPurposes]);

  useEffect(() => {
    if (consent.hasBeenLoaded === true) {
      dispatch({
        type: 'update_consent',
        consent,
      });
    }
  }, [consent, state.requiredGdprPurposes]);

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
