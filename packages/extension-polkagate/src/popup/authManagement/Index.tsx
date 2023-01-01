// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/handlers/State';

import { ActionContext, InputFilter, Label, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { getAuthList, removeAuthorization, toggleAuthorization } from '../../messaging';
import { HeaderBrand } from '../../partials';
import WebsiteEntry from './WebsiteEntry';

interface Props {
  className?: string;
}

export default function AuthManagement({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [authList, setAuthList] = useState<AuthUrls | null>(null);
  const [filter, setFilter] = useState('');
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  useEffect(() => {
    getAuthList()
      .then(({ list }) => setAuthList(list))
      .catch((e) => console.error(e));
  }, []);

  const _onChangeFilter = useCallback((filter: string) => {
    setFilter(filter);
  }, []);

  const toggleAuth = useCallback((url: string) => {
    toggleAuthorization(url)
      .then(({ list }) => setAuthList(list))
      .catch(console.error);
  }, []);

  const removeAuth = useCallback((url: string) => {
    removeAuthorization(url)
      .then(({ list }) => setAuthList(list))
      .catch(console.error);
  }, []);

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Manage Website Access')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='20px auto'
        width='90%'
      >
        {t<string>('Allow or deny website(s) to request access to the extension\'s visible accounts')}
      </Typography>
      <Grid item position='relative' px='15px' >
        <InputFilter
          label={t<string>('Search')}
          onChange={_onChangeFilter}
          placeholder={t<string>('www.example.com')}
          theme={theme}
          value={filter}
          withReset
        />
      </Grid>
      <Label
        label={t<string>('Websites')}
        style={{
          margin: '20px auto 0',
          width: '92%'
        }}
      >
        <Grid
          container
          direction='column'
          justifyContent='center'
          minHeight='38px'
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: '400',
            overflow: 'hidden'
          }}
        >
          {
            !authList || !Object.entries(authList)?.length
              ?
              <Grid alignItems='center' container item pl='10px' textAlign='left' xs={12}>
                {t<string>('No website request yet!')}
              </Grid>
              : <>
                {Object.entries(authList)
                  .filter(([url]: [string, AuthUrlInfo]) => url.includes(filter))
                  .map(
                    ([url, info]: [string, AuthUrlInfo]) =>
                      <WebsiteEntry
                        info={info}
                        key={url}
                        removeAuth={removeAuth}
                        toggleAuth={toggleAuth}
                        url={url}
                      />
                  )}
              </>
          }
        </Grid>
      </Label>
      <PButton
        _onClick={_onBackClick}
        text={t<string>('Back')}
      />
    </>
  );
}
