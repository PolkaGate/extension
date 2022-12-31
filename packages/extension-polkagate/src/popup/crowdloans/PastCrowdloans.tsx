// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon, Language as LanguageIcon } from '@mui/icons-material';
import { Avatar, Divider, Grid, Link, Typography, useTheme } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, PButton, Progress, ShowBalance, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import getLogo from '../../util/getLogo';
import { getWebsiteFavico } from '../../util/utils';

interface Props {
  api?: ApiPromise;
  pastCrowdloans?: Crowdloan[] | null;
  chain?: Chain | null;
  contributedCrowdloans?: Map<string, Balance>;
  crowdloansId?: LinkOption[];
  decimal?: number;
  token?: string;
}

export default function PastCrowdloans({ api, chain, contributedCrowdloans, crowdloansId, decimal, pastCrowdloans, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const getName = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId]);
  const getHomePage = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansId]);
  const getInfo = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansId]);
  const logo = useCallback((crowdloan: Crowdloan) => getLogo(getInfo(crowdloan.fund.paraId)) || getWebsiteFavico(getHomePage(crowdloan.fund.paraId)), [getHomePage, getInfo]);
  const getMyContribution = useCallback((paraId: string) => contributedCrowdloans?.get(paraId) ?? '0', [contributedCrowdloans]);

  const ShowPastCrowdloan = ({ crowdloan, key }: { crowdloan: Crowdloan, key: number }) => (
    <Grid container direction='column' height='fit-content' item key={key} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', mt: '10px' }}>
      <Grid container height='46px' item lineHeight='46px'>
        <Grid alignItems='center' container item justifyContent='center' xs={1.5}>
          <Avatar
            src={logo(crowdloan)}
            sx={{ height: 20, width: 20 }}
          />
        </Grid>
        <Grid container item xs={8}>
          {getName(crowdloan.fund.paraId)
            ? <Grid container item>
              <Typography sx={{ fontSize: '16px', fontWeight: 500 }} lineHeight='47px' maxWidth={getHomePage(crowdloan.fund.paraId) ? '90%' : '100%'} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='fit-content'>
                {getName(crowdloan.fund.paraId)}
              </Typography>
              {getHomePage(crowdloan.fund.paraId) &&
                <Grid alignItems='center' container item justifyContent='center' lineHeight='15px' width='10%'>
                  <Link href={getHomePage(crowdloan.fund.paraId)} rel='noreferrer' target='_blank'>
                    <LanguageIcon sx={{ color: '#007CC4', fontSize: 17 }} />
                  </Link>
                </Grid>
              }
            </Grid>
            : <Identity address={crowdloan.fund.depositor} api={api} chain={chain} formatted={crowdloan.fund.depositor} identiconSize={15} noIdenticon style={{ fontSize: '16px', fontWeight: 500, lineHeight: '47px' }} />
          }
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light' }} xs={2.5}>
          <Typography fontSize='16px' fontWeight={400}>
            {crowdloan.fund.hasLeased ? t<string>('Winner') : t<string>('Ended')}
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction='column' item sx={{ display: 'block' }}>
        <Grid container item justifyContent='space-between' sx={{ borderBlock: '1px solid', borderColor: 'secondary.light' }}>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='fit-content'>
            {t<string>('ID')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='34px' pr='10px' width='fit-content'>
            {crowdloan.fund.paraId}
          </Typography>
        </Grid>
        <Grid container item justifyContent='space-between'>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='fit-content'>
            {t<string>('Lease')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='34px' pr='10px' width='fit-content'>
            {String(crowdloan.fund.firstPeriod)} - {String(crowdloan.fund.lastPeriod)}
          </Typography>
        </Grid>
        <Grid container item justifyContent='space-between' sx={{ borderBlock: '1px solid', borderColor: 'secondary.light' }}>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='fit-content'>
            {t<string>('End')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='34px' pr='10px' width='fit-content'>
            {crowdloan.fund.end}
          </Typography>
        </Grid>
        <Grid container item justifyContent='space-between'>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='40%'>
            {t<string>('Raised/Cap')}
          </Typography>
          <Grid container item justifyContent='flex-end' sx={{ fontSize: '14px', fontWeight: 400 }} width='60%'>
            <Grid item sx={{ '> div': { lineHeight: '34px' } }} width='fit-content'>
              <ShowBalance balance={crowdloan.fund.raised} decimal={decimal} decimalPoint={2} skeletonWidth={60} token={token} />
            </Grid>
            <Typography fontSize='18px' fontWeight={300} lineHeight='34px' px='2px' width='fit-content'>
              /
            </Typography>
            <Grid item sx={{ '> div': { lineHeight: '34px' }, pr: '10px' }} width='fit-content'>
              <ShowBalance balance={crowdloan.fund.cap} decimal={decimal} decimalPoint={2} skeletonWidth={60} token={token} />
            </Grid>
          </Grid>
        </Grid>
        <Grid container height='34px' item justifyContent='space-between' sx={{ borderTop: '1px solid', borderTopColor: 'secondary.light' }}>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='fit-content'>
            {t<string>('My Contribution')}
          </Typography>
          <Grid item sx={{ '> div': { lineHeight: '34px' }, fontSize: '14px', fontWeight: 400, pr: '10px' }} width='fit-content'>
            <ShowBalance balance={getMyContribution(crowdloan.fund.paraId)} decimal={decimal} decimalPoint={2} skeletonWidth={60} token={token} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <BouncingSubTitle label={t<string>('Past Crowdloans')} style={{ fontSize: '20px', fontWeight: 400 }} />
      <Grid container sx={{ '&::-webkit-scrollbar': { display: 'none', width: 0 }, height: window.innerHeight - 270, m: 'auto', overflow: 'scroll', scrollbarWidth: 'none', width: '92%' }}>
        {pastCrowdloans?.length
          ? pastCrowdloans.map((crowdloan, index) => (
            <ShowPastCrowdloan crowdloan={crowdloan} key={index} />
          ))
          : pastCrowdloans === null
            ? <Grid container height='15px' item justifyContent='center' mt='30px'>
              <Warning
                fontWeight={400}
                theme={theme}
              >
                {t<string>('No available ended crowdloan.')}
              </Warning>
            </Grid>
            : <Progress pt='95px' size={125} title={t('Loading ended crowdloans...')} />
        }
      </Grid>
    </>
  );
}
