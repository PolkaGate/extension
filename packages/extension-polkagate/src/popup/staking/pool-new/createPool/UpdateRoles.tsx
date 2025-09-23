// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleLeft2, ArrowCircleRight2, Mirror } from 'iconsax-react';
import React, { type SetStateAction, useCallback, useMemo, useState } from 'react';

import { AddressInput } from '../../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../../hooks';
import { SharePopup } from '../../../../partials';
import PolkaGateIdenticon from '../../../../style/PolkaGateIdenticon';
import { toShortAddress } from '../../../../util';
import StakingActionButton from '../../partial/StakingActionButton';

export interface RolesState {
  bouncer: string | undefined;
  depositor: string;
  nominator: string | undefined;
  root: string | undefined;
}

export const updateRoleReducer = (state: RolesState, payload: Partial<RolesState>): RolesState => {
  return { ...state, ...payload };
};

interface ChangeRolesProp {
  handleClose: () => void;
  openMenu: boolean;
  setRoles: React.Dispatch<Partial<RolesState>>;
  roles: RolesState;
  color: string;
}

const ChangeRoles = ({ color, handleClose, openMenu, roles, setRoles }: ChangeRolesProp) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const nominatorChangeHandler = useCallback((input: SetStateAction<string | null | undefined>) => {
    const nominator = (input || undefined) as string | undefined;

    setRoles({ nominator });
  }, [setRoles]);

  const bouncerChangeHandler = useCallback((input: SetStateAction<string | null | undefined>) => {
    const bouncer = (input || undefined) as string | undefined;

    setRoles({ bouncer });
  }, [setRoles]);

  return (
    <SharePopup
      onClose={handleClose}
      open={openMenu}
      popupProps={{
        TitleIcon: Mirror,
        darkBackground: true,
        iconColor: theme.palette.text.highlight,
        iconSize: 26,
        style: { '> div#container': { pt: '10px' } },
        withoutTopBorder: true
      }}
      title={t('Update roles')}
    >
      <Stack direction='column' sx={{ gap: '8px', height: '440px', position: 'relative', pt: '25px', width: '100%' }}>
        <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '12px 15px' }}>
          <Container disableGutters sx={{ display: 'flex', gap: '6px' }}>
            <ArrowCircleRight2 color={color} size='22' variant='Bulk' />
            <Typography color='text.primary' variant='B-1'>
              {t('Nominator')}
            </Typography>
          </Container>
          <AddressInput
            address={roles.nominator}
            placeHolder={t('Enter Nominator address')}
            setAddress={nominatorChangeHandler}
            style={{ m: '8px auto 0', width: '100%' }}
          />
        </Stack>
        <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '12px 15px' }}>
          <Container disableGutters sx={{ display: 'flex', gap: '6px' }}>
            <ArrowCircleLeft2 color={color} size='22' variant='Bulk' />
            <Typography color='text.primary' variant='B-1'>
              {t('Bouncer')}
            </Typography>
          </Container>
          <AddressInput
            address={roles.bouncer}
            placeHolder={t('Enter Bouncer address')}
            setAddress={bouncerChangeHandler}
            style={{ m: '8px auto 0', width: '100%' }}
          />
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
          text={t('Update')}
        />
      </Stack>
    </SharePopup>
  );
};

interface Props {
  address: string;
  setRoles: React.Dispatch<Partial<RolesState>>;
  roles: RolesState;
}

export default function UpdateRoles ({ address, roles, setRoles }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const color = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

  const toggleMenu = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);

  return (
    <>
      <Stack direction='column' sx={{ bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', gap: '8px', p: '15px', pb: isExtension ? '5px' : '15px', pr: '5px' }}>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '6px' }}>
          <Mirror color={color} size='22' variant='Bulk' />
          <Typography color='text.primary' variant='B-1'>
            {t('Roles')}
          </Typography>
        </Container>
        <Typography color={isExtension ? 'text.highlight' : 'text.secondary'} textAlign='left' variant='B-4'>
          {t('All the roles (Depositor, Root, Nominator, and Bouncer) are set the following ID by default although you can update the Nominator and Bouncer by clicking')}
          <Typography color={color} onClick={toggleMenu} sx={{ bgcolor: isExtension ? '#809ACB26' : '#2D1E4A', borderRadius: '6px', cursor: 'pointer', ml: '4px', p: '2px 4px' }} variant='B-5'>
            {t('Update roles')}
          </Typography>
        </Typography>
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#2224424D', border: '1px solid #2E2B52', borderRadius: '12px', display: 'flex', gap: '6px', mr: '10px', p: '10px', width: 'calc(100% - 10px)' }}>
          <PolkaGateIdenticon
            address={address}
            size={24}
          />
          <Typography color={color} variant='B-4'>
            {toShortAddress(address, 8)}
          </Typography>
        </Container>
      </Stack>
      <ChangeRoles
        color={color}
        handleClose={toggleMenu}
        openMenu={openMenu}
        roles={roles}
        setRoles={setRoles}
      />
    </>
  );
}
