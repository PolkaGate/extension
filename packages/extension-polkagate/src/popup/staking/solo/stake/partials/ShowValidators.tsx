// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { SlidePopUp } from '../../../../../components';
import { useDecimal, useToken, useTranslation } from '../../../../../hooks';
import { ValidatorInfo } from '../../../../../util/types';
import ValidatorsTable from '../../../partial/ValidatorsTable';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  selectedValidators: ValidatorInfo[];
  showSelectedValidators: boolean;
  setShowSelectedValidators: React.Dispatch<React.SetStateAction<boolean>>;
  staked?: BN;
}

export default function ShowValidators({ address, api, chain, selectedValidators, setShowSelectedValidators, showSelectedValidators, staked }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const token = useToken(address);
  const decimal = useDecimal(address);

  const tableHeight = useMemo(() => (selectedValidators.length > 7 ? window.innerHeight - 180 : selectedValidators.length * 60), [selectedValidators.length]);

  const onClose = useCallback(() => setShowSelectedValidators(false), [setShowSelectedValidators]);

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item ml='-15px' mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' mb='20px' mt='40px'>
        <Typography fontSize='20px' fontWeight={400} sx={{ textAlign: 'center', width: '100%' }}>
          {t<string>(`Selected Validator (${selectedValidators.length})`)}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      </Grid>
      <ValidatorsTable
        api={api}
        chain={chain}
        decimal={decimal}
        height={tableHeight}
        staked={staked}
        style={{ m: '15px auto', width: '92%' }}
        token={token}
        validatorsToList={selectedValidators}
      />
      <IconButton
        onClick={onClose}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={showSelectedValidators}>
      {page}
    </SlidePopUp>
  );
}
