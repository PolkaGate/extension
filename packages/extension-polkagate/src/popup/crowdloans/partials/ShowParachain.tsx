// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Language as LanguageIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, Link, type SxProps, type Theme, Typography } from '@mui/material';
import type { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useState, useMemo } from 'react';

import type { DeriveAccountRegistration, DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { LinkOption } from '@polkagate/apps-config/endpoints/types';
import type { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../components';
import { useTranslation } from '../../../hooks';
import getLogo from '../../../util/getLogo';
import { getWebsiteFavicon } from '../../../util/utils';

interface Props {
  api?: ApiPromise;
  chain?: Chain | null;
  crowdloan: Crowdloan;
  crowdloansId?: LinkOption[];
  setShowCrowdloanInfo: React.Dispatch<React.SetStateAction<boolean>>;
  style?: SxProps<Theme>;
  labelPosition?: 'left' | 'right' | 'center';
}

export default function ShowParachain({ api, chain, crowdloan, crowdloansId, labelPosition = 'left', setShowCrowdloanInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();

  const paraId = crowdloan.fund.paraId;
  const name = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId, paraId]);
  const homePage = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansId, paraId]);
  const info = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansId, paraId]);
  const logo = useMemo(() => getLogo(info) || getWebsiteFavicon(homePage), [homePage, info]);

  const [identity, returnIdentity] = useState<DeriveAccountRegistration>();
  const accountInfo = crowdloan.identity && { identity: crowdloan.identity };

  const openCrowdloanInfo = useCallback(() => {
    setShowCrowdloanInfo(true);
  }, [setShowCrowdloanInfo]);

  return (
    <Grid container item sx={style}>
      <Typography textAlign={labelPosition} style={{ fontSize: '16px', fontWeight: 300 }} width='100%'>
        {t<string>('Parachain candidate')}
      </Typography>
      <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', height: '48px' }}>
        <Grid alignItems='center' container item justifyContent='center' xs={1.5}>
          <Avatar
            src={logo || getWebsiteFavicon(identity?.web)}
            sx={{ height: 25, width: 25 }}
          />
        </Grid>
        <Grid container item xs={9}>
          {name
            ? <Grid container item>
              <Typography fontSize='22px' fontWeight={400} lineHeight='47px' maxWidth={homePage ? '90%' : '100%'} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='fit-content'>
                {name}
              </Typography>
              {homePage &&
                <Grid alignItems='center' container item justifyContent='center' lineHeight='15px' width='10%'>
                  <Link href={homePage} rel='noreferrer' target='_blank'>
                    <LanguageIcon sx={{ color: '#007CC4', fontSize: 17 }} />
                  </Link>
                </Grid>
              }
            </Grid>
            : <Identity
              accountInfo={accountInfo as unknown as DeriveAccountInfo}
              address={crowdloan.fund.depositor}
              api={api}
              chain={chain as any}
              formatted={crowdloan.fund.depositor}
              noIdenticon
              returnIdentity={returnIdentity}
              style={{ fontSize: '22px', fontWeight: 400 }}
            />
          }
        </Grid>
        <Grid container item xs={1.5}>
          <IconButton
            onClick={openCrowdloanInfo}
            sx={{ p: 0 }}
          >
            <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
