// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, UserOctagon } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { noop } from '@polkadot/util';

import { AccountContext, ExtensionPopup, GradientDivider, Identity2 } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { getFormattedAddress } from '../../../../util/utils';
import PRadio from '../../components/Radio';
import StakingActionButton from '../../partial/StakingActionButton';

interface ChooseAccountMenuProps {
  openMenu: boolean;
  handleClose: () => void;
  genesisHash: string | undefined;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
}

const ChooseAccountMenu = ({ genesisHash, handleClose, openMenu, setSpecificAccount, specificAccount }: ChooseAccountMenuProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);
  const { chain } = useChainInfo(genesisHash, true);

  const handleSelect = useCallback((selectedAccount: string) => () => {
    setSpecificAccount(selectedAccount);
  }, [setSpecificAccount]);

  return (
    <ExtensionPopup
      TitleIcon={UserOctagon}
      handleClose={handleClose}
      iconColor={theme.palette.text.highlight}
      iconSize={26}
      maxHeight='460px'
      openMenu={openMenu}
      title={t('Accounts')}
      withoutBackground
      withoutTopBorder
    >
      <Stack direction='column' sx={{ height: '460px', position: 'relative', rowGap: '24px', width: '100%' }}>
        <Typography color='text.highlight' letterSpacing='1px' textTransform='uppercase' variant='S-1' width='fit-content'>
          {t('My Accounts')}
        </Typography>
        <Stack direction='column' sx={{ maxHeight: '390px', mb: '65px', overflowY: 'auto', rowGap: '12px' }}>
          {accounts.map(({ address }) => {
            const formatted = getFormattedAddress(address, chain, chain?.ss58Format ?? 0);
            const checked = formatted === specificAccount;

            return (
              <>
                <Container disableGutters key={address} onClick={handleSelect(formatted)} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Identity2
                    address={address}
                    addressStyle={{ color: '#809ACB' }}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={24}
                    style={{
                      color: checked ? '#3988FF' : 'text.primary',
                      'div div#socials': {
                        mt: 0
                      },
                      fontSize: '12px',
                      fontWeight: 500,
                      variant: 'B-4'
                    }}
                    withShortAddress
                  />
                  <PRadio
                    checked={checked}
                    onChange={noop}
                    value={formatted}
                  />
                </Container>
                <GradientDivider />
              </>
            );
          })}
        </Stack>
        <StakingActionButton
          onClick={handleClose}
          style={{
            bottom: '10px',
            height: '44px',
            left: '0',
            position: 'absolute',
            right: '0',
            width: '100%'
          }}
          text={t('Close')}
        />
      </Stack>
    </ExtensionPopup>
  );
};

interface Props {
  genesisHash: string | undefined;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
}

export default function ChooseAccount ({ genesisHash, setSpecificAccount, specificAccount }: Props): React.ReactElement {
  const theme = useTheme();

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const handleToggleMenu = useCallback(() => setOpenMenu((isMenuOpen) => !isMenuOpen), []);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
        <Identity2
          address={specificAccount}
          addressStyle={{ color: '#809ACB', fontSize: '12px', fontWeight: 500 }}
          genesisHash={genesisHash ?? ''}
          identiconSize={36}
          style={{ addressVariant: 'B-4', 'div div#socials': { mt: 0 }, variant: 'B-2' }}
          withShortAddress
        />
        <ArrowCircleDown color={theme.palette.text.highlight} onClick={handleToggleMenu} size='32' style={{ cursor: 'pointer' }} variant='Bulk' />
      </Container>
      <ChooseAccountMenu
        genesisHash={genesisHash}
        handleClose={handleToggleMenu}
        openMenu={openMenu}
        setSpecificAccount={setSpecificAccount}
        specificAccount={specificAccount}
      />
    </>
  );
}
