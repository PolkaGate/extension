// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Skeleton } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useContext, useEffect } from 'react';

import Identicon from '@polkadot/react-identicon';
import { Balance } from '@polkadot/types/interfaces';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Chain } from '../../../extension-chains/src/types';
import { AccountContext, SettingsContext } from '../../../extension-ui/src/components/contexts';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { ChainInfo } from '../util/plusTypes';
import ShortAddress from './ShortAddress';

interface nameAddress {
  name?: string;
  address: string;
}

interface Props {
  address: string;
  availableBalance?: Balance | undefined;
  chain: Chain;
  encodedAddressInfo: nameAddress | undefined;
  setEncodedAddressInfo: React.Dispatch<React.SetStateAction<nameAddress | undefined>>;
  setAvailableBalance?: React.Dispatch<React.SetStateAction<Balance | undefined>>;
  chainInfo?: ChainInfo;
  role?: string;
}

export default function Participator({ address, availableBalance, chain, chainInfo, encodedAddressInfo, role, setAvailableBalance, setEncodedAddressInfo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    if (prefix !== undefined) {
      const selectedAddressJson = accounts.find((acc) => acc.address === address);

      if (!selectedAddressJson) {
        throw new Error(' address not found in accounts!');
      }

      const publicKey = decodeAddress(selectedAddressJson.address);

      setEncodedAddressInfo({ address: encodeAddress(publicKey, prefix), name: selectedAddressJson?.name });
    }
  }, [accounts, chain, address, settings, setEncodedAddressInfo]);

  useEffect(() => {
    if (!encodedAddressInfo || !setAvailableBalance || !chainInfo) return;

    setAvailableBalance(undefined);

    // eslint-disable-next-line no-void
    void chainInfo?.api.derive.balances?.all(encodedAddressInfo.address).then((b) => {
      setAvailableBalance(b?.availableBalance);
    });
  }, [chainInfo, encodedAddressInfo, setAvailableBalance]);

  return (
    <Grid container item sx={{ p: '20px 40px 0px' }} xs={12}>
      <Grid item sx={{ color: grey[800], fontSize: '13px', fontWeight: '600', marginTop: '20px', textAlign: 'left', pr: 1 }} xs={'auto'}>
        {role}:
      </Grid>
      <Grid item sx={{ flexGrow: 1 }}>
        <Box sx={{ borderBottom: '1px groove silver', borderRadius: '10px', px: 1 }}>
          <Grid alignItems='center' container>

            {encodedAddressInfo &&
              <Grid alignItems='center' container item xs={12}>
                <Grid item xs={1}>
                  <Identicon
                    prefix={chain?.ss58Format ?? 42}
                    size={30}
                    theme={chain?.icon || 'polkadot'}
                    value={encodedAddressInfo?.address}
                  />
                </Grid>
                <Grid container item justifyContent='flex-start' sx={{ fontSize: 14, pl: 1 }} xs={11}>
                  <Grid item sx={{ fontSize: 13, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} xs={12}>
                    {encodedAddressInfo?.name || <ShortAddress address={encodedAddressInfo?.address} />}
                  </Grid>
                  {encodedAddressInfo?.name && <Grid item sx={{ color: grey[500], fontSize: 13, textAlign: 'left' }} xs={7}>
                    <ShortAddress address={encodedAddressInfo?.address} />
                  </Grid>
                  }

                  {setAvailableBalance &&
                    <Grid data-testid='balance' item xs={5} sx={{ fontSize: 11, textAlign: 'right' }}>
                      {t('Available')}{': '}
                      {availableBalance
                        ? `${availableBalance?.toHuman()}`
                        : <Skeleton sx={{ display: 'inline-block', fontWeight: '600', width: '50px' }} />
                      }
                    </Grid>
                  }
                </Grid>
              </Grid>
            }
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
