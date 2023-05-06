// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Button, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { CopyAddressButton, Identity, ShowBalance, Warning } from '../../../components';
import { useApi, useChain, useDecimal, useFormatted, usePreImage, useToken, useTranslation } from '../../../hooks';

interface Props {
  address: string | undefined;
  hash: string;
  key: number;
}

export function PreImage({ address, hash, key }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const formatted = useFormatted(address);
  const theme = useTheme();
  const preImage = usePreImage(address, hash);

  const call = useMemo(() =>
    preImage?.proposal && preImage.proposal.callIndex
      ? preImage.proposal.registry.findMetaCall(preImage.proposal.callIndex)
      : null
    , [preImage]);

  return (
    <Grid container>
      {preImage
        ? preImage?.deposit?.who === formatted &&
        <Grid alignItems='center' container item justifyContent='space-between'>
          <Grid container item sx={{ width: '134px' }} xs={2.2}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              {hash.substring(0, 8) + '...'}
            </Grid>
            <Grid item>
              <CopyAddressButton address={String(hash)} />
            </Grid>
          </Grid>
          <Grid fontSize='16px' fontWeight={400} item textAlign='left' xs={5.6}>
            {preImage?.proposalError
              ? <Warning
                iconDanger
                marginTop={0}
                theme={theme}
              >
                {preImage.proposalError}
              </Warning>
              : call && <Typography>
                {`${call.section}.${call.method}`}
              </Typography>
            }
          </Grid>
          <Grid item xs={1}>
            {preImage.proposalLength?.toNumber()}
          </Grid>
          <Grid item xs={1.5}>
            <ShowBalance balance={preImage.deposit.amount} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
          <Grid container item justifyContent='flex-end' xs={1.5}>
            {/* <Identity
              address={address}
              api={api}
              identiconSize={31}
              showSocial={false}
              style={{
                height: '38px',
                maxWidth: '100%',
                minWidth: '35%',
                width: 'fit-content',
                fontSize: '16px'
              }}
            /> */}
            <Button endIcon={<NavigateNextIcon sx={{ fontSize: '30px' }} />} sx={{ textTransform: 'none', color: 'primary.main', fontSize: '16px' }} variant='text'>
              {t('Select')}
            </Button>
          </Grid>
        </Grid>
        : <Skeleton height={20} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '100%', my: '5px' }} />
      }
    </Grid>
  );
}
