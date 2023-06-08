// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Link, Typography, useTheme } from '@mui/material';
import React from 'react';
import { JsonToTable } from "react-json-to-table";

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { subscan } from '../../../assets/icons';
import { Identity, ShowBalance } from '../../../components';
import { useApi, useChain, useChainName, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { Referendum } from '../utils/types';
import { pascalCaseToTitleCase } from '../utils/util';

export function hexAddressToFormatted(hexString: string, chain: Chain | undefined): string | undefined {
  if (!chain || !hexString) {
    return undefined;
  }

  const decodedBytes = decodeAddress(hexString);

  return encodeAddress(decodedBytes, chain.ss58Format);
}

interface Props {
  decisionDepositPayer: string | undefined;
  address: string | undefined;
  referendum: Referendum | undefined;
}

export default function Metadata({ address, decisionDepositPayer, referendum }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const [expanded, setExpanded] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);

  const referendumLinkOnsSubscan = () => 'https://' + chainName + '.subscan.io/referenda_v2/' + String(referendum?.index);
  const mayBeBeneficiary = hexAddressToFormatted(referendum?.call?.args?.beneficiary, chain);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '3%', mt: 1, borderRadius: '10px' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
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
            style={{ justifyContent: 'flex-start' }}
            value={pascalCaseToTitleCase(referendum?.trackName)}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Proposer')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={
              <Identity
                api={api}
                chain={chain}
                formatted={referendum?.proposer}
                identiconSize={25}
                showSocial
                style={{ fontSize: '16px', fontWeight: 500 }}
              />
            }
            valueStyle={{ maxWidth: '75%', width: 'fit-content' }}
          />
          <LabelValue
            label={t('Submission Amount')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={<ShowBalance
              balance={referendum?.submissionAmount}
              decimal={decimal}
              decimalPoint={2}
              token={token}
            />}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          {decisionDepositPayer &&
            <LabelValue
              label={t('Decision Deposit Payer')}
              labelStyle={{ minWidth: '20%' }}
              style={{ justifyContent: 'flex-start' }}
              value={
                <Identity
                  api={api}
                  chain={chain}
                  formatted={decisionDepositPayer}
                  identiconSize={25}
                  showSocial
                  style={{ fontSize: '16px', fontWeight: 500 }}
                />
              }
              valueStyle={{ maxWidth: '75%', width: 'fit-content' }}
            />
          }
          <LabelValue
            label={t('Decision Deposit')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={<ShowBalance
              balance={referendum?.decisionDepositAmount}
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
                style={{ justifyContent: 'flex-start' }}
                value={<ShowBalance
                  balance={referendum?.call?.args?.amount || referendum?.requested}
                  decimal={decimal}
                  decimalPoint={2}
                  token={token}
                />}
                valueStyle={{ fontSize: 16, fontWeight: 500 }}
              />
              <LabelValue
                label={t('Beneficiary')}
                labelStyle={{ minWidth: '20%' }}
                style={{ justifyContent: 'flex-start' }}
                value={
                  <Identity
                    api={api}
                    chain={chain}
                    formatted={mayBeBeneficiary}
                    identiconSize={25}
                    showShortAddress
                    showSocial
                    style={{ fontSize: '16px', fontWeight: 500, maxWidth: '100%', minWidth: '35%' }}
                  />
                }
                valueStyle={{ maxWidth: '75%', width: 'fit-content' }}
              />
            </>
          }
          <LabelValue
            label={t('Enact After')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={t<string>('{{ enactAfter }} blocks', { replace: { enactAfter: referendum?.enactAfter } })}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Method')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={referendum?.method}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('Proposal Hash')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={referendum?.hash}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            label={t('View in Subscan')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={
              <Link
                display='block'
                height='35px'
                href={referendumLinkOnsSubscan()}
                lineHeight='35px'
                my='auto'
                rel='noreferrer'
                target='_blank'
                underline='none'
                width='25px'
              >
                <Box alt={'subscan'} component='img' height='25px' width='25px' mt='5px' src={subscan as string} />
              </Link>
            }
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <Grid container item>
            <Link
              onClick={() => setShowJson(!showJson)}
              sx={{ cursor: 'pointer' }}
              underline='none'
            >
              <Typography sx={{ py: 2 }}>
                {showJson ? t('Hide Call') : t('View Call in JSON')}
              </Typography>
            </Link>
            {showJson &&
              <Grid item sx={{ maxWidth: 'inherit', overflowX: 'auto' }}>
                <JsonToTable json={referendum?.call} />
              </Grid>
            }
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
