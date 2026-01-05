// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AdvancedDropdownOption } from '../util/types';

import { Avatar, Grid, Popover, styled, Typography } from '@mui/material';
import { Global } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { useIsDark } from '../hooks';
import { GradientDivider } from '../style';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import GlowCheck from './GlowCheck';

const DropContentContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'preferredWidth'
})(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '300px',
  overflow: 'hidden',
  overflowY: 'auto',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: preferredWidth ? `${preferredWidth}px` : 'fit-content'
}));

const ContentDisplayContainer = styled(Grid, { shouldForwardProp: (prop) => prop !== 'isSelectedItem' })(({ isSelectedItem, style }: { isSelectedItem: boolean, style: React.CSSProperties }) => ({
  '&:hover': { background: '#6743944D' },
  alignItems: 'center',
  background: isSelectedItem ? '#6743944D' : 'transparent',
  borderRadius: '8px',
  columnGap: '5px',
  cursor: 'pointer',
  minWidth: '150px',
  padding: '10px 8px',
  ...style
}));

interface ContentDisplayProps {
  Icon?: React.ElementType | React.JSX.Element;
  onChange?: (value: number | string) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  style?: React.CSSProperties
  text: string | number;
  value: string | number;
  logoType?: 'logo' | 'icon' | 'account' | 'iconOption' | undefined;
  showCheckAsIcon?: boolean;
}

function Logo ({ text }: { text: string }) {
  const isDark = useIsDark();
  const icon = getLogo(text);

  return (
    <Avatar
      src={icon}
      sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(text) && isDark) ? 'invert(1)' : 'none', height: 18, width: 18 }}
      variant='square'
    >
      {!icon &&
        <Global color='#AA83DC' size='18' variant='Bulk' />
      }
    </Avatar>
  );
}

function LogoContentDisplay ({ Icon, logoType, onChange, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, text, value }: ContentDisplayProps) {
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  const renderLogo = () => {
    if (logoType === 'account') {
      if (showCheckAsIcon && isSelectedItem) {
        return (
          <GlowCheck
            show={isSelectedItem}
            size='18px'
            timeout={100}
          />
        );
      }

      return (
        <PolkaGateIdenticon
          address={String(value)}
          size={18}
        />
      );
    }

    if (Icon) {
      if (React.isValidElement(Icon)) {
        return Icon;
      }

      if (typeof Icon === 'function' || typeof Icon === 'object') {
        const Component = Icon as React.ElementType;

        return <Component color='#BEAAD8' size='18' variant='Bulk' />;
      }
    }

    return <Logo text={text as string} />;
  };

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={{ justifyContent: 'space-between' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap' }} xs>
        {
          showCheckAsIcon && isSelectedItem
            ? (
              <GlowCheck
                show={isSelectedItem}
                size='15px'
                timeout={250}
              />)
            : renderLogo()
        }
        <Typography color={isSelectedItem ? '#FF4FB9' : 'text.primary'} textTransform='capitalize' variant='B-2'>
          {text}
        </Typography>
      </Grid>
      {
        !showCheckAsIcon &&
        <GlowCheck
          show={isSelectedItem}
          size='15px'
          timeout={100}
        />
      }
    </ContentDisplayContainer>
  );
}

function TextContentDisplay ({ onChange, selectedValue, setOpen, setSelectedValue, showCheckAsIcon = true, style = {}, text, value }: ContentDisplayProps) {
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={style}>
      {
        showCheckAsIcon &&
        <GlowCheck
          show={isSelectedItem}
          size='15px'
          timeout={250}
        />
      }
      <Typography color={isSelectedItem ? '#FF4FB9' : 'text.primary'} textTransform='capitalize' variant='B-2'>
        {text}
      </Typography>
    </ContentDisplayContainer>
  );
}

interface DropContentProps {
  contentDropWidth: number | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  Icon: React.ElementType | React.JSX.Element | undefined;
  displayContentType?: 'logo' | 'text' | 'icon' | 'account' | 'iconOption';
  options: AdvancedDropdownOption[];
  open: boolean;
  onChange?: (value: number | string) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  style?: React.CSSProperties;
  showCheckAsIcon?: boolean;
  withDivider: boolean;
}

function DropSelect ({ Icon, containerRef, contentDropWidth, displayContentType, onChange, open, options, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, style = {}, withDivider }: DropContentProps) {
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
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {options.map(({ Icon: IconOption, text, value }, index) => {
          const isLastOne = options.length === index + 1;

          return (
            <React.Fragment key={ index }>
              {displayContentType === 'text'
                ? (
                  <TextContentDisplay
                    key={index}
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    showCheckAsIcon={showCheckAsIcon}
                    style={style}
                    text={text}
                    value={value}
                  />)
                : (
                  <LogoContentDisplay
                    Icon={IconOption ?? Icon}
                    key={index}
                    logoType={displayContentType}
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    showCheckAsIcon={showCheckAsIcon}
                    text={text}
                    value={value}
                  />)
              }
              {withDivider && !isLastOne &&
                <GradientDivider style={{ my: '3px' }} />
              }
            </React.Fragment>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

export default DropSelect;
