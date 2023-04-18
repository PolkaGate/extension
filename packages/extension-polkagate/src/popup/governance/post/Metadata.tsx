// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';
import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Identity, ShowBalance, ShowValue } from '../../../components';
import { useApi, useChain, useChainName, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { STATUS_COLOR } from '../utils/consts';
import { ReferendumPolkassambly } from '../utils/types';
import { toPascalCase, toTitleCase } from '../utils/util';

export function hexToAddress(_address: string | undefined): string | undefined {
  return _address && encodeAddress(hexToU8a(_address));
}

export default function Metadata({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address)
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  console.log('referendum?.beneficiary:', referendum?.proposed_call?.args?.beneficiary, hexToAddress(referendum?.proposed_call?.args?.beneficiary))

  const mayBeBeneficiary = hexToAddress(referendum?.proposed_call?.args?.beneficiary)

  return (
    <Accordion defaultExpanded sx={{ width: 'inherit', px: '2%' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: `1px solid ${theme.palette.action.disabledBackground}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Metadata')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container item xs={12}>
          <Grid alignItems='center' container item justifyContent='flex-start' spacing={2}>
            <Grid item xs={3}>
              <Typography fontSize={16} fontWeight={400}>
                {t('Proposer')}
              </Typography>
            </Grid>
            <Grid item>
              {/* <Identity
                api={api}
                chain={chain}
                formatted={referendum?.proposer}
                identiconSize={25}
                showSocial={false}
                style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }}
              /> */}
            </Grid>
            <Grid item sx={{ opacity: 0.6 }}>
              <ShowBalance
                balance={new BN(referendum?.submitted_amount)}
                decimal={decimal}
                decimalPoint={2}
                token={token}
              />
            </Grid>
          </Grid>
          {mayBeBeneficiary &&
            <Grid alignItems='center' container item>
              <Grid item xs={3}>
                <Typography fontSize={16} fontWeight={400}>
                  {t('Beneficiary')}
                </Typography>
              </Grid>
              <Grid item sx={{ mb: '10px' }}>
                <Identity
                  address={mayBeBeneficiary}
                  api={api}
                  chain={chain}
                  identiconSize={25}
                  showShortAddress
                  showSocial={false}
                  style={{ fontSize: '14px', fontWeight: 400, height: '38px', lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }}
                />
              </Grid>
              <Grid item sx={{ opacity: 0.6 }} >
                <ShowBalance
                  balance={new BN(referendum?.proposed_call?.args?.amount)}
                  decimal={decimal}
                  decimalPoint={2}
                  token={token}
                />
              </Grid>
            </Grid>
          }
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
