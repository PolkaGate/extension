// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../../fullscreen/nft/utils/types';

import { Grid, type SxProps,Typography } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { ShowBalance } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { amountToMachine } from '../../util/utils';

function NftPrice ({ nft, style = {} }: { nft: ItemInformation, style?:SxProps}) {
  const { t } = useTranslation();
  const { genesisHash, price } = nft;
  const { decimal, token } = useChainInfo(genesisHash);

  const convertedAmount = useMemo(() => price && decimal ? price / (10 ** decimal) : null, [decimal, price]);

  const priceAsBN = useMemo(() => convertedAmount ? amountToMachine(String(convertedAmount), decimal) : null, [convertedAmount, decimal]);
  const notListed = price === null;

  return (
    <Grid alignItems='center' container item sx={{...style}}>
      {price &&
        <ShowBalance
          balance={priceAsBN}
          decimal={decimal}
          decimalPoint={3}
          token={token}
          withCurrency
        />
      }
      {notListed &&
        <Typography fontSize='14px' fontWeight={500} textAlign='left'>
          {t('Not listed')}
        </Typography>
      }
    </Grid>
  );
}

export default memo(NftPrice);
