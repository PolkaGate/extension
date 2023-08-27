// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LinkOption } from '@polkadot/apps-config/endpoints/types';
import type { ParaId } from '@polkadot/types/interfaces';

import { useEffect, useState } from 'react';

import { createWsEndpoints } from '@polkadot/apps-config';
import { isNumber } from '@polkadot/util';

import { useApi, useEndpoint } from '.';

interface Teleport {
  allowTeleport: boolean;
  destinations: LinkOption[];
  isParaTeleport?: boolean;
  isRelayTeleport?: boolean;
  oneWay: number[]
}

interface ExtLinkOption extends LinkOption {
  teleport: number[];
}

const DEFAULT_STATE: Teleport = {
  allowTeleport: false,
  destinations: [],
  oneWay: []
};

const endpoints = createWsEndpoints((k, v) => v?.toString() || k).filter((v): v is ExtLinkOption => !!v.teleport);

function extractRelayDestinations(relayGenesis: string, filter: (l: ExtLinkOption) => boolean): ExtLinkOption[] {
  return endpoints
    .filter((l) =>
      (
        l.genesisHashRelay === relayGenesis ||
        l.genesisHash === relayGenesis
      ) && filter(l)
    )
    .reduce((result: ExtLinkOption[], curr): ExtLinkOption[] => {
      const isExisting = result.some(({ genesisHash, paraId }) =>
        paraId === curr.paraId ||
        (genesisHash && genesisHash === curr.genesisHash)
      );

      if (!isExisting) {
        result.push(curr);
      }

      return result;
    }, [])
    .sort((a, b) =>
      a.isRelay === b.isRelay
        ? 0
        : a.isRelay
          ? -1
          : 1
    );
}

export default function useTeleport(address: string | undefined): Teleport {
  const api = useApi(address);
  const endpointUrl = useEndpoint(address);

  const [state, setState] = useState<Teleport>(() => ({ ...DEFAULT_STATE }));
  const [paraId, setParaId] = useState<ParaId>();

  const [firstEndpoint, setFirstEndpoint] = useState<ExtLinkOption | undefined>(undefined);
  const [secondEndpoint, setSecondEndpoint] = useState<ExtLinkOption | undefined>(undefined);

  useEffect((): void => {
    api && api.query.parachainInfo && api.query.parachainInfo.parachainId().then(setParaId);
  }, [api]);

  useEffect((): void => {
    if (api) {
      const relayGenesis = api.genesisHash.toHex();
      const endpoint = endpoints.find(({ genesisHash }) => genesisHash === relayGenesis);

      setFirstEndpoint(endpoint);

      if (endpoint) {
        const destinations = extractRelayDestinations(relayGenesis, ({ paraId }) =>
          isNumber(paraId) &&
          endpoint.teleport.includes(paraId)
        );
        const oneWay = extractRelayDestinations(relayGenesis, ({ paraId, teleport }) =>
          isNumber(paraId) &&
          !teleport.includes(-1)
        ).map(({ paraId }) => paraId || -1);

        setState({
          allowTeleport: destinations.length !== 0,
          destinations,
          isRelayTeleport: true,
          oneWay
        });
      }
    }
  }, [api]);

  useEffect((): void => {
    if (!paraId || !endpointUrl) {
      return;
    }

    const endpoint = endpoints.find(({ value }) => value === endpointUrl);

    setSecondEndpoint(endpoint);

    if (endpoint?.genesisHashRelay) {
      const destinations = extractRelayDestinations(endpoint.genesisHashRelay, ({ paraId }) =>
        endpoint.teleport.includes(isNumber(paraId) ? paraId : -1)
      );
      const oneWay = extractRelayDestinations(endpoint.genesisHashRelay, ({ paraId, teleport }) =>
        !teleport.includes(isNumber(paraId) ? paraId : -1)
      ).map(({ paraId }) => paraId || -1);

      setState({
        allowTeleport: destinations.length !== 0,
        destinations,
        isParaTeleport: true,
        oneWay
      });
    }
  }, [endpointUrl, paraId]);

  useEffect((): void => {
    if (!firstEndpoint && !secondEndpoint) {
      setState({ ...DEFAULT_STATE });
    }
  }, [firstEndpoint, secondEndpoint]);

  return state;
}
