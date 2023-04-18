// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Identity, ShowBalance } from '../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { ReferendumPolkassambly } from '../utils/types';
import { pascalCaseToTitleCase } from '../utils/util';

export function hexAddressToFormatted(hexString: string, chain: Chain | undefined): string | undefined {
  if (!chain || !hexString) {
    return undefined;
  }

  const decodedBytes = decodeAddress(hexString);

  return encodeAddress(decodedBytes, chain.ss58Format);

}

export default function Metadata({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const mayBeBeneficiary = hexAddressToFormatted(referendum?.proposed_call?.args?.beneficiary, chain);

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '16px', mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Metadata')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Grid container item xs={12}>
          <LabelValue
            label={t('Origin')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={pascalCaseToTitleCase(referendum?.origin)}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Proposer')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '40px', justifyContent: 'flex-start' }}
            value={
              <Identity
                api={api}
                chain={chain}
                formatted={referendum?.proposer}
                identiconSize={25}
                showSocial
                style={{ fontSize: '16px', fontWeight: 500, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }}
              />
            }
          />
          <LabelValue
            label={t('Submission Amount')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={<ShowBalance
              balance={new BN(referendum?.submitted_amount)}
              decimal={decimal}
              decimalPoint={2}
              token={token}
            />}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Decision Deposit')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={<ShowBalance
              balance={new BN(referendum?.decision_deposit_amount)}
              decimal={decimal}
              decimalPoint={2}
              token={token}
            />}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          {mayBeBeneficiary &&
            <>
              <LabelValue
                label={t('Requested For')}
                labelStyle={{ minWidth: '20%' }}
                style={{ pb: '35px', justifyContent: 'flex-start' }}
                value={<ShowBalance
                  balance={new BN(referendum?.proposed_call?.args?.amount)}
                  decimal={decimal}
                  decimalPoint={2}
                  token={token}
                />}
                valueStyle={{ fontSize: 16, fontWeight: 500 }}
              />
              <LabelValue
                label={t('Beneficiary')}
                labelStyle={{ minWidth: '20%' }}
                style={{ pb: '40px', justifyContent: 'flex-start' }}
                value={
                  <Identity
                    api={api}
                    chain={chain}
                    formatted={mayBeBeneficiary}
                    identiconSize={25}
                    showShortAddress
                    showSocial
                    style={{ fontSize: '16px', fontWeight: 500, lineHeight: '47px', maxWidth: '100%', minWidth: '35%' }}
                  />
                }
              />
            </>
          }
          <LabelValue
            label={t('Enact After')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={t('{{ enactment_after_block }} blocks', { replace: { enactment_after_block: referendum?.enactment_after_block } })}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Method')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={referendum?.method}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Proposal Hash')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={referendum?.hash}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
