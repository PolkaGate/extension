// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { ApiPromise } from '@polkadot/api';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, ProxyTypes } from '../util/types';

import { Grid, type SxProps, type Theme, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAccount, useCanPayFee, useMetadata, useTranslation } from '../hooks';
import SelectProxy from '../partials/SelectProxy';
import { noop } from '../util/utils';
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

export default function PasswordUseProxyConfirm({ api, confirmDisabled, confirmText, disabled, estimatedFee, genesisHash, isPasswordError, label = '', onChange, onConfirmClick, prevState, proxiedAddress, proxies, proxyTypeFilter, selectedProxy, setIsPasswordError, setSelectedProxy, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const canPayFee = useCanPayFee(selectedProxy?.delegate || proxiedAddress as string, estimatedFee);
  const account = useAccount(proxiedAddress);
  const chain = useMetadata(genesisHash, true);
  const [password, setPassword] = useState<string>();
  const [showSelectProxy, setShowSelectProxy] = useState<boolean>(false);
  const mustSelectProxy = useMemo(() => account?.isExternal && !selectedProxy, [account, selectedProxy]);

  const proxiesToSelect = useMemo(() => proxies?.filter((proxy) => proxy.status !== 'new'), [proxies]);

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
                {t('This is a watch-only account. To complete this transaction, you must use a proxy.')}
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
                {t('This account lacks the required available balance to cover the transaction fee.')}
              </Warning>
            </Grid>
            : <>
              <Grid alignItems='center' container sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', ...style }}>
                <Grid item>
                  <Password
                    disabled={disabled}
                    isError={isPasswordError}
                    isFocused={true}
                    label={label}
                    onChange={_onChange}
                    onEnter={confirmDisabled ? noop : onConfirmClick}
                  />
                </Grid>
                {(!!proxiesToSelect?.length || prevState?.['selectedProxyAddress']) &&
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
                            api={api}
                            chain={chain}
                            formatted={selectedProxy?.delegate}
                            identiconSize={30}
                            showSocial={false}
                            style={{ fontSize: '14px' }}
                          />
                        }
                      </>
                    }
                  >
                    <Grid aria-label='useProxy' item onClick={goToSelectProxy} pl='5px' pt='10px' role='button' sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
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
        proxies={proxiesToSelect}
        proxyTypeFilter={proxyTypeFilter}
        selectedProxy={selectedProxy}
        setSelectedProxy={setSelectedProxy}
        setShow={setShowSelectProxy}
        show={showSelectProxy}
      />
    </>
  );
}
