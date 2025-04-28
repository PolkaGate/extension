// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { MoreVert } from '@mui/icons-material';
import { ClickAwayListener, Grid, Popover, styled, type SxProps, type Theme, Typography } from '@mui/material';
import { Data, DocumentUpload, Edit, LogoutCurve, Shield, Triangle, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useTranslation } from '../../hooks';
import { GradientDivider } from '../../style';
import RemoveAccount from './RemoveAccount';
import RenameAccount from './RenameAccount';


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
  minWidth: '222px',
  overflowY: 'scroll',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

interface Options {
  text?: string;
  value?: string | number | (() => void);
  Icon?: Icon;
  isLine?: boolean;
}

interface ContentDisplayProps {
  Icon?: Icon;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string | number;
  value: string | number | (() => void);
}

function LogoContentDisplay ({ Icon, setOpen, text, value }: ContentDisplayProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(async () => {
    setOpen(false);
    typeof value === 'function'
      ? value()
      : await navigate(value as string);
  }, [navigate, setOpen, value]);

  return (
    <Grid
      container
      item
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        '&:hover': { background: '#6743944D' },
        alignItems: 'center',
        background: 'transparent',
        borderRadius: '8px',
        columnGap: '5px',
        cursor: 'pointer',
        minWidth: '150px',
        padding: '10px 8px'
      }}
    >
      <Grid alignItems='center' container item sx={{ columnGap: '7px', flexWrap: 'nowrap' }} xs>
        {Icon &&
          <Icon size='18' style={{ color: hovered ? '#FF4FB9' : '#AA83DC' }} variant='Bulk' />
        }
        <Typography color='text.primary' sx={{ textWrap: 'nowrap' }} variant='B-2'>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
}

interface DropContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  contentDropWidth?: number | undefined;
  open: boolean;
  options: Options[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DropContent ({ containerRef, contentDropWidth, open, options, setOpen }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
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
      sx={{ mt: '16px' }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {options.map(({ Icon, isLine, text, value }, index) => {
          return (
            <>
              {isLine
                ? <GradientDivider style={{ my: '3px' }} />
                : text && value &&
                <LogoContentDisplay
                  Icon={Icon}
                  key={index}
                  setOpen={setOpen}
                  text={text}
                  value={value}
                />
              }
            </>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  address: string | undefined;
  disabled?: boolean;
  style?: SxProps<Theme>;
}

enum HOME_POPUP {
  RENAME,
  REMOVE
}

function AccountDropDown ({ address, disabled, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [hovered, setHovered] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [popup, setPopup] = useState<HOME_POPUP>();

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  const _options = useMemo(() => {
    return [
      {
        Icon: User,
        text: t('Manage Identity'),
        value: `/manageIdentity/${address}`
      },
      {
        Icon: Data,
        text: t('Manage proxies'),
        value: `/fullscreenProxyManagement/${address}`
      },
      {
        Icon: Shield,
        text: t('Social recovery'),
        value: `/socialRecovery/${address}/false`
      },
      {
        Icon: Triangle,
        text: t('NFT album'),
        value: `/nft/${address}`
      },
      {
        isLine: true
      },
      {
        Icon: DocumentUpload,
        text: t('Add to profile'),
        value: 'TBD'
      },
      {
        Icon: Edit,
        text: t('Rename'),
        value: () => setPopup(HOME_POPUP.RENAME)
      },
      {
        isLine: true
      },
      {
        Icon: LogoutCurve,
        text: t('Remove account'),
        value: () => setPopup(HOME_POPUP.REMOVE)
      }
    ];
  }, [address, t]);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
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
          sx={{ background: hovered || open ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', border: '3px solid #1B133C', borderRadius: '10px', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px', ...style }}
        >
          <MoreVert sx={{ color: hovered || open ? '#EAEBF1' : '#AA83DC', fontSize: '25px' }} />
        </Grid>
      </ClickAwayListener>
      <DropContent
        containerRef={containerRef}
        open={open}
        options={_options}
        setOpen={setOpen}
      />
      {
        popup === HOME_POPUP.RENAME &&
        <RenameAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
      {
        popup === HOME_POPUP.REMOVE &&
        <RemoveAccount
          address={address}
          open={popup}
          setPopup={setPopup}
        />
      }
    </>
  );
}

export default AccountDropDown;
