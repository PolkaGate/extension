// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import extrinsics from './documents/extrinsics';

export const stakingActionCleaner = (action: string) => {
    switch (action) {
        case 'bond':
            return 'stake';

        case 'unbond':
            return 'unstake';

        case 'chill':
            return 'remove validators';

        case 'create':
            return 'create pool';

        case 'setMetadata':
            return 'set pool name';

        case 'setState':
            return 'set pool state';

        case 'nominate':
            return 'select validators';

        default:
            return action;
    }
};

export function additionalRules (section: string) {
    const SECTION = section?.toLowerCase();

    if (SECTION === 'convictionvoting') {
        return `
            - Most important fields for explanation:
              * votingPower (if provided)
              * aye (if provided)
              * nay (if provided)
              * abstain (if provided)
              * referendumIndex (if provided)
              * voteType (if provided)
              * to (if provided)
              * token
              * decimal
              * conviction (if provided)
            - voteType = "Aye" or "Nay":
                "You are voting [voteType] on referendum #[referendumIndex] using [votingPower] [token] as voting power."
            - voteType = "Split":
                "You are splitting your vote on referendum #[referendumIndex] with [aye] [token] in favor and [nay] [token] against."
            - voteType = "SplitAbstain":
                "You are splitting your vote on referendum #[referendumIndex] with [aye] [token] in favor, [nay] [token] against, and [abstain] [token] abstaining."

            - Strictly fill the template.
        `;
    }

    if (SECTION === 'balances') {
        return `
            - Format: "You are sending [amount|action] [token] to [address]."
        `;
    }

    if (SECTION === 'nominationpools') {
        return `
            - Most important fields for explanation:
              * action
              * poolId (if provided)
              * amount (if provided)
              * token
            - Use these important fields to explain the transaction to the user cleanly and without any extra explanation.
            - Here staking type is Nomination Pools.
            - Always mention important fields if provided.

        Intend classification rules:
            - action indicates starting or increasing staking (e.g. join, bondExtra):
                "You are staking [amount] [token][ via Nomination Pool #[poolId] if provided]."
            - action indicates reducing or stopping staking (e.g. unbond, unbondAll, chill, leave):
                "You are unstaking [amount if provided] [token][ from Nomination Pool #[poolId] if provided]."
            - action indicates withdrawing unstaked funds (e.g. withdraw, withdrawUnbonded):
                "You are withdrawing your unstaked [token]."
            - action indicates selecting or changing staking targets (e.g. nominate):
                "You are selecting the validators for the Nomination Pool #[poolId]."
            - else: Just describe the transaction base on the provided Transaction explanation helper info without adding extra information.
        `;
    }

    if (SECTION === 'staking') {
        return `
            - Most important fields for explanation:
              * action
              * amount (if provided)
              * payee (if provided)
              * token
            - Use these important fields to explain the transaction to the user cleanly and without any extra explanation.
            - Here staking type is Solo Staking.

        Intend classification rules:
            - action indicates starting or increasing staking (e.g. bond, bondExtra, rebond):
                "You are staking [amount] [token]."
            - action indicates reducing or stopping staking (e.g. unbond, unbondAll, chill, leave):
                "You are unstaking [amount if provided] [token]."
            - action indicates withdrawing unstaked funds (e.g. withdraw, withdrawUnbonded):
                "You are withdrawing your unstaked [token]."
            - action indicates selecting or changing staking targets (e.g. nominate, setTargets):
                "You are selecting the validators for staking."
            - else: Just describe the transaction base on the provided Transaction explanation helper info without adding extra information.
        `;
    }

    return '';
}

export function RAG (extrinsic: string): string {
    return JSON.stringify(extrinsics[extrinsic as keyof typeof extrinsics]) || 'No additional information available.';
}
