// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Language as LanguageIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, Link, SxProps, Theme, Typography } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useMemo } from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';

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
  brief?: boolean;
}

export default function ShowParachainBrief({ api, chain, crowdloan, crowdloansId, setShowCrowdloanInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const paraId = crowdloan.fund.paraId;
  const name = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string ?? crowdloan?.identity?.display), [crowdloan?.identity?.display, crowdloansId, paraId]);
  const homePage = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansId, paraId]);
  const info = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansId, paraId]);
  const logo = useMemo(() => getLogo(info) || getWebsiteFavicon(homePage), [homePage, info]);

  const openCrowdloanInfo = useCallback(() => {
    setShowCrowdloanInfo(true);
  }, [setShowCrowdloanInfo]);

  return (
    <Grid container item sx={style}>
      <Typography textAlign='center' width='100%'>
        {t<string>('Parachain candidate')}
      </Typography>
      <Grid justifyContent='center' container item sx={{ height: '48px' }}>
        <Grid alignItems='center' container item justifyContent='center' width='15%'>
          <Avatar
            src={logo || getWebsiteFavicon(crowdloan?.identity?.web)}
            sx={{ height: 25, width: 25 }}
          />
        </Grid>
        <Grid container item maxWidth='75%' width='fit-content'>
          <Grid container item>
            <Typography fontSize='22px' fontWeight={400} lineHeight='47px' maxWidth={homePage ? '90%' : '100%'} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='fit-content'>
              {name ?? 'Unknown'}
            </Typography>
            {homePage &&
              <Grid alignItems='center' container item justifyContent='center' lineHeight='15px' width='10%'>
                <Link href={homePage} rel='noreferrer' target='_blank'>
                  <LanguageIcon sx={{ color: '#007CC4', fontSize: 17 }} />
                </Link>
              </Grid>
            }
          </Grid>
        </Grid>
        <Grid container item width='10%'>
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
