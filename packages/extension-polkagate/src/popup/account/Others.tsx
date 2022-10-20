// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../../../../extension-ui/src/types';

import { faHistory, faPaperPlane, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, ActionContext, ChainLogo, Header, Identicon, Motion, Select, SettingsContext, ShowBalance } from '../../components';
import { useApi, useEndpoint, useEndpoints, useGenesisHashOptions, useMetadata, useTranslation } from '../../hooks';
import { getMetadata, tieAccount, updateMeta } from '../../messaging';// added for plus, updateMeta
import { getPrice } from '../../util/api/getPrice';
import { DEFAULT_TYPE } from '../../util/defaultType';
import { FormattedAddressState } from '../../util/types';
import { prepareMetaData } from '../../util/utils';// added for plus
import AccountBrief from './AccountBrief';
import { HeaderBrand } from '../../partials';
import { getValue } from './util';

interface AddressFormatted {
  address: string;
  formatted: string;
}

export default function Others(): React.ReactElement<void> {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const { state: { account, chain, price, balances, apiToUse } } = useLocation();
  const { address, formatted } = useParams<AddressFormatted>();

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  console.log('balancesbalances:', balances);
  console.log('namedReserved:', balances?.namedReserved);
  console.log('lockedBreakdown:', balances?.lockedBreakdown);

  const goToAccount = useCallback(() => {
    chain?.genesisHash && address && formatted && history.push({
      pathname: `/account/${chain?.genesisHash}/${address}/${formatted}/`,
      state: { apiToUse, balances }
    });
  }, [balances, history, chain?.genesisHash, address, formatted, apiToUse]);

  const Balance = ({ balances, type }: { type: string, balances: DeriveBalancesAll | undefined }) => {
    const value = getValue(type, balances);
    const balanceInUSD = price && value && apiToUse && Number(value) / (10 ** apiToUse.registry.chainDecimals[0]) * price;

    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='5px'>
          <Grid item xs={4.5}>
            <Typography sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }}>
              {type}
            </Typography>
          </Grid>
          <Grid container direction='column' item justifyContent='flex-end' xs>
            <Grid item textAlign='right'>
              <Typography sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}>
                <ShowBalance api={apiToUse} balance={value} />
              </Typography>
            </Grid>
            <Grid item pt='6px' textAlign='right'>
              <Typography sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }}>
                {balanceInUSD !== undefined
                  ? `$${Number(balanceInUSD)?.toLocaleString()}`
                  : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />
                }
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: type === 'Others' ? '2px' : '1px', my: '5px' }} />
      </>
    );
  };

  return (
    <Motion>
      <HeaderBrand
        _centerItem={identicon}
        noBorder
        onBackClick={goToAccount}
        paddingBottom={0}
        showBackArrow
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <Grid container item justifyContent='center' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography sx={{ fontSize: '28px', fontWeight: 400, letterSpacing: '-0.015em' }}>
            {account?.name}
          </Typography>
        </Grid>
        <Grid container item justifyContent='center'>
          <Typography sx={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.015em' }}>
            {t('Others')}
          </Typography>
        </Grid>
        <Grid alignItems='center' item justifyContent='center'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px' }} />
        </Grid>
      </Container>
      <Container disableGutters sx={{ maxHeight: `${parent.innerHeight - 150}px`, overflowY: 'auto', px: '15px' }}>
        {/* <Balance balances={balances} type={'Free Balance'} /> */}
        {/* <Balance balances={balances} type={'Reserved Balance'} /> */}
        <Balance balances={balances} type={'Frozen Misc'} />
        <Balance balances={balances} type={'Frozen Fee'} />
        <Balance balances={balances} type={'Locked Balance'} />
        <Balance balances={balances} type={'Vested Balance'} />
        <Balance balances={balances} type={'Vested Claimable'} />
        <Balance balances={balances} type={'Vesting Locked'} />
        <Balance balances={balances} type={'Vesting Total'} />
        {/* <Balance balances={balances} type={'Voting Balance'} /> */}

      </Container>
    </Motion>

  );
}
