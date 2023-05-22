// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { Identity, Password, PButton, TwoButtons, Warning } from '../../../components';
import { useAccount, useTranslation } from '../../../hooks';
import { Proxy, ProxyItem, ProxyTypes } from '../../../util/types';
import { STEPS } from '../post/castVote';

interface Props {
  chain: Chain | null | undefined;
  disabled?: boolean;
  isPasswordError?: boolean;
  label: string;
  onChange: React.Dispatch<React.SetStateAction<string | undefined>>
  onPrimaryClick: () => Promise<void>
  onSecondaryClick: () => void;
  primaryBtn?: boolean;
  primaryBtnText?: string
  prevState?: Record<string, any>;
  proxiedAddress: string | AccountId | undefined;
  proxies: ProxyItem[] | undefined
  proxyTypeFilter: ProxyTypes[];
  secondaryBtnText?: string
  selectedProxy: Proxy | undefined;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
  showBackButtonWithUseProxy?: boolean;
}

export default function PasswordWithTwoButtonsAndUseProxy({ chain, disabled, isPasswordError, label = '', onChange, onPrimaryClick, onSecondaryClick, prevState, primaryBtn, primaryBtnText, proxiedAddress, proxies, secondaryBtnText, selectedProxy, setIsPasswordError, setStep, showBackButtonWithUseProxy = true }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(proxiedAddress);
  const [password, setPassword] = useState<string>();
  const mustSelectProxy = useMemo(() => account?.isExternal && !selectedProxy, [account, selectedProxy]);

  const _onChange = useCallback(
    (pass: string): void => {
      pass.length > 3 && pass && setPassword(pass);
      pass.length > 3 && pass && setIsPasswordError && setIsPasswordError(false);
    }, [setIsPasswordError]
  );

  const goToSelectProxy = useCallback(() => {
    setStep && setStep(STEPS.PROXY);
  }, [setStep]);

  const onBack = useCallback(() => {
    setStep && setStep(STEPS.INDEX);
  }, [setStep]);

  useEffect(() => {
    onChange(password);
  }, [password, onChange]);

  return (
    <Grid container>
      {mustSelectProxy
        ? <>
          <Grid container height='50px' item sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
            <Warning
              fontWeight={300}
              theme={theme}
            >
              {t('This is an Address Only account. You must use a proxy to complete this transaction.')}
            </Warning>
          </Grid>
          {showBackButtonWithUseProxy
            ? <TwoButtons
              mt='5px'
              onPrimaryClick={goToSelectProxy}
              onSecondaryClick={onBack}
              primaryBtnText={t<string>('Use Proxy')}
              secondaryBtnText={t<string>('Back')}
            />
            : <PButton
              _ml={0}
              _mt='5px'
              _onClick={goToSelectProxy}
              _width={100}
              text={t<string>('Use Proxy')}
            />
          }
        </>
        : <>
          <Grid alignItems='center' container item>
            <Grid item xs>
              <Password
                disabled={disabled}
                isError={isPasswordError}
                isFocused={true}
                label={label}
                onChange={_onChange}
                onEnter={onPrimaryClick}
              />
            </Grid>
            {(!!proxies?.length || prevState?.selectedProxyAddress) &&
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
                      },
                      visibility: selectedProxy ? 'visible' : 'hidden'
                    }
                  },
                  tooltip: {
                    sx: {
                      '& .MuiTooltip-arrow': {
                        color: '#fff',
                        height: '10px'
                      },
                      backgroundColor: '#fff',
                      color: '#000',
                      fontWeight: 400
                    }
                  }
                }}
                leaveDelay={300}
                placement='top-start'
                sx={{ width: 'fit-content' }}
                title={
                  <>
                    {selectedProxy &&
                      <Identity
                        chain={chain}
                        formatted={selectedProxy?.delegate}
                        identiconSize={30}
                        style={{ fontSize: '14px' }}
                      />
                    }
                  </>
                }
              >
                <Grid aria-label='useProxy' item onClick={goToSelectProxy} pl='10px' pt='10px' role='button' sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}              >
                  {selectedProxy ? t('Update proxy') : t('Use proxy')}
                </Grid>
              </Tooltip>
            }
          </Grid>
          <Grid alignItems='center' container item sx={{ '> div': { m: 0, width: '100%' }, pt: '15px' }}>
            <TwoButtons
              disabled={!password || isPasswordError || primaryBtn}
              mt='8px'
              onPrimaryClick={onPrimaryClick}
              onSecondaryClick={onSecondaryClick}
              primaryBtnText={primaryBtnText ?? t<string>('Confirm')}
              secondaryBtnText={secondaryBtnText ?? t<string>('Back')}
            />
          </Grid>
        </>
      }
    </Grid>
  );
}
