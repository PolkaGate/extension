// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Info as InfoIcon, QuestionMark as QuestionIcon } from '@mui/icons-material';
import { Grid, Tooltip, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  text: NonNullable<React.ReactNode> | string | null | undefined;
  children: React.ReactElement<any, any>;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end' | 'bottom-start' | 'left-end' | 'left-start' | 'right-end' | 'right-start' | 'top-end' | 'top-start' | undefined
  showQuestionMark?: boolean;
  showInfoMark?: boolean;
  showWarningMark?: boolean;
  fontSize?: string;
}

function Infotip2({ children, fontSize = '14px', placement = 'top', showInfoMark = false, showQuestionMark = false, showWarningMark, text }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Grid item style={{ alignItems: 'center', display: 'flex' }}>
      {showQuestionMark || showInfoMark || showWarningMark
        ? <>
          <div>
            {children}
          </div>
          <Tooltip
            arrow
            componentsProps={{
              popper: {
                sx: {
                  '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                    mb: '3px',
                    p: '3px 15px'
                  },
                  '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                    mb: '3px',
                    p: '3px 15px'
                  }
                }
              },
              tooltip: {
                sx: {
                  '& .MuiTooltip-arrow': {
                    color: 'text.primary',
                    height: '10px'
                  },
                  backgroundColor: 'text.primary',
                  color: 'text.secondary',
                  fontSize,
                  fontWeight: 400
                }
              }
            }}
            enterDelay={500}
            // enterNextDelay={7000}
            leaveDelay={500}
            placement={placement}
            title={text || ''}
          >
            {showQuestionMark
              ? <QuestionIcon
                sx={{
                  bgcolor: 'secondary.light',
                  borderRadius: '50%',
                  color: 'background.default',
                  height: '13px',
                  ml: '5px',
                  width: '13px'
                }}
              />
              : showInfoMark
                ? <InfoIcon
                  sx={{
                    bgcolor: 'secondary.light',
                    borderRadius: '50%',
                    color: 'background.default',
                    height: '15px',
                    ml: '5px',
                    width: '15px'
                  }}
                />
                : <FontAwesomeIcon
                  color={theme.palette.secondary.light}
                  icon={faExclamationTriangle}
                  style={{ paddingLeft: '7px', fontSize: '17px' }}
                />
            }
          </Tooltip>
        </>
        : <Tooltip
          arrow
          componentsProps={{
            popper: {
              sx: {
                '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                  mb: '3px',
                  p: '3px 15px'
                },
                '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                  mb: '3px',
                  p: '3px 15px'
                }
              }
            },
            tooltip: {
              sx: {
                '& .MuiTooltip-arrow': {
                  color: 'text.primary',
                  height: '10px'
                },
                backgroundColor: 'text.primary',
                color: 'text.secondary',
                fontSize,
                fontWeight: 400
              }
            }
          }}
          enterDelay={500}
          // enterNextDelay={7000}
          leaveDelay={500}
          placement={placement}
          title={text || ''}
        >
          {children}
        </Tooltip>
      }
    </Grid>
  );
}

export default React.memo(Infotip2);
