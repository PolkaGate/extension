// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { riot } from '../../../assets/icons';
import { Identicon, ShortAddress } from '../../../components';
import { useAccountInfo, useAccountName } from '../../../hooks';

interface Props {
  api: ApiPromise | undefined;
  formatted?: string | AccountId;
  chain: Chain | null | undefined;
  accountInfo?: DeriveAccountInfo | undefined;
}

export default function TrustedFriendAccount({ accountInfo, api, chain, formatted }: Props): React.ReactElement {
  const identity = useAccountInfo(api, String(formatted), accountInfo)?.identity;
  const accountNameInExtension = useAccountName(formatted);
  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);
  // const xs = [3, 4, 6, 12][[identity?.email, identity?.web, identity?.riot, identity?.twitter].filter((item) => item !== undefined).length];
  // const linksWidth = [identity?.email, identity?.web, identity?.riot, identity?.twitter].filter((item) => item !== undefined).length;

  const IdentityInformation = ({ icon, value }: { value: string | undefined, icon: unknown }) => {
    return (
      <>
        {value &&
          <Grid alignItems='center' container item width={'calc(100% / 4)'}>
            {icon}
            <Typography fontSize='9px' fontWeight={400} maxWidth='calc(100% - 30px)' overflow='hidden' pl='8px' textOverflow='ellipsis'>
              {value}
            </Typography>
          </Grid>
        }
      </>
    );
  };

  return (
    <Grid alignItems='center' container item py='8px'>
      <Grid container item m='auto' pr='10px' width='fit-content'>
        <Identicon
          iconTheme={chain?.icon || 'polkadot'}
          isSubId={!!identity?.displayParent}
          judgement={_judgement}
          prefix={chain?.ss58Format ?? 42}
          size={40}
          value={formatted}
        />
      </Grid>
      <Grid container direction='column' gap='3px' item xs>
        <Grid container fontSize='16px' fontWeight={500} item>
          {(identity?.display || accountNameInExtension) &&
            <Typography fontSize='16px' fontWeight={500} pr='5px'>
              {`${identity?.display ?? accountNameInExtension ?? ''} : `}
            </Typography>
          }
          <ShortAddress
            address={formatted}
            charsCount={10}
            style={{ justifyContent: 'flex-start', width: 'fit-content' }}
          />
        </Grid>
        <Grid container item>
          <IdentityInformation
            icon={
              <FontAwesomeIcon
                color='#1E5AEF'
                fontSize='15px'
                icon={faEnvelope}
              />
            }
            value={identity?.email}
          />
          <IdentityInformation
            icon={
              <FontAwesomeIcon
                color='#007CC4'
                fontSize='15px'
                icon={faGlobe}
              />
            }
            value={identity?.web}
          />
          <IdentityInformation
            icon={
              <FontAwesomeIcon
                color='#2AA9E0'
                fontSize='15px'
                icon={faTwitter}
              />
            }
            value={identity?.twitter}
          />
          <IdentityInformation
            icon={
              <Box
                component='img'
                src={riot as string}
                sx={{ height: '15px', mb: '2px', width: '15px' }}
              />
            }
            value={identity?.riot}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
