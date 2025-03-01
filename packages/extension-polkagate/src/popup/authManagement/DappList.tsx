// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/handlers/State';

import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { Label } from '../../components';
import { useTranslation } from '../../components/translate';
import { getAuthList } from '../../messaging';
import WebsiteEntry from './WebsiteEntry';

interface Props {
  filter: string | undefined;
  setDappInfo: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
  toRemove: string[];
  setToRemove: React.Dispatch<React.SetStateAction<string[]>>;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  maxHeight: number;
}

export default function DappList({ filter, maxHeight, refresh, setDappInfo, setRefresh, setToRemove, toRemove }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [authList, setAuthList] = useState<AuthUrls | null>(null);

  useEffect(() => {
    getAuthList()
      .then(({ list }) => {
        setAuthList(list as AuthUrls);
        setRefresh(false);
      })
      .catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]); // to ignore setRefresh

  return (
    <Label
      label={t('Websites')}
      style={{
        margin: '20px auto 0',
        width: '92%'
      }}
    >
      <Grid container direction='column' justifyContent='center' minHeight='38px' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '12px', fontWeight: '400' }}>
        <Grid container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
          <Typography fontSize='14px' fontWeight={400} sx={{ borderRight: '1px solid', borderRightColor: 'secondary.light', lineHeight: '30px' }} textAlign='center' width='67%'>
            {t('Origin')}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} sx={{ borderRight: '1px solid', borderRightColor: 'secondary.light', lineHeight: '30px' }} textAlign='center' width='25%'>
            {t('Access')}
          </Typography>
          <Typography fontSize='14px' fontWeight={500} lineHeight='30px' textAlign='center' width='8%'>
            {'X'}
          </Typography>
        </Grid>
        <WebsiteEntry
          authList={authList}
          filter={filter}
          maxHeight={maxHeight}
          setDappInfo={setDappInfo}
          setToRemove={setToRemove}
          toRemove={toRemove}
        />
      </Grid>
    </Label>
  );
}
