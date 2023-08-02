// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Motion, PButton, ShortAddress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import { TxInfo } from '../../../util/types';
import Explorer from '../../history/Explorer';
import FailSuccessIcon from '../../history/partials/FailSuccessIcon';
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
      <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
          <Typography lineHeight='40px'>{value ?? t<string>('Not set yet')}</Typography>
        </Grid>
        {showDivider &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
          </Grid>}
      </Grid>
    );
  };

  const ManageIdentityDetail = () => (
    <>
      <DisplayInfo
        caption={t<string>('Display Name:')}
        value={identity?.display}
      />
      <DisplayInfo
        caption={t<string>('Legal Name:')}
        value={identity?.legal}
      />
      <DisplayInfo
        caption={t<string>('Website:')}
        value={identity?.web}
      />
      <DisplayInfo
        caption={t<string>('Email:')}
        value={identity?.email}
      />
      <DisplayInfo
        caption={t<string>('Twitter:')}
        value={identity?.twitter}
      />
      <DisplayInfo
        caption={t<string>('Element:')}
        value={identity?.riot}
      />
      <DisplayInfo
        caption={t<string>('Discord:')}
        showDivider={false}
        value={identity?.other?.discord}
      />
    </>
  );

  const ManageSubIdTxDetail = () => (
    <Grid alignItems='center' container direction='column' item>
      <Typography fontSize='20px' fontWeight={400}>
        {t<string>('Sub-identity(ies)')}:
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
            {t<string>('Account holder')}:
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
        {status === 'Clear' &&
          <Typography fontSize='22px' fontWeight={400} my='8px' textAlign='center' width='100%'>
            {txInfo.success
              ? t<string>('Identity cleared.')
              : t<string>('Identity not cleared.')}
          </Typography>
        }
        {status === 'ManageSubId' && SubIdentityAccounts && SubIdentityAccounts.length > 0 &&
          <ManageSubIdTxDetail />
        }
        {status === 'ManageSubId' && SubIdentityAccounts?.length === 0 &&
          <Typography fontSize='22px' fontWeight={400} my='8px' textAlign='center' width='100%'>
            {txInfo.success
              ? t<string>('Sub-Identity(ies) cleared.')
              : t<string>('Sub-Identity(ies) not cleared.')}
          </Typography>
        }
        {(status === 'RequestJudgement' || status === 'CancelJudgement') &&
          <DisplayInfo
            caption={t<string>('Registrar:')}
            value={selectedRegistrarName}
          />}
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
        {status === 'RequestJudgement' && maxFeeAmount &&
          <Grid container item justifyContent='center' sx={{ pt: '10px' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Registration fee:')}
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
          caption={t<string>('Fee:')}
          value={fee?.toHuman() ?? '00.00'}
        />
        {txInfo?.txHash &&
          <Grid alignItems='center' container fontSize='16px' fontWeight={400} justifyContent='center' pt='8px'>
            <Grid container item width='fit-content'>
              <Typography pr='5px'>{t<string>('Hash')}:</Typography>
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
        text={t<string>('Close')}
      />
    </Motion>
  );
}
