// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletMultisigMultisig, PalletPreimageRequestStatus, PalletRecoveryRecoveryConfig, PalletReferendaReferendumInfoRankedCollectiveTally, PalletReferendaReferendumStatusRankedCollectiveTally, PalletSocietyBid, PalletSocietyCandidacy } from '@polkadot/types/lookup';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Option } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { ASSET_HUBS, PROXY_CHAINS } from '../util/constants';
import useActiveRecoveries from './useActiveRecoveries';
import { useInfo } from '.';
import { amountToHuman, amountToMachine } from '../util/utils';

type Item = 'identity' | 'proxy' | 'bounty' | 'recovery' | 'referenda' | 'index' | 'society' | 'multisig' | 'preimage' | 'assets';
export type Reserved = { [key in Item]?: Balance };

export default function useReservedDetails(address: string | undefined): Reserved {
  const { api, decimal, formatted, genesisHash } = useInfo(address);
  const activeRecoveries = useActiveRecoveries(api);
  const [reserved, setReserved] = useState<Reserved>({});

  const activeLost = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.lost === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
    , [activeRecoveries, formatted]);

  const toBalance = useCallback((value: BN) => {
    if (!api) {
      return undefined;
    }

    return api.createType('Balance', value);
  }, [api]);

  const setValue = useCallback((item: string, value: BN | null | undefined) => {
    setReserved((prev) => {
      const newState = { ...prev };

      newState[item] = value
        ? value.isZero() ? null : toBalance(value)
        : value;

      return newState;
    });
  }, [toBalance]);

  useEffect(() => {
    if (!api || !genesisHash) {
      return;
    }

    try {
      // TODO: needs to incorporate people chain?
      /** fetch identity  */
      if (api.query?.identity?.identityOf) {
        setValue('identity', undefined);

        api.query.identity.identityOf(formatted).then(async (id) => {
          const basicDeposit = api.consts.identity.basicDeposit as unknown as BN;
          const subAccountDeposit = api.consts.identity.subAccountDeposit as unknown as BN;

          const subs = await api.query.identity.subsOf(formatted);

          const subAccountsDeposit = (subs ? subs[0] : BN_ZERO) as unknown as BN;

          const sum = (basicDeposit.add(subAccountsDeposit)) as unknown as BN;

          setValue('identity', sum);
        }).catch((error) => {
          console.error(error);
          setValue('identity', null);
        });
      } else {
        setValue('identity', null);
      }

      /** fetch proxy  */
      if (api.query?.proxy && PROXY_CHAINS.includes(genesisHash)) {
        setValue('identity', undefined);

        api.query.proxy.proxies(formatted).then((p) => {
          const mayBeDeposit = p?.[1] as BN;

          setValue('proxy', mayBeDeposit);
        }).catch((error) => {
          console.error(error);
          setValue('proxy', null);
        });
      } else {
        setValue('proxy', null);
      }

      /** fetch social recovery  */
      if (api.query?.recovery) {
        setValue('recovery', undefined);

        api.query.recovery.recoverable(formatted).then((r) => {
          const recoveryInfo = r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null;

          const recoveryDeposit = (recoveryInfo?.deposit as unknown as BN || BN_ZERO).add(activeLost?.deposit as unknown as BN || BN_ZERO);

          setValue('recovery', recoveryDeposit);
        }).catch((error) => {
          console.error(error);
          setValue('recovery', null);
        });
      } else {
        setValue('recovery', null);
      }

      /** Fetch referenda  */
      if (api.query?.referenda?.referendumInfoFor) {
        setValue('referenda', undefined);

        let referendaDepositSum = BN_ZERO;

        api.query.referenda.referendumInfoFor.entries().then((referenda) => {
          referenda.forEach(([_, value]) => {
            if (value.isSome) {
              const ref = (value.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;

              if (!ref) {
                return;
              }

              const info = (ref.isCancelled
                ? ref.asCancelled
                : ref.isRejected
                  ? ref.asRejected
                  : ref.isOngoing
                    ? ref.asOngoing
                    : ref.isApproved ? ref.asApproved : undefined) as PalletReferendaReferendumStatusRankedCollectiveTally | undefined;

              if (info?.submissionDeposit && info.submissionDeposit.who.toString() === formatted) {
                referendaDepositSum = referendaDepositSum.add(info.submissionDeposit.amount);
              }

              if (info?.decisionDeposit?.isSome) {
                const decisionDeposit = info?.decisionDeposit.unwrap();

                if (decisionDeposit.who.toString() === formatted) {
                  referendaDepositSum = referendaDepositSum.add(decisionDeposit.amount);
                }
              }
            }
          });

          setValue('referenda', referendaDepositSum);
        }).catch((error) => {
          console.error(error);
          setValue('referenda', null);
        });
      } else {
        setValue('referenda', null);
      }

      /** Fetch bounties  */
      if (api.query?.bounties?.bounties) {
        setValue('bounty', undefined);

        let sum = BN_ZERO;

        api.query.bounties.bounties.entries().then((bounties) => {
          bounties.forEach(([_, value]) => {
            if (value.isSome) {
              const bounty = (value.unwrap());

              if (bounty.proposer.toString() === formatted) {
                sum = sum.add(bounty.curatorDeposit);
              }
            }
          });

          setValue('bounty', sum);
        }).catch((error) => {
          console.error(error);
          setValue('bounty', null);
        });
      } else {
        setValue('bounty', null);
      }

      /** Fetch indices  */
      if (api.query?.indices?.accounts) {
        setValue('index', undefined);

        let sum = BN_ZERO;

        api.query.indices.accounts.entries().then((indices) => {
          indices.forEach(([_, value]) => {
            if (value.isSome) {
              const [address, deposit, _status] = value.unwrap() as [AccountId, BN, boolean];

              if (address.toString() === formatted) {
                sum = sum.add(deposit);
              }
            }
          });

          setValue('index', sum);
        }).catch((error) => {
          console.error(error);
          setValue('index', null);
        });
      } else {
        setValue('index', null);
      }

      /** Fetch multisig  */
      if (api.query?.multisig) {
        setValue('multisig', undefined);

        let sum = BN_ZERO;

        api.query.multisig.multisigs.entries().then((multisigs) => {
          multisigs.forEach(([_, value]) => {
            if (value.isSome) {
              const { deposit, depositor } = value.unwrap() as PalletMultisigMultisig;

              if (depositor.toString() === formatted) {
                sum = sum.add(deposit);
              }
            }
          });

          setValue('multisig', sum);
        }).catch((error) => {
          console.error(error);
          setValue('multisig', null);
        });
      } else {
        setValue('multisig', null);
      }

      /** Fetch preImage  */
      if (api.query?.preimage?.requestStatusFor) {
        setValue('preimage', undefined);

        let sum = BN_ZERO;

        api.query.preimage.requestStatusFor.entries().then((preimages) => {
          preimages.forEach(([_, value]) => {
            if (value.isSome) {
              const status = value.unwrap() as PalletPreimageRequestStatus;

              const request = status.isUnrequested ? status.asUnrequested : undefined;

              if (request) {
                const [accountId, deposit] = request.ticket;

                if (accountId.toString() === formatted) {
                  sum = sum.add(deposit);
                }
              }
            }
          });

          setValue('preimage', sum);
        }).catch((error) => {
          console.error(error);
          setValue('preimage', null);
        });
      } else {
        setValue('preimage', null);
      }

      /** Fetch society  */
      if (api.query?.society) {
        setValue('society', undefined);

        let sum = BN_ZERO;

        api.query.society.bids().then(async (bids) => {
          (bids as unknown as PalletSocietyBid[]).forEach(({ _value, kind, who }) => {
            if (who.toString() === formatted) {
              const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

              sum = sum.add(deposit);
            }
          });

          const candidates = await api.query.society.candidates(formatted) as Option<PalletSocietyCandidacy>;

          if (candidates.isSome) {
            const { kind } = candidates.unwrap();
            const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

            sum = sum.add(deposit);
          }

          setValue('society', sum);
        }).catch((error) => {
          console.error(error);
          setValue('society', null);
        });
      } else {
        setValue('society', null);
      }

      /** assets on asset hubs */
      if (api.consts?.assets && ASSET_HUBS.includes(genesisHash)) {
        setValue('assets', undefined);

        api.query.assets.asset.entries().then(async (assets) => {
          const myAssets = assets.filter((asset) => asset[1].toHuman()['owner'] === formatted);
          const myAssetsId = myAssets.map(([assetId, assetInfo]) => String(assetId.toHuman()[0]).replaceAll(',', ''));
          const assetDeposit = api.consts.assets.assetDeposit as BN;

          const myAssetsMetadata = await Promise.all(myAssetsId.map((assetId) => api.query.assets.metadata(assetId)));

          const totalAssetDeposit = myAssetsMetadata.reduce((acc, metadata) => {
            const metaDeposit = metadata.deposit as BN;

            return acc.add(metaDeposit);
          }, BN_ZERO);

          const finalDeposit = totalAssetDeposit.add(assetDeposit.muln(myAssetsId.length));

          setValue('assets', finalDeposit);
        }).catch((error) => {
          console.error(error);
          setValue('assets', null);
        });
      } else {
        setValue('assets', null);
      }

      /** nft */
      if (api.query?.nfts) {
        setValue('NFT', null);

        api.query.nfts.item.entries().then(async (nft) => {

          const myNFTs = nft.filter(([ntfId, nftInfo]) => String(nftInfo.toPrimitive().deposit.account) === formatted).map(([ntfId, nftInfo]) => [ntfId.toHuman(), nftInfo.toPrimitive()]);
          const nftDepositRequests = myNFTs.map(([nftId, nftInfo]) => api.query.nfts.itemMetadataOf(...nftId));
          const nftDepositAmount = (await Promise.all(nftDepositRequests)).map((deposit) => deposit.toPrimitive().deposit.amount);

          const totalNftDeposits = nftDepositAmount.reduce((acc, deposit) => {
            const depositAsBn = amountToMachine(String(deposit / (10 ** decimal)), decimal);

            return acc.add(depositAsBn);
          }, BN_ZERO);

          const myNFTDeposits = myNFTs.map(([ntfId, nftInfo]) => nftInfo.deposit.amount as number);
          const totalNFTDeposit = myNFTDeposits.reduce((acc, deposit) => {
            const depositAsBn = amountToMachine(String(deposit / (10 ** decimal)), decimal);

            return acc.add(depositAsBn);
          }, BN_ZERO);

          const finalNFTDeposit = totalNFTDeposit.add(totalNftDeposits);

          setValue('NFT', finalNFTDeposit);
        }).catch((error) => {
          console.error(error);
          setValue('NFT', null);
        });
      } else {
        setValue('NFT', null);
      }

      /** uniques_NFT */
      if (api.query?.uniques) {
        setValue('uniques_NFT', null);

        api.query.uniques.class.entries().then((classes) => {
          const myClasses = classes.filter(([uniquesId, uniquesInfo]) => String(uniquesInfo.toPrimitive().owner) === formatted).map(([uniquesId, uniquesInfo]) => uniquesInfo.toPrimitive());

          const totalClassesDeposit = myClasses.reduce((acc, myClass) => {
            const depositAsBn = amountToMachine(String(myClass.totalDeposit / (10 ** decimal)), decimal);

            return acc.add(depositAsBn);
          }, BN_ZERO);

          setValue('uniques_NFT', totalClassesDeposit);
        }).catch((error) => {
          console.error(error);
          setValue('uniques_NFT', null);
        });
      } else {
        setValue('uniques_NFT', null);
      }
    } catch (e) {
      console.error('Fatal error while fetching reserved details:', e)
    }
  }, [activeLost?.deposit, api, formatted, genesisHash]);

  useEffect(() => {
    setReserved({});
  }, [address, genesisHash]);

  return reserved;
}
