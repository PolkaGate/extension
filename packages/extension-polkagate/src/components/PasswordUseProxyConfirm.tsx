// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, SxProps, Theme, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useAccount, useCanPayFee, useMetadata, useTranslation } from '../hooks';
import SelectProxy from '../partials/SelectProxy';
import { Proxy, ProxyItem, ProxyTypes } from '../util/types';
import { Identity, Password, PButton, Warning } from '.';

interface Props {
  api: ApiPromise | undefined;
  estimatedFee?: BN;
  confirmDisabled?: boolean;
  confirmText?: string
  disabled?: boolean;
  isPasswordError?: boolean;
  label: string;
  onChange: React.Dispatch<React.SetStateAction<string | undefined>>
  proxiedAddress: string | AccountId | undefined;
  genesisHash: string | undefined;
  prevState?: Record<string, any>;
  proxyTypeFilter: ProxyTypes[];
  style?: SxProps<Theme>;
  proxies: ProxyItem[] | undefined
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  selectedProxy: Proxy | undefined;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirmClick: () => Promise<void>
}

export default function PasswordUseProxyConfirm({ confirmDisabled, confirmText, disabled, estimatedFee, genesisHash, isPasswordError, label = '', onChange, onConfirmClick, prevState, proxiedAddress, proxies, proxyTypeFilter, selectedProxy, setIsPasswordError, setSelectedProxy, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const canPayFee = useCanPayFee(selectedProxy?.delegate || proxiedAddress, estimatedFee);
  const account = useAccount(proxiedAddress);
  const chain = useMetadata(genesisHash, true);
  const [password, setPassword] = useState<string>();
  const [showSelectProxy, setShowSelectProxy] = useState<boolean>(false);
  const mustSelectProxy = useMemo(() => account?.isExternal && !selectedProxy, [account, selectedProxy]);

  const _onChange = useCallback(
    (pass: string): void => {
      pass.length > 3 && pass && setPassword(pass);
      pass.length > 3 && pass && setIsPasswordError && setIsPasswordError(false);
    }, [setIsPasswordError]
  );

  const goToSelectProxy = useCallback(
    (): void => {
      setShowSelectProxy(true);
    }, [setShowSelectProxy]
  );

  useEffect(() => {
    onChange(password);
  }, [password, onChange]);

  return (
    <>
      <Grid container>
        {mustSelectProxy
          ? <>
            <Grid container item sx={{ bottom: '80px', position: 'absolute' }}>
              <Warning
                fontWeight={300}
                theme={theme}
              >
                {t('This is an Address Only account. You must use a proxy to complete this transaction.')}
              </Warning>
            </Grid>
            <PButton
              _onClick={goToSelectProxy}
              text={t<string>('Use Proxy')}
            />
          </>
          : canPayFee === false
            ? <Grid container item sx={{ bottom: '50px', position: 'absolute' }}>
              <Warning
                fontWeight={300}
                theme={theme}
              >
                {t('This account doesn\'t have enough available balance to pay the transaction fee.')}
              </Warning>
            </Grid>
            : <>
              <Grid alignItems='center' container sx={{ ...style }}>
                <Grid item xs={proxies?.length ? 8 : 12}>
                  <Password
                    disabled={disabled}
                    isError={isPasswordError}
                    isFocused={true}
                    label={label}
                    onChange={_onChange}
                    onEnter={onConfirmClick}
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
              <PButton
                _onClick={onConfirmClick}
                disabled={!password || isPasswordError || confirmDisabled}
                text={confirmText ?? t<string>('Confirm')}
              />
            </>
        }
      </Grid>
      <SelectProxy
        genesisHash={genesisHash}
        proxiedAddress={proxiedAddress}
        proxies={proxies}
        proxyTypeFilter={proxyTypeFilter}
        selectedProxy={selectedProxy}
        setSelectedProxy={setSelectedProxy}
        setShow={setShowSelectProxy}
        show={showSelectProxy}
      />
    </>
  );
}
