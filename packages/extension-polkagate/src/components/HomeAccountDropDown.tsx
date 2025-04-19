// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { DropdownOption } from '../util/types';

import { ClickAwayListener, Grid, Popover, styled, type SxProps, type Theme, Typography } from '@mui/material';
import { AddCircle, ArrowDown2, Broom, ExportCurve, ImportCurve, Setting, User } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useTranslation } from '../hooks';
import { GradientDivider } from '../style';

const DropSelectContainer = styled(Grid)(({ focused }: { focused: boolean }) => ({
  ':hover': { background: '#674394' },
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  background: focused ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#1B133C',
  borderRadius: '12px',
  boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
  columnGap: '2px',
  cursor: 'pointer',
  justifyContent: 'center',
  transition: 'all 250ms ease-out'
}));

const DropContentContainer = styled(Grid)(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '300px',
  minWidth: '222px',
  overflowY: 'scroll',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

interface Options extends DropdownOption {
  Icon?: Icon;
}

interface ContentDisplayProps {
  Icon?: Icon;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string | number;
  value: string | number;
}

function LogoContentDisplay ({ Icon, setOpen, text, value }: ContentDisplayProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    setOpen(false);
    navigate(value as string);
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
        <Typography color='text.primary' variant='B-2' sx={{ textWrap: 'nowrap' }}>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
}

interface DropContentProps {
  contentDropWidth?: number | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
  Icon?: Icon;
  displayContentType?: 'logo' | 'text' | 'icon';
  options: Options[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  withDivider: boolean;
}

function DropContent ({ containerRef, contentDropWidth, open, options, setOpen, withDivider }: DropContentProps) {
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
        {options.map(({ Icon, text, value }, index) => {
          const isLastOne = options.length === index + 1;

          return (
            <>
              <LogoContentDisplay
                Icon={Icon}
                key={index}
                setOpen={setOpen}
                text={text}
                value={value}
              />
              {withDivider && !isLastOne &&
                <GradientDivider style={{ my: '3px' }} />
              }
            </>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  disabled?: boolean;
  displayContentType?: 'icon' | 'logo' | 'text';
  Icon?: Icon;
  options?: Options[];
  style?: SxProps<Theme>;
  withDivider?: boolean;
}

function HomeAccountDropDown ({ Icon, disabled, displayContentType = 'text', options, style, withDivider = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const _options = useMemo(() => {
    const OPTIONS = [
      {
        Icon: AddCircle,
        text: t('Create new account'),
        value: '/account/create'
      },
      {
        Icon: ImportCurve,
        text: t('Import account'),
        value: '/account/have-wallet'
      },
      {
        Icon: Setting,
        text: t('Settings'),
        value: '/account/create'
      },
      {
        Icon: Broom,
        text: t('Derive from accounts'),
        value: '/account/create'
      },
      {
        Icon: ExportCurve,
        text: t('Export all accounts'),
        value: '/account/create'
      }
    ];

    return options || OPTIONS;
  }, [options, t]);

  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <User color={open ? '#EAEBF1' : '#AA83DC'} size='18' variant='Bulk' />
          <ArrowDown2 color={open ? '#EAEBF1' : '#AA83DC'} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropContent
        Icon={Icon}
        containerRef={containerRef}
        displayContentType={displayContentType}
        open={open}
        options={_options}
        setOpen={setOpen}
        withDivider={withDivider}
      />
    </>
  );
}

export default HomeAccountDropDown;
