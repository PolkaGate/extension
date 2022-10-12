// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { IButton, InputWithLabel } from '../../components';
import { useTranslation } from '../../hooks';

interface Props {
  className?: string;
  defaultPath: string;
  isError: boolean;
  onChange: (suri: string) => void;
  parentAddress: string;
  parentPassword: string;
  withSoftPath: boolean;
}

function DerivationPath({ className, defaultPath, isError, onChange, withSoftPath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [path, setPath] = useState<string>(defaultPath);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setPath(defaultPath);
  }, [defaultPath]);

  const _onExpand = useCallback(() => setIsDisabled(!isDisabled), [isDisabled]);

  const _onChange = useCallback((newPath: string): void => {
    setPath(newPath);
    onChange(newPath);
  }, [onChange]);

  return (
    <div className={className}>
      <div className='container'>
        <div className={`pathInput ${isDisabled ? 'locked' : ''}`}>
          <InputWithLabel
            data-input-suri
            disabled={isDisabled}
            isError={isError || !path}
            label={
              isDisabled
                ? t('Derivation Path (unlock to edit)')
                : t('Derivation Path')
            }
            onChange={_onChange}
            placeholder={withSoftPath
              ? t<string>('//hard/soft')
              : t<string>('//hard')
            }
            value={path}
          />
        </div>
        <IButton
          className='lockButton'
          onClick={_onExpand}
        >
          <FontAwesomeIcon
            className='lockIcon'
            color='#BA2882'
            fontSize={20}
            icon={isDisabled ? faLock : faLockOpen}
          />
        </IButton>
      </div>
    </div>
  );
}

export default React.memo(styled(DerivationPath)(({ theme }: Props) => `
  margin-top: 22px;
  > .container {
    display: flex;
    flex-direction: row;
  }

  .lockButton {
    background: none;
    height: 25px;
    margin: 25px 2px 0 10px;
    padding: 3px;
    width: 23px;

    &:not(:disabled):hover {
      background: none;
    }

    &:active, &:focus {
      outline: none;
    }

    &::-moz-focus-inner {
      border: 0;
    }
  }

  .pathInput {
    width: 100%;

    &.locked input {
      opacity: 50%;
    }
  }
`));
