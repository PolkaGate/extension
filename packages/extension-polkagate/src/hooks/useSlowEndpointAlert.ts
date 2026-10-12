// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useTranslation } from '.';
import useAlerts from './useAlerts';
import useSlowEndpoint from './useSlowEndpoint';

/**
 * Fires a persistent, actionable alert when an endpoint is unreachable or hanging:
 * - Manual endpoint: "Switch Endpoint" action → opens endpoint settings.
 * - Auto mode: informational warning that auto selection failed, same action to pick manually.
 * Automatically removes the alert when the endpoint changes or API resolves.
 *
 * @param genesisHash  Active chain's genesis hash
 * @param api          Current ApiPromise (undefined = connecting, null = no endpoints)
 * @param isFetching   Pass true when an RPC call is pending on a connected api
 * @param onOpenModal  Optional: called when the action button is clicked in fullscreen
 *                     (opens an Endpoints modal). When omitted, navigates to /endpoints/:genesisHash.
 */
export default function useSlowEndpointAlert(
  genesisHash: string | null | undefined,
  api: ApiPromise | null | undefined,
  isFetching?: boolean,
  onOpenModal?: () => void
): void {
  const { t } = useTranslation();
  const { notify } = useAlerts();
  const navigate = useNavigate();
  const slowKind = useSlowEndpoint(genesisHash, api, isFetching);

  // Keep a stable ref to onOpenModal so the action onClick stays current
  const onOpenModalRef = useRef(onOpenModal);

  useEffect(() => {
    onOpenModalRef.current = onOpenModal;
  }, [onOpenModal]);

  // Holds the remove-callback returned by notify so we can dismiss on recovery
  const removeRef = useRef<() => void>(noop);

  const onSwitchEndpoint = useCallback(() => {
    if (!genesisHash) {
      return;
    }

    // Dismiss the alert immediately before opening endpoint settings
    removeRef.current();
    removeRef.current = noop;

    if (onOpenModalRef.current) {
      onOpenModalRef.current();
    } else {
      navigate(`/endpoints/${genesisHash}`);
    }
  }, [genesisHash, navigate]);

  useEffect(() => {
    // Always clear previous alert first
    removeRef.current();
    removeRef.current = noop;

    if (!slowKind) {
      return;
    }

    const message = slowKind === 'auto'
      ? t('Unable to reach any node. Check your internet connection or add a working endpoint for this chain.')
      : t('Your selected node may be unreachable. Try switching to auto mode or choosing another endpoint.');

    removeRef.current = notify(
      message,
      'warning',
      true,
      { label: t('Switch Endpoint'), onClick: onSwitchEndpoint }
    );
  }, [slowKind, notify, onSwitchEndpoint, t]);

  // Clean up alert on unmount
  useEffect(() => {
    return () => {
      removeRef.current();
    };
  }, []);
}
