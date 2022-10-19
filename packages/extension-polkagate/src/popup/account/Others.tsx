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

interface AddressFormatted {
  address: string;
  formatted: string;
}

export default function Others(): React.ReactElement<void> {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const location = useLocation();
  const { address, formatted } = useParams<AddressFormatted>();

  const identicon = (
    <Identicon
      iconTheme={location?.state?.chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={location?.state?.chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  console.log('history:', location?.state);
  
  const _onBackClick = useCallback(() => {
  
  }, []);

  return (
    <Motion>
      <>
        <HeaderBrand
          _centerItem={identicon}
          onBackClick={_onBackClick}
          showBackArrow
          noBorder
        />

        {/* <Header icon={identicon}>
          <Grid item container justifyContent='center' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Typography sx={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '36px' }}>
              {location?.state?.account?.name}
            </Typography>
          </Grid>
        </Header> */}
      </>
    </Motion>

  );
}
