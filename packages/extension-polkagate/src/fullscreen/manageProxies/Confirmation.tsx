// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { ProxyItem, TxInfo } from '../../util/types';

import { Avatar, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { subscan } from '../../assets/icons';
import { DisplayInfo, GradientButton, Identity2, Motion, ShortAddress, ShowBalance } from '../../components';
import { useChainName, useTranslation } from '../../hooks';
import FailSuccessIcon from '../../popup/history/partials/FailSuccessIcon';
import { GlowBox, VelvetBox } from '../../style';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  handleClose: () => void;
  depositAmount: BN;
  proxyItems: ProxyItem[];
}

const SubScanIcon = () => {
  return (
    <Avatar
      src={subscan as string}
      sx={{ height: '13px', width: '13px' }}
    />
  );
};

export default function Confirmation ({ address, depositAmount, handleClose, proxyItems, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chainName = useChainName(address);

  const goToExplorer = useCallback(() => {
    const url = `https://${chainName}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  const fee = txInfo.api.createType('Balance', txInfo.fee);

  return (
    <Motion>
      <GlowBox style={{ m: 0, width: '100%' }}>
        <Stack sx={{ alignItems: 'center', mt: '-5px' }}>
          <FailSuccessIcon
            style={{ fontSize: '87px', margin: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
            success={txInfo.success}
          />
          {txInfo?.failureText &&
              <Typography color='#FF4FB9' sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', display: '-webkit-box', mb: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }} textAlign='center' variant='B-4' width='92%'>
                {txInfo.failureText}
              </Typography>
          }
          {/* <AccountWithProxyInConfirmation
              txInfo={txInfo}
            /> */}
        </Stack>
      </GlowBox>
      <VelvetBox>
        <Grid alignItems='center' container item justifyContent='center' pt='8px'>
          {proxyItems.map(({ proxy, status }, index) => {
            return (
              <Grid alignItems='end' container justifyContent='center' key={index} sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {status === 'new'
                    ? t('Added')
                    : t('Removed')}
                </Typography>
                <Identity2
                  address={proxy.delegate}
                  genesisHash={txInfo?.chain?.genesisHash ?? ''}
                  showShortAddress
                  withShortAddress
                />
              </Grid>);
          })}
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
        </Grid>
        <DisplayInfo caption={t('Fee:')} value={fee?.toHuman() ?? '00.00'} />
        <Grid container item justifyContent='center' sx={{ pt: '10px' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Deposit amount:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={txInfo.api}
              balance={depositAmount}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
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
      </VelvetBox>
      <GradientButton
        contentPlacement='center'
        onClick={goToExplorer}
        startIconNode={<SubScanIcon />}
        style={{
          borderRadius: '18px',
          height: '40px',
          width: '100%'
        }}
        text={t('View On Explorer')}
      />
    </Motion>
  );
}
