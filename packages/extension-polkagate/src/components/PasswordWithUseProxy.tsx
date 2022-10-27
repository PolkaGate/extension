// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { useProxies, useTranslation } from '../hooks';
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
}

export default function PasswordWithUseProxy({ api, defaultValue, disabled, genesisHash, isError, isFocused, isReadOnly, label = '', onChange, onEnter, placeholder, proxiedAddress, withoutMargin }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const { pathname } = useLocation();
  const proxies = useProxies(api, proxiedAddress);
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
      proxiedAddress && history.push({
        pathname: `/selectProxy/${proxiedAddress}/${genesisHash}`,
        state: { pathname, proxies }
      });
    }, [genesisHash, history, pathname, proxiedAddress, proxies]
  );

  useEffect(() => {
    onChange(password, isPasswordError);
  }, [password, isPasswordError, onChange]);

  return (
    <Grid container>
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
      {!!proxies?.length &&
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
