// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Identity, Motion, PButton, ShortAddress } from '../../../components';
import { useToken, useTranslation } from '../../../hooks';
import { ActiveRecoveryFor } from '../../../hooks/useActiveRecoveries';
import { ThroughProxy } from '../../../partials';
import { TxInfo } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import Explorer from '../../history/Explorer';
import FailSuccessIcon from '../../history/partials/FailSuccessIcon';
import { AddressWithIdentity } from '../components/SelectTrustedFriend';
import recoveryDelayPeriod from '../util/recoveryDelayPeriod';
import { RecoveryConfigType, SocialRecoveryModes } from '../util/types';
import { STEPS } from '..';

interface Props {
  txInfo: TxInfo;
  handleClose: () => void;
  mode: SocialRecoveryModes;
  recoveryConfig: RecoveryConfigType | undefined;
  depositValue: BN;
  decimal: number | undefined;
  lostAccountAddress: AddressWithIdentity | undefined;
  vouchRecoveryInfo: { lost: AddressWithIdentity; rescuer: AddressWithIdentity; } | undefined;
  WithdrawDetails: ({ step }: {
    step: number;
  }) => JSX.Element;
  activeLost: ActiveRecoveryFor | null | undefined;
}

interface DisplayInfoProps {
  caption: string;
  value: string | undefined;
  showDivider?: boolean;
  fontSize?: string;
  fontWeight?: number;
}

interface AccountWithTitleProps {
  title: string;
  address: string | undefined;
  accountInformation: DeriveAccountInfo | undefined;
}

export const DisplayInfo = ({ caption, fontSize, fontWeight, showDivider = true, value, lostAccountAddress }: DisplayInfoProps): React.ReactElement => {
  return (
    <>{value &&
      <Grid alignItems='center' container direction='column' justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography fontSize={fontSize ?? '16px'} fontWeight={fontWeight ?? 400} lineHeight='40px' pr='5px'>{caption}</Typography>
          <Typography fontSize={fontSize ?? '16px'} fontWeight={fontWeight ?? 400} lineHeight='40px'>{value}</Typography>
        </Grid>
        {showDivider &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
          </Grid>}
      </Grid>
    }</>
  );
};

export default function Confirmation({ activeLost, decimal, depositValue, handleClose, lostAccountAddress, mode, recoveryConfig, txInfo, vouchRecoveryInfo, WithdrawDetails }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(txInfo.from.address);
  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  const AccountWithTitle = ({ accountInformation, address, title }: AccountWithTitleProps) => (
    <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
      <Typography fontSize='16px' fontWeight={400} lineHeight='23px' pr='5px'>
        {title}:
      </Typography>
      <Identity
        accountInfo={accountInformation}
        api={txInfo.api}
        chain={txInfo.chain}
        direction='row'
        formatted={address}
        noIdenticon
        showSocial={false}
        style={{ fontSize: '16px', maxWidth: '60%', width: 'fit-content' }}
        subIdOnly
        withShortAddress
      />
    </Grid>
  );

  const MakeRecoverableDetail = () => (
    <>
      {(mode === 'SetRecovery' || mode === 'ModifyRecovery') && recoveryConfig &&
        recoveryConfig.friends.addresses.map((friend, index) => (
          <Grid alignItems='end' container justifyContent='center' key={index} sx={{ m: 'auto', pt: '5px', width: '90%' }}>
            <AccountWithTitle
              accountInformation={recoveryConfig.friends.infos?.at(index)}
              address={friend}
              title={t<string>(`Trusted friend ${index + 1}`)}
            />
          </Grid>
        ))}
      <Grid alignItems='center' container item justifyContent='center' pt='8px'>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
      </Grid>
      {(mode === 'SetRecovery' || mode === 'ModifyRecovery') && recoveryConfig &&
        <>
          <DisplayInfo
            caption={t<string>('Recovery Threshold:')}
            value={`${recoveryConfig.threshold} of ${recoveryConfig.friends.addresses.length}`}
          />
          <DisplayInfo
            caption={t<string>('Recovery Delay:')}
            value={recoveryDelayPeriod(recoveryConfig.delayPeriod)}
          />
        </>
      }
    </>
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
          <AccountWithTitle
            accountInformation={mode === 'VouchRecovery' ? vouchRecoveryInfo?.rescuer?.accountIdentity : undefined}
            address={mode !== 'VouchRecovery'
              ? txInfo.from.address
              : vouchRecoveryInfo?.rescuer.address}
            title={mode === 'VouchRecovery'
              ? t<string>('Rescuer account')
              : t<string>('Account holder')}
          />
        </Grid>
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Grid alignItems='center' container item justifyContent='center' pt='8px'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
        </Grid>
        {((mode === 'VouchRecovery' && vouchRecoveryInfo) || mode === 'CloseRecovery') &&
          <>
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
              <AccountWithTitle
                accountInformation={mode === 'VouchRecovery' ? vouchRecoveryInfo?.lost?.accountIdentity : undefined}
                address={vouchRecoveryInfo?.lost?.address ?? activeLost?.rescuer}
                title={mode === 'VouchRecovery'
                  ? t<string>('Lost account')
                  : t<string>('Account that initiated the recovery')}
              />
            </Grid>
            <Grid alignItems='center' container item justifyContent='center' pt='8px'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
            </Grid>
          </>
        }
        {(mode === 'InitiateRecovery' || mode === 'Withdraw') &&
          <>
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
              <AccountWithTitle
                accountInformation={lostAccountAddress?.accountIdentity}
                address={lostAccountAddress?.address}
                title={t<string>('Lost account')}
              />
              {mode === 'Withdraw' && !txInfo.success &&
                <Grid alignItems='center' container item justifyContent='center' pt='8px'>
                  <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
                </Grid>
              }
            </Grid>
            {mode !== 'Withdraw' &&
              <>
                <Grid alignItems='center' container item justifyContent='center' pt='8px'>
                  <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
                </Grid>
                <DisplayInfo
                  caption={t<string>('Initiation Deposit:')}
                  value={`${amountToHuman(depositValue, decimal, 3)} ${token ?? ''}`}
                />
              </>
            }
          </>
        }
        {mode === 'Withdraw' && txInfo.success &&
          <>
            <WithdrawDetails step={STEPS.CONFIRM} />
            <Grid alignItems='center' container item justifyContent='center' pt='8px'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
            </Grid>
          </>
        }
        {(mode === 'SetRecovery' || mode === 'ModifyRecovery') && recoveryConfig &&
          <MakeRecoverableDetail />
        }
        {(mode === 'RemoveRecovery' || mode === 'CloseRecovery') &&
          <DisplayInfo
            caption={mode === 'CloseRecovery' ? t<string>('Deposit they made:') : t<string>('Released deposit:')}
            value={`${amountToHuman(depositValue, decimal, 3)} ${token ?? ''}`}
          />
        }
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
      <Grid container width='30%' ml='70%'>
        <PButton
          _ml={0}
          _mt='30px'
          _onClick={handleClose}
          _width={100}
          text={t<string>('Done')}
        />
      </Grid>
    </Motion>
  );
}
