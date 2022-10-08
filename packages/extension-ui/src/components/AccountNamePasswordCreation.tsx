// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import PButton from '../../../extension-polkagate/src/components/PButton';
import ButtonWithCancel from '../../../extension-polkagate/src/components/ButtonWithCancel';
import { Name, Password } from '../partials';

interface Props {
  buttonLabel: string;
  isBusy?: boolean;
  onBackClick?: () => void;
  onCreate: (name: string, password: string) => void | Promise<void | boolean>;
  onNameChange: (name: string) => void;
  onPasswordChange?: (password: string) => void;
  withCancel?: boolean;
  mt?: string;
}

function AccountNamePasswordCreation({ withCancel = false, buttonLabel, isBusy, onBackClick, onCreate, onNameChange, onPasswordChange, mt }: Props): React.ReactElement<Props> {
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const _onCreate = useCallback(
    () => name && password && onCreate(name, password),
    [name, password, onCreate]
  );

  const _onNameChange = useCallback(
    (name: string | null) => {
      onNameChange(name || '');
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
        isFocused
        onChange={_onNameChange}
      />
      <Password onChange={_onPasswordChange} />
      { !withCancel &&
        <PButton
          _mt='78px'
          _onClick={_onCreate}
          _variant='contained'
          disabled={!password || !name}
          text={buttonLabel}
        />
      }
      { withCancel &&
        <ButtonWithCancel
          _mt={mt ?? '59px'}
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
