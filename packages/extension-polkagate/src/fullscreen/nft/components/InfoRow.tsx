// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DetailProp } from '../utils/types';

import { Divider, Grid, Link, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

import { Identity, ShortAddress, ShowBalance } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { amountToMachine } from '../../../util/utils';

function InfoRow({ accountId, api, chain, divider = true, inline = true, isThumbnail, link, linkName, price, text, title }: DetailProp): React.ReactElement {
  const { t } = useTranslation();
  const decimal = api?.registry.chainDecimals[0];
  const token = api?.registry.chainTokens[0];

  const convertedAmount = useMemo(() => price && decimal ? price / (10 ** decimal) : null, [decimal, price]);

  const priceAsBN = useMemo(() => convertedAmount ? amountToMachine(String(convertedAmount), decimal) : null, [convertedAmount, decimal]);
  const notListed = price === null;
  const isDescription = !title;

  return (
    <Grid container item justifyContent='space-between'>
      {divider && !isThumbnail &&
        <Divider sx={{ bgcolor: 'divider', height: '1px', m: '8px auto', width: '100%' }} />
      }
      {title &&
        <Typography fontSize={isThumbnail ? '13px' : '14px'} fontWeight={400} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
          {title}:
        </Typography>
      }
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
      {text &&
        <Typography fontSize='14px' fontWeight={isDescription ? 400 : 500} sx={{ '> p': { m: 0 } }} textAlign='justify'>
          <ReactMarkdown
            linkTarget='_blank'
          >
            {String(text)}
          </ReactMarkdown>
        </Typography>
      }
      {accountId &&
        <>
          {api && chain
            ? <Identity
              api={api}
              chain={chain}
              formatted={accountId}
              identiconSize={15}
              showShortAddress
              style={{ fontSize: '14px', fontWeight: 500, maxWidth: '200px' }}
            />
            : <ShortAddress
              address={accountId}
              charsCount={6}
              style={{ fontSize: '14px', fontWeight: 500, width: 'fit-content' }}
            />
          }
        </>
      }
      {link &&
        <Link
          href={link}
          target='_blank'
          underline='hover'
        >
          {linkName}
        </Link>
      }
    </Grid>
  );
}

export default React.memo(InfoRow);
