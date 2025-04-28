// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { ExpandMore } from '@mui/icons-material';
import { Box, ClickAwayListener, Grid, Popover, Stack, styled, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import useProfileInfo from '@polkadot/extension-polkagate/src/fullscreen/home/useProfileInfo';

import { useAccountsOrder, useProfileAccounts, useProfiles, useSelectedProfile, useTranslation } from '../../hooks';
import { setStorage } from '../../util';

const DropContentContainer = styled(Grid)(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '400px',
  minWidth: '197px',
  overflowY: 'scroll',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

function Tab({ initialAccountList, label }: { initialAccountList: AccountsOrder[] | undefined, label: string }): React.ReactElement {
  const { t } = useTranslation();
  const profileAccounts = useProfileAccounts(initialAccountList, label);
  const selectedProfile = useSelectedProfile();
  const profileInfo = useProfileInfo(label);

  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);

  const isSelected = selectedProfile === label;

  const onClick = useCallback(() => {
    setStorage('profile', label).catch(console.error);
  }, [label]);

  return (
    <Stack
      alignItems='center' columnGap='5px' direction='row' justifyContent='space-between'
      onClick={onClick} onMouseEnter={toggleHover} onMouseLeave={toggleHover}
      sx={{ backgroundColor: hovered ? '#6743944D' : 'transparent', borderRadius: '8px', cursor: 'pointer', height: '40px', px: '5px', width: '100%' }}
    >
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start'>
        <profileInfo.Icon color={isSelected || hovered ? '#FF4FB9' : '#AA83DC'} size='18' variant='Bulk' />
        <Typography color={hovered ? '#FF4FB9' : '#EAEBF1'} sx={{ textWrap: 'nowrap', transition: 'all 250ms ease-out' }} variant='B-2'>
          {t(label)}
        </Typography>
      </Stack>
      <Box alignItems='center' justifyContent='center' sx={{ background: isSelected ? '#05091C' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '1024px', display: 'flex', height: '20px', minWidth: '20px' }}>
        <Typography color='#EAEBF1' variant='B-1'>
          {profileAccounts?.length ?? 0}
        </Typography>
      </Box>
    </Stack>
  );
}

interface DropContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  contentDropWidth?: number | undefined;
  open: boolean;
  options: string[];
  initialAccountList: AccountsOrder[] | undefined
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DropContent({ containerRef, contentDropWidth, initialAccountList, open, options, setOpen }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      id={id}
      open={open}
      slotProps={{
        paper: {
          sx: {
            background: 'none',
            backgroundImage: 'none'
          }
        }
      }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {options.map((label, index) => {
          return (
            <Tab
              initialAccountList={initialAccountList}
              key={index}
              label={label}
            />
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  open: boolean;
  style?: SxProps<Theme>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function ProfilesDropDown({open, setOpen, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const initialAccountList = useAccountsOrder(true);
  const { defaultProfiles, userDefinedProfiles } = useProfiles();
  const selectedProfile = useSelectedProfile();
  const profileAccounts = useProfileAccounts(initialAccountList, selectedProfile);

  const [hovered, setHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
  }, [defaultProfiles, userDefinedProfiles]);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grid
          alignItems='center'
          container item justifyContent='center' onClick={toggleOpen}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          ref={containerRef}
          sx={{ cursor: 'pointer', gap: '4px', width: 'fit-content', ...style }}
        >
          <Typography sx={{ lineHeight: '100%', textTransform: 'uppercase' }} variant='H-3'>
            {`${selectedProfile} accounts`}
          </Typography>
          <Box sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '50%', display: 'flex', justifyContent: 'center', minWidth: '20px', height: '20px' }}>
            <Typography fontWeight={700} variant='B-1'>
              {profileAccounts?.length}
            </Typography>
          </Box>
          <ExpandMore sx={{ color: open || hovered ? '#FF4FB9' : '#FFFFFF', fontSize: '30px', ml: '-5px', transform: open ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out' }} />
        </Grid>
      </ClickAwayListener>
      <DropContent
        containerRef={containerRef}
        initialAccountList={initialAccountList}
        open={open}
        options={profilesToShow}
        setOpen={setOpen}
      />
    </>
  );
}

export default ProfilesDropDown;
