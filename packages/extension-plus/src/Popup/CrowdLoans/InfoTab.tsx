// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/** 
 * @description
 *  this component show information about current account contributions
 * */

// eslint-disable-next-line simple-import-sort/imports
import type { ThemeProps } from '../../../../extension-ui/src/types';

import { Divider, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Balance } from '@polkadot/types/interfaces';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { Auction, ChainInfo } from '../../util/plusTypes';
import { ShowValue, ShowBalance } from '../../components';

interface Props extends ThemeProps {
  className?: string;
  auction: Auction;
  chainInfo: ChainInfo;
  endpoints: LinkOption[];
  myContributions: Map<string, Balance> | undefined;

}

function InfoTab({ auction, chainInfo, className, endpoints, myContributions }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [allContributionAmount, setAllContributionamount] = useState<Balance | undefined>();
  const [contributedParachains, setContributedParachains] = useState<string | undefined>();
  const [totalCrowdloans, setTotalCrowdloans] = useState<number | undefined>();

  useEffect(() => {
    setTotalCrowdloans(myContributions?.size);
    const contributions = myContributions?.entries();
    let contribution = contributions?.next();
    let crowLoansCount = 0;
    let contributedAmount = chainInfo.api.createType('Balance', 0);

    while (contribution?.value) {
      contributedAmount = contributedAmount.add(contribution.value[1] as Balance);
      contribution.value[1].toHuman() !== '0' && crowLoansCount++;
      contribution = contributions?.next();
    };

    setContributedParachains(crowLoansCount.toString());
    setAllContributionamount(contributedAmount);
  }, [chainInfo.api, myContributions]);

  return (
    <Grid container sx={{ p: '50px 60px' }}>

      <Grid container item justifyContent='space-between' sx={{ fontSize: 13, fontWeight: 'Bold', paddingBottom: '5px' }} xs={12}>
        <Grid item>
          {t('Contributed parachains')}
        </Grid>
        <Grid item>
          <ShowValue value={contributedParachains} />
        </Grid>
      </Grid>

      <Grid container item justifyContent='space-between' sx={{ fontSize: 13, fontWeight: 'Bold', paddingBottom: '5px' }} xs={12}>
        <Grid item>
          {t('Your contributed')}
        </Grid>
        <Grid item>
          <ShowBalance balance={allContributionAmount} chainInfo={chainInfo} />
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ py: 2 }}>
        <Divider light />
      </Grid>

      <Grid container item justifyContent='space-between' sx={{ fontSize: 13, paddingBottom: '5px' }} xs={12}>
        <Grid item>
          {t('Total crowdloans')}
        </Grid>
        <Grid item>
          <ShowValue value={totalCrowdloans} />
        </Grid>
      </Grid>

      <Grid container item justifyContent='space-between' sx={{ fontSize: 13, paddingBottom: '5px' }} xs={12}>
        <Grid item>
          {t('Total parachains')}
        </Grid>
        <Grid item>
          <ShowValue value={auction.auctionCounter - 1} />
        </Grid>
      </Grid>

    </Grid >
  );
}

export default styled(InfoTab)`
        height: calc(100vh - 2px);
        overflow: auto;
        scrollbar - width: none;

        &:: -webkit - scrollbar {
          display: none;
        width:0,
       }
        .empty-list {
          text - align: center;
  }`;
