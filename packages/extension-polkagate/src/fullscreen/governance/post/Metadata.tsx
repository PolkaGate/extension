// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { Referendum } from '../utils/types';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { JsonToTable } from 'react-json-to-table';

import { isObject, isString } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { subscan } from '../../../assets/icons';
import { Identity, ShowBalance, ShowValue } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { isValidAddress } from '../../../util/utils';
import useStyles from '../styles/styles';
import { LabelValue } from '../TrackStats';
import { pascalCaseToTitleCase } from '../utils/util';
import useReferendaRequested from './useReferendaRequested';

export function hexAddressToFormatted(hexString: string, chain: Chain | null | undefined): string | undefined {
  try {
    if (!chain || !hexString) {
      return undefined;
    }

    const decodedBytes = decodeAddress(hexString);

    return encodeAddress(decodedBytes, chain.ss58Format);
  } catch (error) {
    console.error('Error while changing a hex to address:', error);

    return undefined;
  }
}

export const getBeneficiary = (referendum: Referendum, chain: Chain) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const beneficiary = referendum?.call?.args?.['beneficiary']?.value;

  if (!beneficiary) {
    return undefined;
  }

  if (isString(beneficiary)) {
    return hexAddressToFormatted(beneficiary as string, chain) || beneficiary.toString();
  }

  if (isObject(beneficiary)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const _address = beneficiary?.['interior']?.value?.id as string;

    return _address
      ? hexAddressToFormatted(_address, chain) || _address.toString()
      : undefined;
  }

  return undefined;
};

interface Props {
  decisionDepositPayer: string | undefined;
  address: string | undefined;
  referendum: Referendum | undefined;
}

export default function Metadata({ address, decisionDepositPayer, referendum }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, chainName, decimal, token } = useInfo(address);
  const style = useStyles();

  const { rDecimal, rToken } = useReferendaRequested(address, referendum);

  const [expanded, setExpanded] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);

  const referendumLinkOnsSubscan = () => `https://${chainName}.subscan.io/referenda_v2/${String(referendum?.index)}`;

  const maybeBeneficiary = useMemo(() => {
    if (referendum?.call && chain) {
      return getBeneficiary(referendum, chain);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, referendum?.call]);

  const handleChange = useCallback((_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  return (
    <Accordion expanded={expanded} onChange={handleChange} style={style.accordionStyle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded ? `1px solid ${theme.palette.text.disabled}` : undefined, px: 0 }}>
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
                showShortAddress
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
                  showShortAddress={!!decisionDepositPayer}
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
          {maybeBeneficiary &&
            <>
              <LabelValue
                label={t('Requested for')}
                labelStyle={{ minWidth: '20%' }}
                style={{ justifyContent: 'flex-start' }}
                value={<ShowBalance
                  balance={referendum?.call?.args?.['amount'] as string || referendum?.requested}
                  decimal={rDecimal}
                  decimalPoint={2}
                  token={rToken}
                />}
                valueStyle={{ fontSize: 16, fontWeight: 500 }}
              />
              {maybeBeneficiary &&
                <LabelValue
                  label={t('Beneficiary')}
                  labelStyle={{ minWidth: '20%' }}
                  style={{ justifyContent: 'flex-start' }}
                  value={
                    isValidAddress(maybeBeneficiary)
                      ? <Identity
                        api={api}
                        chain={chain}
                        formatted={maybeBeneficiary}
                        identiconSize={25}
                        showShortAddress
                        showSocial
                        style={{ fontSize: '16px', fontWeight: 500, maxWidth: '100%', minWidth: '35%' }}
                      />
                      : <ShowValue value={maybeBeneficiary} />
                  }
                  valueStyle={{ maxWidth: '75%', width: 'fit-content' }}
                />
              }
            </>
          }
          {referendum?.enactAfter &&
            <LabelValue
              label={t('Enact After')}
              labelStyle={{ minWidth: '20%' }}
              style={{ justifyContent: 'flex-start' }}
              value={t<string>('{{ enactAfter }} blocks', { replace: { enactAfter: referendum?.enactAfter } })}
              valueStyle={{ fontSize: 16, fontWeight: 500 }}
            />
          }
          {referendum?.enactAt &&
            <LabelValue
              label={t('Enact at')}
              labelStyle={{ minWidth: '20%' }}
              style={{ justifyContent: 'flex-start' }}
              value={referendum?.enactAt}
              valueStyle={{ fontSize: 16, fontWeight: 500 }}
            />
          }
          <LabelValue
            label={t('Method')}
            labelStyle={{ minWidth: '20%' }}
            style={{ justifyContent: 'flex-start' }}
            value={referendum?.method}
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <LabelValue
            asShortAddress
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
                <Box alt={'subscan'} component='img' height='25px' mt='5px' src={subscan as string} width='25px' />
              </Link>
            }
            valueStyle={{ fontSize: 16, fontWeight: 500 }}
          />
          <Grid container item>
            <Link
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => setShowJson(!showJson)}
              sx={{ color: `${theme.palette.secondary.main}`, cursor: 'pointer' }}
              underline='none'
            >
              <Typography sx={{ py: 2 }}>
                {showJson ? t('Hide Call') : t('View Call in JSON')}
              </Typography>
            </Link>
            {showJson &&
              <Grid container item sx={{ '& td, tr': { bgcolor: 'background.default' }, maxWidth: 'inherit', overflowX: 'auto' }}>
                <JsonToTable json={referendum?.call} />
              </Grid>
            }
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
