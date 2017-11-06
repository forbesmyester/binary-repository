import { RightAfterLeftMapFunc } from 'streamdash';
import { pickAll, keys, equals } from 'ramda';

export default function getNotInLeftRightAfterLeftMapFunc<A>(dependencies: {}): RightAfterLeftMapFunc<A, A, A> {
    return (lefts, right) => {
        for (let l of lefts) {
            let toCompare = pickAll(
                keys(right),
                l
            );
            if (equals(toCompare, right)) {
                return [];
            }
        }
        return [right];
    };
}

