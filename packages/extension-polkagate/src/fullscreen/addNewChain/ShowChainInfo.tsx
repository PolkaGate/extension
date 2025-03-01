// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { HexString } from '@polkadot/util/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useEffect, useState } from 'react';

import { Label } from '../../components';
import FormatPrice from '../../components/FormatPrice';
import { useTranslation } from '../../hooks';
import { toTitleCase } from '../governance/utils/util';

interface Props {
  metadata?: MetadataDef | undefined | null;
  price: number | null | undefined
  style?: SxProps<Theme> | undefined;
}

interface SelectedChainInfo {
  color?: string | undefined;
  chain: string;
  genesisHash: HexString;
  icon?: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum'
  specVersion: number;
  decimal: number;
  symbol: string;
  types?: Record<string, Record<string, string> | string>;
  metaCalls?: string;
  // userExtensions?: ExtDef;
}

const TOKEN_PRICE_KEY = 'tokenPrice';

export default function ShowChainInfo({ metadata, price, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedChainInfo, setSelectedChainInfo] = useState<SelectedChainInfo | undefined>();

  useEffect(() => {
    if (!metadata) {
      return;
    }

    const info = {
      chain: metadata.chain,
      symbol: metadata?.tokenSymbol,
      decimal: metadata?.tokenDecimals,
      type: metadata?.chainType,
      genesisHash: metadata?.genesisHash,
      specVersion: metadata?.specVersion,
      ss58Format: metadata?.ss58Format,
      [TOKEN_PRICE_KEY]: price
    };

    setSelectedChainInfo(info);
  }, [metadata, price]);

  const LINE_HEIGHT = 25;
  const MAX_HEIGHT = selectedChainInfo ? (Object.keys(selectedChainInfo).length + 2) * LINE_HEIGHT : undefined;

  return (
    <Grid sx={{ ...style }}>
      <Label label={t('Chain Information')}>
        <Grid container sx={{ bgcolor: 'background.paper', borderRadius: '5px', maxHeight: `${MAX_HEIGHT}px`, minHeight: '38px', overflow: 'scroll', position: 'relative' }}>
          {selectedChainInfo
            ? <Grid container item>
              <Grid display='block' item sx={{ borderRight: '1px solid', borderRightColor: theme.palette.divider, p: '10px' }} xs={3}>
                {Object.keys(selectedChainInfo).map((key) => (
                  <Typography fontSize='16px' fontWeight={400} height={`${LINE_HEIGHT}px`} key={key}>
                    {toTitleCase(key)}
                  </Typography>
                ))}
              </Grid>
              <Grid display='block' item p='10px 10px 20px' xs>
                {selectedChainInfo &&
                  Object.entries(selectedChainInfo).map(([key, value]) => (
                    <Typography fontSize='14px' fontWeight={300} height={`${LINE_HEIGHT}px`} key={key}>
                      {key === TOKEN_PRICE_KEY
                        ? <FormatPrice
                          decimalPoint={4}
                          fontSize='14px'
                          fontWeight={300}
                          num={(value || 0) as number}
                        />
                        : value ?? '--- ---'
                      }
                    </Typography>
                  ))}
              </Grid>
            </Grid>
            : metadata === null &&
            <Grid alignItems='center' container display='inline-flex' justifyContent='center'>
              <FontAwesomeIcon
                className='warningImage'
                icon={faExclamationTriangle}
              />
              <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                {t('No information found from this RPC node!')}
              </Typography>
            </Grid>
          }
          {metadata?.color &&
            <Box
              sx={{
                '&::before': {
                  borderBottom: `20px solid ${metadata.color}`,
                  borderBottomLeftRadius: '20%',
                  borderRight: '20px solid transparent',
                  bottom: 0,
                  content: '""',
                  height: 0,
                  left: 0,
                  position: 'absolute',
                  width: 0
                },
                bottom: 0,
                left: 0,
                position: 'absolute'
              }}
            />}
        </Grid>
      </Label>
    </Grid>
  );
}
