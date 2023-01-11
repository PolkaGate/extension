// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, useTheme } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback } from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Progress, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import ShowCrowdloan from './partials/ShowCrowdloans';

interface Props {
  api?: ApiPromise;
  pastCrowdloans?: Crowdloan[] | null;
  chain?: Chain | null;
  contributedCrowdloans?: Map<string, Balance>;
  crowdloansId?: LinkOption[];
  currentBlockNumber: number | undefined
  decimal?: number;
  token?: string;
}

export default function PastCrowdloans ({ api, chain, contributedCrowdloans, crowdloansId, currentBlockNumber, decimal, pastCrowdloans, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const getMyContribution = useCallback((paraId: string) => contributedCrowdloans?.get(paraId) ?? '0', [contributedCrowdloans]);

  return (
    <>
      <BouncingSubTitle label={t<string>('Past Crowdloans')} style={{ fontSize: '20px', fontWeight: 400 }} />
      <Grid container sx={{ height: window.innerHeight - 270, m: 'auto', overflow: 'scroll', width: '92%' }}>
        {pastCrowdloans?.length
          ? pastCrowdloans.map((crowdloan, index) => (
            <ShowCrowdloan
              api={api}
              chain={chain}
              crowdloan={crowdloan}
              crowdloansId={crowdloansId}
              currentBlockNumber={currentBlockNumber}
              decimal={decimal}
              key={index}
              myContribution={getMyContribution(crowdloan.fund.paraId)}
              showStatus
              token={token}
            />
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
