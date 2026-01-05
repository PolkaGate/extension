// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Popover, styled } from '@mui/material';
import React from 'react';

import { GradientDivider } from '../style';
import DropMenuRow, { type Options } from './DropMenuRow';

const DropContentContainer = styled(Grid, { shouldForwardProp: (prop) => prop !== 'preferredWidth' })(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
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
  overflow: 'hidden',
  overflowY: 'auto',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

interface Props {
  contentDropWidth?: number | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  options: Options[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  withDivider?: boolean;
}

function DropMenuContent({ containerRef, contentDropWidth, open, options, setOpen, withDivider }: Props) {
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
        {options.map((option, index) => {
          const isLastOne = options.length === index + 1;
          const key = `option-${index}-${option.text ?? 'line'}`;

          return (
            <React.Fragment key={key}>
              {option.isLine
                ? <GradientDivider style={{ my: '3px' }} />
                : (
                  <DropMenuRow
                    option={option}
                    setOpen={setOpen}
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

export default React.memo(DropMenuContent);
