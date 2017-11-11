import { Cmd, CmdArgument, CmdRunner, CmdSpawner, CmdOutput } from './CmdRunner';
import { Callback } from './Types';
import { streamDataCollector } from 'streamdash';


export class CmdOutputDidNotMatchError extends Error {

    public re: RegExp;
    public output: CmdOutput[];

    constructor(msg: string, re: RegExp, output: CmdOutput[]) {
        super(msg);
        this.re = re;
        this.output = output;
    }

}

export type SingleLineCmdResult = string;

export function singleLineCmdRunner({ cmdSpawner }: {cmdSpawner: CmdSpawner}, cmd: Cmd, re: RegExp) {
    return (inArg: CmdArgument, next: Callback<SingleLineCmdResult>) => {
        let c = new CmdRunner({ cmdSpawner }, {}, ".", cmd, [inArg], {});
        streamDataCollector<CmdOutput>(c, (err, lines) => {

            if (err !== null) {
                return next(err);
            }

            let results = (<CmdOutput[]>lines).filter(({ name }) => name == 'stdout')
                .map(({text}) => text.match(re))
                .filter((r: RegExpMatchArray) => r)
                .map((r: RegExpMatchArray) => r[1] );

            if (!results.length) {
                return next(new CmdOutputDidNotMatchError(
                    `No lines matching '${re.source}' found`,
                    re,
                    (<CmdOutput[]>lines)
                ));
            }

            next(null, results[0]);

        });
    };
}

