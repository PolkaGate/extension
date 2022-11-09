// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Popup } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';

interface Props {
  showJoinPool: boolean;
  setShowJoinPool: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JoinPool({ setShowJoinPool, showJoinPool }: Props): React.ReactElement {
  const { t } = useTranslation();

  const backToStake = useCallback(() => {
    setShowJoinPool(false);
  }, [setShowJoinPool]);

  return (
    <Popup show={showJoinPool}>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <Typography
        fontSize='16px'
        fontWeight={500}
        sx={{
          borderBottom: '2px solid',
          borderBottomColor: 'secondary.main',
          m: '20px auto',
          width: '35%'
        }}
        textAlign='center'
      >
        {t<string>('Join Pool')}
      </Typography>
    </Popup>
  );
}
