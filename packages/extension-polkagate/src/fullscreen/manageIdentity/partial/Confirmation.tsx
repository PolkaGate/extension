// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Motion, PButton, ShortAddress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import Explorer from '../../../popup/history/Explorer';
import FailSuccessIcon from '../../../popup/history/partials/FailSuccessIcon';
import { TxInfo } from '../../../util/types';
import { Mode, SubIdAccountsToSubmit } from '..';

interface Props {
  txInfo: TxInfo;
  handleClose: () => void;
  identity: DeriveAccountRegistration | null | undefined;
  status: Mode;
  selectedRegistrarName: string | undefined;
  SubIdentityAccounts: SubIdAccountsToSubmit | undefined;
  maxFeeAmount: BN | undefined;
}

interface DisplayInfoProps {
  caption: string;
  value: string | undefined;
  showDivider?: boolean;
}

export default function Confirmation ({ SubIdentityAccounts, handleClose, identity, maxFeeAmount, selectedRegistrarName, status, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  const DisplayInfo = ({ caption, showDivider = true, value }: DisplayInfoProps) => {
    return (
      <>{value &&
        <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
          <Grid container item width='fit-content'>
            <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
            <Typography lineHeight='40px'>{value}</Typography>
          </Grid>
          {showDivider &&
            <Grid alignItems='center' container item justifyContent='center'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
            </Grid>}
        </Grid>
      }</>
    );
  };

  const ManageIdentityDetail = () => (
    <>
      <DisplayInfo
        caption={t('Display Name:')}
        value={identity?.display}
      />
      <DisplayInfo
        caption={t('Legal Name:')}
        value={identity?.legal}
      />
      <DisplayInfo
        caption={t('Website:')}
        value={identity?.web}
      />
      <DisplayInfo
        caption={t('Email:')}
        value={identity?.email}
      />
      <DisplayInfo
        caption={t('X:')}
        value={identity?.twitter}
      />
      <DisplayInfo
        caption={t('Element:')}
        value={identity?.riot}
      />
      <DisplayInfo
        caption={t('Discord:')}
        showDivider={false}
        value={identity?.other?.discord}
      />
    </>
  );

  const ManageSubIdTxDetail = () => (
    <Grid alignItems='center' container direction='column' item>
      <Typography fontSize='20px' fontWeight={400}>
        {t('Sub-identity(ies)')}:
      </Typography>
      {SubIdentityAccounts?.map((sub, index) => (
        <Typography fontSize='20px' fontWeight={400} key={index}>
          {sub.name}
        </Typography>
      ))}
    </Grid>
  );

  return (
    <Motion>
      <Grid container item sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', pb: '8px' }}>
        <FailSuccessIcon
          showLabel={false}
          style={{ fontSize: '87px', m: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
          success={txInfo.success}
        />
        {txInfo?.failureText &&
          <Typography fontSize='16px' fontWeight={400} m='auto' sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', display: '-webkit-box', mb: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }} textAlign='center' width='92%'>
            {txInfo.failureText}
          </Typography>
        }
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Account holder')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {txInfo.from.name}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
          </Grid>
        </Grid>
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Grid alignItems='center' container item justifyContent='center' pt='8px'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
        </Grid>
        {(status === 'Modify' || status === 'Set') &&
          <ManageIdentityDetail />
        }
        {/* {status === 'Clear' &&
          <Typography fontSize='22px' fontWeight={400} my='8px' textAlign='center' width='100%'>
            {txInfo.success
              ? t('Identity cleared.')
              : t('Identity not cleared.')}
          </Typography>
        } */}
        {status === 'ManageSubId' && SubIdentityAccounts && SubIdentityAccounts.length > 0 &&
          <ManageSubIdTxDetail />
        }
        {status === 'ManageSubId' && SubIdentityAccounts?.length === 0 &&
          <Typography fontSize='22px' fontWeight={400} my='8px' textAlign='center' width='100%'>
            {txInfo.success
              ? t('Sub-Identity(ies) cleared.')
              : t('Sub-Identity(ies) not cleared.')}
          </Typography>
        }
        {(status === 'RequestJudgement' || status === 'CancelJudgement') &&
          <DisplayInfo
            caption={t('Registrar:')}
            value={selectedRegistrarName}
          />}
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
        {status === 'RequestJudgement' && maxFeeAmount &&
          <Grid container item justifyContent='center' sx={{ pt: '10px' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t('Registration fee:')}
            </Typography>
            <Grid item lineHeight='22px' pl='5px'>
              <ShowBalance
                api={txInfo.api}
                balance={maxFeeAmount}
                decimalPoint={4}
                height={22}
              />
            </Grid>
            <Grid alignItems='center' container item justifyContent='center'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '10px', width: '240px' }} />
            </Grid>
          </Grid>}
        <DisplayInfo
          caption={t('Fee:')}
          value={fee?.toHuman() ?? '00.00'}
        />
        {txInfo?.txHash &&
          <Grid alignItems='center' container fontSize='16px' fontWeight={400} justifyContent='center' pt='8px'>
            <Grid container item width='fit-content'>
              <Typography pr='5px'>{t('Hash')}:</Typography>
            </Grid>
            <Grid container item width='fit-content'>
              <ShortAddress
                address={txInfo.txHash}
                charsCount={6}
                showCopy
                style={{ fontSize: '16px' }}
              />
            </Grid>
          </Grid>
        }
        {txInfo?.txHash &&
          <Grid container justifyContent='center' pt='5px'>
            <Explorer chainName={chainName} txHash={txInfo?.txHash} />
          </Grid>
        }
      </Grid>
      <PButton
        _ml={0}
        _mt='30px'
        _onClick={handleClose}
        _width={100}
        text={txInfo.success ? t('Done') : t('Close')}
      />
    </Motion>
  );
}
