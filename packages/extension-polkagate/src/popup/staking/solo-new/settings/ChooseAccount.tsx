// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, UserOctagon } from 'iconsax-react';
import React, { Fragment, useCallback, useContext, useState } from 'react';

import { noop } from '@polkadot/util';

import { AccountContext, GradientDivider, Identity2, VariantButton } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { SharePopup } from '../../../../partials';
import { getFormattedAddress } from '../../../../util/utils';
import PRadio from '../../components/Radio';

interface ChooseAccountMenuProps {
  genesisHash: string | undefined;
  handleClose: () => void;
  isBlueish: boolean | undefined
  openMenu: boolean;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
}

const AccountListToChoose = ({ genesisHash, handleClose, isBlueish, openMenu, setSpecificAccount, specificAccount }: ChooseAccountMenuProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);
  const { chain } = useChainInfo(genesisHash, true);

  const handleSelect = useCallback((selectedAccount: string) => () => {
    setSpecificAccount(selectedAccount);
  }, [setSpecificAccount]);

  return (
    <SharePopup
      modalProps={{ maxHeight: 564 }}
      onClose={handleClose}
      open={openMenu}
      popupProps={{
        TitleIcon: UserOctagon,
        darkBackground: true,
        iconColor: theme.palette.text.highlight,
        iconSize: 26,
        maxHeight: '460px',
        withoutTopBorder: true
      }}
      title={t('Accounts')}
    >
      <Stack direction='column' sx={{ height: '460px', position: 'relative', rowGap: '24px', width: '100%' }}>
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} letterSpacing='1px' textTransform='uppercase' variant='S-1' width='fit-content'>
          {t('My Accounts')}
        </Typography>
        <Stack direction='column' sx={{ maxHeight: '390px', mb: '65px', overflowY: 'auto', rowGap: '12px' }}>
          {accounts.map(({ address }, index) => {
            const formatted = getFormattedAddress(address, chain, chain?.ss58Format ?? 0);
            const checked = formatted === specificAccount;

            return (
              <Fragment key={index}>
                <Container disableGutters key={address} onClick={handleSelect(formatted)} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Identity2
                    address={address}
                    addressStyle={{ color: isBlueish ? '#809ACB' : 'primary.main' }}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={24}
                    style={{
                      color: checked ? isBlueish ? '#3988FF' : 'warning.main' : 'text.primary',
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
              </Fragment>
            );
          })}
        </Stack>
        <VariantButton
          isBlueish={isBlueish}
          onClick={handleClose}
          style={{ bottom: '10px', height: '44px', left: '0', position: 'absolute', right: '0', width: '100%' }}
          text={t('Close')}
        />
      </Stack>
    </SharePopup>
  );
};

interface Props {
  isBlueish: boolean| undefined;
  genesisHash: string | undefined;
  setSpecificAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  specificAccount: string | undefined;
}

export default function ChooseAccount ({ genesisHash, isBlueish, setSpecificAccount, specificAccount }: Props): React.ReactElement {
  const theme = useTheme();

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const handleToggleMenu = useCallback(() => setOpenMenu((isMenuOpen) => !isMenuOpen), []);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px' }}>
        <Identity2
          address={specificAccount}
          addressStyle={{ color: isBlueish ? '#809ACB' : 'primary.main', fontSize: '12px', fontWeight: 500 }}
          genesisHash={genesisHash ?? ''}
          identiconSize={36}
          style={{ addressVariant: 'B-4', 'div div#socials': { mt: 0 }, variant: 'B-2' }}
          withShortAddress
        />
        <ArrowCircleDown color={ isBlueish ? theme.palette.text.highlight : theme.palette.primary.main } onClick={handleToggleMenu} size='32' style={{ cursor: 'pointer' }} variant='Bulk' />
      </Container>
      <AccountListToChoose
        genesisHash={genesisHash}
        handleClose={handleToggleMenu}
        isBlueish={isBlueish}
        openMenu={openMenu}
        setSpecificAccount={setSpecificAccount}
        specificAccount={specificAccount}
      />
    </>
  );
}
