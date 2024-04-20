// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { Balance } from '@polkadot/types/interfaces';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';
import { useInfo, useNativeTokenPrice } from '@polkadot/extension-polkagate/src/hooks';
import { DATE_OPTIONS } from '@polkadot/extension-polkagate/src/util/constants';
import { noop } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { FormatPrice, ShowBalance } from '../../../components';

interface DisplayBalanceProps {
  address: string;
  amount: BN | Balance | undefined;
  title: string;
  onClicks?: (() => void)[];
  icons?: IconDefinition[];
  actions?: string[];
  isUnstaking?: boolean;
  toBeReleased?: {
    date: number;
    amount: BN;
  }[] | undefined;
  marginTop?: string;
}

export default function DisplayBalance ({ actions, address, amount, icons, isUnstaking, marginTop = '10px', onClicks, title, toBeReleased }: DisplayBalanceProps): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const price = useNativeTokenPrice(address);

  const { decimal, token } = useInfo(address);
  const [showUnstaking, setShowUnstaking] = useState<boolean>(false);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);

  const toggleShowUnstaking = useCallback(() => {
    toBeReleased?.length && setShowUnstaking(!showUnstaking);
  }, [showUnstaking, toBeReleased?.length]);

  const ToBeReleased = () => (
    <Collapse in={showUnstaking} sx={{ width: '100%' }}>
      <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'divider', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '10px', width: '93%' }}>
        <Grid item pt='10px' xs={12}>
          {t('To be released')}
        </Grid>
        {toBeReleased?.map(({ amount, date }) => (
          <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
            <Grid fontWeight={300} item>
              {new Date(date).toLocaleDateString(undefined, DATE_OPTIONS)}
            </Grid>
            <Grid fontWeight={400} item>
              <ShowBalance balance={amount} decimal={decimal} token={token} />
            </Grid>
          </Grid>))
        }
      </Grid>
    </Collapse>
  );

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', mt: { marginTop }, p: '5px 30px' }}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ minHeight: '67px' }}>
        <Typography fontSize='18px' fontWeight={400} width='25%'>
          {title}
        </Typography>
        <Grid alignItems='center' container item width='37%'>
          <Grid item sx={{ fontSize: '22px', fontWeight: 600 }}>
            <ShowBalance
              balance={amount}
              decimal={decimal}
              decimalPoint={3}
              token={token}
              withCurrency
            />
          </Grid>
          <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '35px', mx: '10px', my: 'auto' }} />
          <Grid item sx={{ '> div span': { display: 'block' }, fontSize: '22px', fontWeight: 400 }}>
            <FormatPrice
              amount={amount}
              decimals={decimal}
              price={price}
              skeletonHeight={20}
            />
          </Grid>
        </Grid>
        <Grid container item justifyContent='flex-end' width='38%'>
          {isUnstaking &&
          <ArrowForwardIosRoundedIcon
            onClick={toggleShowUnstaking}
            sx={{
              color: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',
              cursor: 'pointer',
              fontSize: '26px',
              m: '2% 18% 0 0',
              stroke: !toBeReleased?.length ? theme.palette.text.disabled : theme.palette.secondary.light,
              strokeWidth: 1,
              transform: toBeReleased?.length && showUnstaking ? 'rotate(-90deg)' : 'rotate(90deg)',
              transitionDuration: '0.3s',
              transitionProperty: 'transform'
            }}
          />
          }
          {icons?.map((_, index) => {
            const noValueToAct = !amount || amount?.isZero();

            return (actions &&
            <Grid alignItems='center' container direction='column' item justifyContent='center' key={index} minWidth='96px' onClick={noValueToAct ? noop : onClicks && onClicks[index]} sx={{ cursor: 'pointer', mx: '10px', width: 'inherit' }}>
              <FontAwesomeIcon
                color={`${noValueToAct ? theme.palette.text.disabled : theme.palette.secondary.light}`}
                icon={icons[index]}
                style={{ height: '30px', marginBottom: '-4px', stroke: `${theme.palette.text.primary}`, strokeWidth: 5, width: '20px' }}
              />
              <Typography color={noValueToAct ? theme.palette.text.disabled : theme.palette.secondary.light} fontSize='18px' fontWeight={400} textAlign='center'>
                {actions[index]}
              </Typography>
            </Grid>
            );
          }
          )
          }
        </Grid>
      </Grid>
      {showUnstaking &&
      <ToBeReleased />
      }
    </Grid>
  );
}
