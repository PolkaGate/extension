// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * @description
 * this component shows an account balances reserved reasons
 * */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { toTitleCase } from '@polkadot/extension-polkagate/src/fullscreen/governance/utils/util';

import { FormatPrice, Identicon, Motion, Popup, Progress, ShowBalance3 } from '../../components';
import { useAccountName, useInfo, useReservedDetails, useTokenPrice, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';

interface Props {
  identity: DeriveAccountRegistration | null | undefined;
  show: boolean;
  assetId?: number | string;
  address: AccountId | string;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function ReservedReasons({ address, assetId, identity, setShow, show }: Props): React.ReactElement<void> {
  const { t } = useTranslation();
  const { chain, decimal, formatted } = useInfo(address);
  const accountName = useAccountName(address);

  const reservedDetails = useReservedDetails(address as string);

  const { price } = useTokenPrice(address as string, assetId);

  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      isSubId={!!identity?.displayParent}
      judgement={_judgement}
      prefix={chain?.ss58Format ?? 42}
      size={30}
      value={formatted}
    />
  );

  const goToAccount = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          _centerItem={identicon}
          noBorder
          onBackClick={goToAccount}
          paddingBottom={0}
          showBackArrow
        />
        <Container disableGutters sx={{ px: '15px' }}>
          <Grid container item justifyContent='center'>
            <Typography sx={{ fontSize: '20px', fontWeight: 400, maxWidth: '82%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {identity?.display || accountName}
            </Typography>
          </Grid>
          <Grid container item justifyContent='center'>
            <Typography sx={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.015em' }}>
              {t('Reserved Reasons')}
            </Typography>
          </Grid>
          <Grid alignItems='center' item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px' }} />
          </Grid>
        </Container>
        <Container disableGutters sx={{ maxHeight: `${parent.innerHeight - 150}px`, overflowY: 'auto', px: '15px' }}>
          {Object.entries(reservedDetails)?.length
            ? <>
              {Object.entries(reservedDetails)?.map(([key, value], index) => (
                <Grid container item key={index}>
                  <Grid alignItems='center' container justifyContent='space-between' py='5px'>
                    <Grid item sx={{ fontSize: '16px', fontWeight: 300, lineHeight: '36px' }} xs={6}>
                      {toTitleCase(key)}
                    </Grid>
                    <Grid alignItems='flex-end' container direction='column' item xs>
                      <Grid item sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
                        <ShowBalance3
                          address={address as string}
                          balance={value}
                        />
                      </Grid>
                      <Grid item pt='6px' sx={{ letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
                        <FormatPrice
                          amount={value}
                          decimals={decimal}
                          fontSize='16px'
                          fontWeight={300}
                          price={price}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '5px', width: '100%' }} />
                </Grid>
              ))}
            </>
            : <Progress
              fontSize={14}
              pt={10}
              size={100}
              title={t('Loading information, please wait ...')}
              type='grid'
            />
          }
        </Container>
      </Popup>
    </Motion>
  );
}
