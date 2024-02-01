// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';

import { Language as LanguageIcon } from '@mui/icons-material';
import { Avatar, Grid, Link, Typography } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';

import { FormatBalance2, Identity, PButton, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import getLogo from '../../../util/getLogo';
import { getWebsiteFavicon } from '../../../util/utils';
import blockToDate from './blockToDate';

interface Props {
  api?: ApiPromise;
  chain?: Chain | null;
  crowdloan: Crowdloan;
  showStatus?: boolean;
  key?: number;
  onContribute?: () => void;
  myContribution?: Balance | string;
  crowdloansId?: LinkOption[];
  decimal?: number;
  currentBlockNumber?: number;
  token?: string;
  setSelectedCrowdloan?: React.Dispatch<React.SetStateAction<Crowdloan | undefined>>;
  selectedCrowdloan?: Crowdloan;
}

export default function ShowCrowdloan({ selectedCrowdloan, api, chain, crowdloan, crowdloansId, currentBlockNumber, decimal, key, myContribution, onContribute, setSelectedCrowdloan, showStatus = false, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const paraId = crowdloan.fund.paraId;
  const name = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId, paraId]);
  const homePage = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansId, paraId]);
  const info = useMemo(() => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansId, paraId]);
  const logo = useMemo(() => getLogo(info) || getWebsiteFavicon(homePage), [homePage, info]);

  const [identity, returnIdentity] = useState<DeriveAccountRegistration>();

  const onContributeBtnClicked = useCallback(() => {
    if (!onContribute || !crowdloan || !setSelectedCrowdloan) {
      return;
    }

    setSelectedCrowdloan(crowdloan);
    onContribute();
  }, [crowdloan, onContribute, setSelectedCrowdloan]);

  useEffect(() => {
    if (selectedCrowdloan && selectedCrowdloan?.fund?.paraId === crowdloan.fund.paraId) {
      selectedCrowdloan.identity = selectedCrowdloan?.identity || identity;
    }
  }, [crowdloan.fund.paraId, identity, selectedCrowdloan, selectedCrowdloan?.fund?.paraId, selectedCrowdloan?.identity]);

  return (
    <Grid container direction='column' height='fit-content' item key={key} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', mt: '8px' }}>
      <Grid container height='46px' item lineHeight='46px'>
        <Grid alignItems='center' container item justifyContent='center' xs={1.5}>
          <Avatar
            src={logo || getWebsiteFavicon(identity?.web)}
            sx={{ height: 20, width: 20 }}
          />
        </Grid>
        <Grid container item xs={showStatus ? 8 : 10.5}>
          {name
            ? <Grid container item>
              <Typography fontSize='16px' fontWeight={400} lineHeight='47px' maxWidth={homePage ? '90%' : '100%'} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='fit-content'>
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
            : <Identity address={crowdloan.fund.depositor} api={api} chain={chain} formatted={crowdloan.fund.depositor} identiconSize={15} noIdenticon returnIdentity={returnIdentity} style={{ fontSize: '16px', fontWeight: 500, lineHeight: '46px', height: '46px' }} />
          }
        </Grid>
        {showStatus &&
          <Grid alignItems='center' container item justifyContent='center' sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light' }} xs={2.5}>
            <Typography fontSize='16px' fontWeight={400}>
              {crowdloan.fund.hasLeased ? t<string>('Winner') : t<string>('Ended')}
            </Typography>
          </Grid>
        }
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
            {blockToDate(crowdloan.fund.end, currentBlockNumber)}
          </Typography>
        </Grid>
        <Grid container item justifyContent='space-between'>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='39%'>
            {t<string>('Raised/Cap')}
          </Typography>
          <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400 }} width='61%'>
            <Grid item sx={{ '> div': { lineHeight: '34px' } }} width='fit-content'>
              <FormatBalance2 decimalPoint={2} decimals={[decimal]} tokens={[token]} value={crowdloan.fund.raised} />
            </Grid>
            <Typography fontSize='18px' fontWeight={300} lineHeight='34px' px='2px' width='fit-content'>
              /
            </Typography>
            <Grid item sx={{ '> div': { lineHeight: '34px' }, pr: '10px' }} width='fit-content'>
              <FormatBalance2 decimalPoint={2} decimals={[decimal]} tokens={[token]} value={crowdloan.fund.cap} />
            </Grid>
          </Grid>
        </Grid>
        <Grid container height='34px' item justifyContent='space-between' sx={{ borderTop: '1px solid', borderTopColor: 'secondary.light' }}>
          <Typography fontSize='16px' fontWeight={300} lineHeight='34px' pl='10px' width='fit-content'>
            {t<string>('My Contribution')}
          </Typography>
          <Grid item sx={{ '> div': { lineHeight: '34px' }, fontSize: '16px', fontWeight: 400, pr: '10px' }} width='fit-content'>
            <ShowBalance balance={myContribution} decimal={decimal} decimalPoint={2} skeletonWidth={60} token={token} />
          </Grid>
        </Grid>
      </Grid>
      {onContribute &&
        <Grid container item pb='15px'>
          <PButton
            _mt='10px'
            _onClick={onContributeBtnClicked}
            text={t<string>('Contribute')}
          />
        </Grid>
      }
    </Grid>
  );
}
