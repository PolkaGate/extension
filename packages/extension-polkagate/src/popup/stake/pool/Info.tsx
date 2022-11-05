// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, FormatBalance, PButton, Popup, ShowBalance } from '../../../components';
import { useApi, useEndpoint, useMapEntries, useMetadata, useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import { HeaderBrand } from '../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../util/utils';
import { getValue } from '../../account/util';

interface Props {
  backPath: string;
  showInfo: boolean;
}

export default function Info({ backPath, showInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onBackClick = useCallback(() => {
    onAction(backPath);
  }, [onAction, backPath]);

  const Row = ({ label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' p='10px 15px' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item xs justifyContent='flex-end'>
            <Grid container direction='column' item xs alignItems='flex-end'>
              <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} >
                <ShowBalance api={api} balance={value} decimalPoint={2} />
              </Grid>
              <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                {link1Text &&
                  <Grid item sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='6px'>
                      <Divider orientation='vertical' sx={{ borderColor: 'text.primary', height: '19px', mt: '10px', width: '2px' }} />
                    </Grid>
                    <Grid item sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                      {link2Text}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {label === 'Unstaking' &&
              <Grid
                alignItems='center'
                container
                item
                onClick={_toggleShowUnlockings}
                sx={{ ml: '25px' }}
                xs={1}
              >
                <ArrowForwardIosIcon
                  sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showUnlockings ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                />
              </Grid>
            }
          </Grid>
        </Grid>
        {label === 'Unstaking' && showUnlockings &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid item container justifyContent='center' xs={12}>
            <Divider sx={{ borderColor: 'secondary.main', borderWidth: '1px', mb: '2px', px: '5px', width: '90%' }} />
          </Grid>
        }
      </>
    );
  };

  const SubTitle = ({ title }: { title: string }) => (
    <Grid container direction='column' item justifyContent='center' sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '25px', px: '5px' }}>
      <Grid item sx={{ m: 'auto' }}>
        {title}
      </Grid>
      <Grid item>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </Grid>
  );

  return (
    <Popup show={showInfo}>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle title={t('Info')} />
      <Container
        disableGutters
        sx={{ pt: '5px' }}
      >

      </Container>
    </Popup>
  );
}
