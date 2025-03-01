// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SoloSettings, TxInfo } from '../../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { AccountWithProxyInConfirmation, ShortAddress } from '../../../../../components';
import { useAccountName, useTranslation } from '../../../../../hooks';
import getPayee from '../../stake/partials/util';

interface Props {
  txInfo: TxInfo;
  newSettings: SoloSettings
}

export default function TxDetail({ newSettings, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const controllerName = useAccountName(newSettings?.controllerId);
  const maybePayeeAddress = useMemo(() => getPayee(newSettings), [newSettings]);
  const destinationAccountName = useAccountName(maybePayeeAddress);

  return (
    <>
      <AccountWithProxyInConfirmation
        txInfo={txInfo}
      />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      {newSettings?.controllerId &&
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Controller account')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {controllerName || t('Unknown')}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress
              address={newSettings?.controllerId}
              inParentheses
              style={{ fontSize: '16px' }}
            />
          </Grid>
        </Grid>
      }
      {newSettings?.payee &&
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Rewards destination')}:
          </Typography>
          {maybePayeeAddress &&
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
              {destinationAccountName || t('Unknown')}
            </Typography>
          }
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            {maybePayeeAddress
              ? <ShortAddress address={maybePayeeAddress} inParentheses style={{ fontSize: '16px' }} />
              : <>{t('Add to staked amount')} </>
            }
          </Grid>
        </Grid>
      }
    </>
  );
}
