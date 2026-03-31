// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../../fullscreen/nft/utils/types';

import { Grid, Stack, type SxProps, Typography } from '@mui/material';
import React, { memo, useMemo } from 'react';

import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/resolveLogoInfo';

import { Logo, DisplayBalance } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { amountToMachine } from '../../util';

function NftPrice({ nft, style = {} }: { nft: ItemInformation, style?: SxProps }) {
  const { t } = useTranslation();
  const { genesisHash, price } = nft;
  const { decimal, token } = useChainInfo(genesisHash, true);

  const convertedAmount = useMemo(() => price && decimal ? price / (10 ** decimal) : null, [decimal, price]);

  const priceAsBN = useMemo(() => convertedAmount ? amountToMachine(String(convertedAmount), decimal) : null, [convertedAmount, decimal]);
  const notListed = price === null;
  const logoInfo = useMemo(() => resolveLogoInfo(genesisHash, token), [genesisHash, token]);

  return (
    <Grid alignItems='center' container item sx={{ ...style }}>
      {price &&
        <Stack alignItems='center' columnGap='2px' direction='row'>
          <Logo assetSize='12px' baseTokenSize='24px' genesisHash={genesisHash} logo={logoInfo?.logo} />
          <DisplayBalance
            balance={priceAsBN}
            decimal={decimal}
            decimalPoint={3}
            token={token}
            withCurrency={false}
          />
        </Stack>
      }
      {notListed &&
        <Typography textAlign='left' variant='B-1'>
          {t('Not listed')}
        </Typography>
      }
    </Grid>
  );
}

export default memo(NftPrice);
