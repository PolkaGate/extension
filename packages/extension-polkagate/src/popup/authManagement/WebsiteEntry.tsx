// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/handlers/State';

import { RecentActors as RecentActorsIcon, Replay as ReplayIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { RemoveAuth } from '../../components';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  authList: AuthUrls | null;
  filter: string | undefined;
  setDappInfo: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
  toRemove: string[];
  setToRemove: React.Dispatch<React.SetStateAction<string[]>>;
  maxHeight: number;
}

export default function WebsiteEntry({ authList, filter, maxHeight, setDappInfo, setToRemove, toRemove }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const hasAccess = useCallback((info: AuthUrlInfo) => Boolean(info?.authorizedAccounts?.length), []);

  const manageAuthorizedAccount = useCallback((info: AuthUrlInfo) => {
    setDappInfo(info);
  }, [setDappInfo]);

  const manageRemove = useCallback((url: string, removing: boolean) => {
    setToRemove(removing
      ? toRemove.filter((toRemoveUrl) => toRemoveUrl !== url) // remove from list
      : [...toRemove, url] // add to list
    );
  }, [setToRemove, toRemove]);

  return (
    <>
      {!authList || !Object.entries(authList)?.length
        ? <Grid alignItems='center' container item justifyContent='center' sx={{ height: '40px', textAlign: 'center' }}>
          {t('No website request yet!')}
        </Grid>
        : <Grid container item sx={{ '& :last-child': { borderBottom: 'none' }, maxHeight: { maxHeight }, overflow: 'scroll' }}>
          {Object.entries(authList)
            .filter(([url]: [string, AuthUrlInfo]) => url.includes(filter ?? ''))
            .map(([url, info]: [string, AuthUrlInfo]) => {
              const isAlreadyExist = !!toRemove.find((toRemoveUrl) => toRemoveUrl === url);

              return (
                <Grid container item key={url} sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
                  <Typography fontSize='14px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.light', lineHeight: '30px', overflowX: 'hidden', pl: '5px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '67%' }}>
                    {url}
                  </Typography>
                  <Grid alignItems='center' container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.light', lineHeight: '30px', width: '25%' }}>
                    {hasAccess(info) && `(${info.authorizedAccounts.length})`}
                    {hasAccess(info) && <RecentActorsIcon onClick={() => manageAuthorizedAccount(info)} sx={{ color: theme.palette.secondary.light, cursor: 'pointer', fontSize: '25px', ml: '5px' }} />}
                    {!hasAccess(info) &&
                      <Typography fontSize='14px' onClick={() => manageAuthorizedAccount(info)} sx={{ color: 'secondary.light', cursor: 'pointer', textDecoration: 'underline' }}>
                        {t('No access')}
                      </Typography>
                    }
                  </Grid>
                  <Grid alignItems='center' container item justifyContent='center' onClick={() => manageRemove(url, isAlreadyExist)} sx={{ width: '8%' }}>
                    {!isAlreadyExist && <RemoveAuth color={theme.palette.secondary.light} />}
                    {isAlreadyExist && <ReplayIcon style={{ color: theme.palette.secondary.light, cursor: 'pointer' }} />}
                  </Grid>
                </Grid>
              );
            }
            )}
        </Grid>
      }
    </>
  );
}
