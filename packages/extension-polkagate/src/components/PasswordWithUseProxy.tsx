// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { useTranslation } from '../hooks';
import { Proxy } from '../util/types';
import { Password } from './';

interface Props {
  api: ApiPromise | undefined;
  proxiedAddress: string | undefined | null;
  defaultValue?: string | null;
  disabled?: boolean;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onChange: (password: string | undefined, isPasswordError: boolean) => void;
  onEnter?: () => void;
  placeholder?: string;
  value?: string;
  withoutMargin?: boolean;
  genesisHash: string;
  prevState?: Record<string, any>;
  proxyTypeFilter?: string[];
  style?: SxProps<Theme>;
  setShowSelectProxy: React.Dispatch<React.SetStateAction<boolean>>;
  proxies: Proxy[] | undefined
}

export default function PasswordWithUseProxy({ defaultValue, disabled, isError, isFocused, isReadOnly, label = '', onChange, onEnter, placeholder, prevState, proxies, setShowSelectProxy, style, withoutMargin }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState(false);

  const _onChange = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const goToSelectProxy = useCallback(
    (): void => {
      setShowSelectProxy(true);
      // proxies, proxyTypeFilter }
    }, [setShowSelectProxy]
  );

  useEffect(() => {
    onChange(password, isPasswordError);
  }, [password, isPasswordError, onChange]);

  return (
    <Grid container sx={{ ...style }}>
      <Grid
        item
        xs={proxies?.length ? 9 : 12}
      >
        <Password
          defaultValue={defaultValue}
          disabled={disabled}
          isError={isError}
          isFocused={isFocused}
          isReadOnly={isReadOnly}
          label={label}
          onChange={_onChange}
          onEnter={onEnter}
          placeholder={placeholder}
          withoutMargin={withoutMargin}
        />
      </Grid>
      {(!!proxies?.length || prevState?.selectedProxyAddress) &&
        <Grid
          item
          onClick={goToSelectProxy}
          pl='10px'
          pt='25px'
          sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}
        >
          {t('Use proxy')}
        </Grid>
      }
    </Grid>
  );
}
