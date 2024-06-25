// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { CSSProperties } from '@mui/styled-engine';
import React, { useCallback, useState } from 'react';

import { Name, Passwords } from '../partials';
import ButtonWithCancel from './ButtonWithCancel';
import PButton from './PButton';

interface Props {
  buttonLabel: string;
  isBusy?: boolean;
  onBackClick?: () => void;
  onCreate: (name: string, password: string) => void | Promise<void | boolean>;
  onNameChange?: (name: string) => void;
  onPasswordChange?: (password: string) => void;
  withCancel?: boolean;
  mt?: string;
  style?: CSSProperties | undefined;
  nameLabel?: string;
  passwordLabel?: string;
  isFocused?: boolean;
}

function AccountNamePasswordCreation({ buttonLabel, isBusy, mt, onBackClick, onCreate, onNameChange, onPasswordChange, withCancel = false, style = {}, nameLabel, isFocused = true, passwordLabel }: Props): React.ReactElement<Props> {
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const _onCreate = useCallback(
    () => name && password && onCreate(name, password),
    [name, password, onCreate]
  );

  const _onNameChange = useCallback(
    (name: string | null) => {
      onNameChange && onNameChange(name || '');
      setName(name);
    },
    [onNameChange]
  );

  const _onPasswordChange = useCallback(
    (password: string | null) => {
      onPasswordChange && onPasswordChange(password || '');
      setPassword(password);
    },
    [onPasswordChange]
  );

  const _onBackClick = useCallback(
    () => {
      _onNameChange(null);
      setPassword(null);
      onBackClick && onBackClick();
    },
    [_onNameChange, onBackClick]
  );

  return (
    <>
      <Name
        isFocused={isFocused}
        label={nameLabel}
        onChange={_onNameChange}
        style={style}
      />
      <Passwords
        label={passwordLabel}
        onChange={_onPasswordChange}
        onEnter={_onCreate}
        style={style}
      />
      {!withCancel &&
        <PButton
          _isBusy={isBusy}
          _mt={mt}
          _onClick={_onCreate}
          _variant='contained'
          disabled={!password || !name}
          text={buttonLabel}
        />
      }
      {withCancel &&
        <ButtonWithCancel
          _isBusy={isBusy}
          _mt={mt}
          _onClick={_onCreate}
          _onClickCancel={_onBackClick}
          disabled={!password || !name}
          text={buttonLabel}
        />
      }
    </>
  );
}

export default React.memo(AccountNamePasswordCreation);
