// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { JsonToTable } from "react-json-to-table";

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { subscan } from '../../../assets/icons';
import { Identity, ShowBalance } from '../../../components';
import { useApi, useChain, useChainName, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { ReferendumPolkassembly } from '../utils/types';
import { pascalCaseToTitleCase } from '../utils/util';

export function hexAddressToFormatted(hexString: string, chain: Chain | undefined): string | undefined {
  if (!chain || !hexString) {
    return undefined;
  }

  const decodedBytes = decodeAddress(hexString);

  return encodeAddress(decodedBytes, chain.ss58Format);
}

export default function Metadata({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassembly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const [expanded, setExpanded] = React.useState(false);
  const [referendumJson, SetReferendumJson] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);

  const referendumLinkOnsSubscan = () => 'https://' + chainName + '.subscan.io/referenda_v2/' + String(referendum?.post_id);
  const mayBeBeneficiary = hexAddressToFormatted(referendum?.proposed_call?.args?.beneficiary, chain);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  useEffect(() => {
    api && referendum?.post_id && api.query.referenda?.referendumInfoFor(referendum.post_id).then((res) => {
      console.log(`referendumInfoFor referendum ${referendum?.post_id} :, ${res}`);
      SetReferendumJson(res.toJSON());
    }).catch(console.error);
  }, [api, referendum]);

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '3%', mt: 1 }}>
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
          <LabelValue
            label={t('View in Subscan')}
            labelStyle={{ minWidth: '20%' }}
            style={{ pb: '35px', justifyContent: 'flex-start' }}
            value={
              <Link
                href={referendumLinkOnsSubscan()}
                rel='noreferrer'
                target='_blank'
                underline='none'
              >
                <Box alt={'subscan'} component='img' height='25px' mt='5px' src={subscan} width='25px' />
              </Link>
            }
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          {referendumJson && !referendumJson.hasOwnProperty('approved') &&
            <Grid item>
              <Link
                onClick={() => setShowJson(!showJson)}
                sx={{ cursor: 'pointer' }}
                underline='none'
              >
                <Typography sx={{ py: 2 }}>
                  {t('View Call in JSON')}
                </Typography>
              </Link>
              {showJson &&
                <JsonToTable json={referendumJson} />
              }
            </Grid>
          }
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
