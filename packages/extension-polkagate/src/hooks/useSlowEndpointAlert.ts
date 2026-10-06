// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useTranslation } from '.';
import { AUTO_MODE } from '../util/constants';
import useAlerts from './useAlerts';
import useEndpoint from './useEndpoint';
import useSlowEndpoint from './useSlowEndpoint';

/**
 * Fires a persistent, actionable "Switch Endpoint" alert when the user's
 * manually-pinned endpoint is unreachable or an RPC call is hanging.
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
  const { endpoint } = useEndpoint(genesisHash);
  const isManualEndpoint = !!endpoint && endpoint !== AUTO_MODE.value;
  const isSlowEndpoint = useSlowEndpoint(genesisHash, api, isFetching);

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

    if (!isSlowEndpoint || !isManualEndpoint) {
      return;
    }

    removeRef.current = notify(
      t('Your selected node may be unreachable. Try switching to auto mode or another endpoint.'),
      'warning',
      true,
      { label: t('Switch Endpoint'), onClick: onSwitchEndpoint }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlowEndpoint, isManualEndpoint]);

  // Clean up alert on unmount
  useEffect(() => {
    return () => {
      removeRef.current();
    };
  }, []);
}
