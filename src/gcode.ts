import { z } from "zod";

export type GCode = z.infer<typeof GCode.schema>;

export namespace GCode {
    export enum Command {
        G00 = "G00",
        G01 = "G01",
        G02 = "G02",
        G03 = "G03",
        G28 = "G28",
        M00 = "M00",
        M99 = "M99",
    }

    const commandRegex = /^(G00|G01|G02|G03|G28|M00|M99)/;

    const matchCommand = (message: string) => {
        const match = message.match(commandRegex);
        return match ? (match[0] as GCode.Command) : null;
    };

    const stringNumber = z.preprocess((string) => (string === undefined ? undefined : Number(string)), z.number());

    const refinePosition = ({ x, y, z }: any, ctx: z.RefinementCtx) => {
        if (x === undefined && y === undefined && z === undefined) {
            ctx.addIssue({ code: "custom", message: "At leats one position axis must be defined" });
        }
    };

    const refineOffset = ({ i, j, k }: any, ctx: z.RefinementCtx) => {
        if (
            (i !== undefined && j !== undefined && k === undefined) ||
            (i !== undefined && j === undefined && k !== undefined) ||
            (i === undefined && j !== undefined && k !== undefined)
        ) {
            return;
        }

        ctx.addIssue({ code: "custom", message: "Only two offset axis must be defined" });
    };

    export type RapidMove = z.infer<typeof rapidMoveSchema>;

    const rapidMoveSchema = z
        .object({
            command: z.literal(GCode.Command.G00),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
        })
        .strict()
        .superRefine(refinePosition);

    const rapidMoveRegex = /^G00(?:\sX(?<x>-?\d*\.?\d+))?(?:\sY(?<y>-?\d*\.?\d+))?(?:\sZ(?<z>-?\d*\.?\d+))?$/;

    export type LinearMove = z.infer<typeof linearMoveSchema>;

    const linearMoveSchema = z
        .object({
            command: z.literal(GCode.Command.G01),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
            f: stringNumber.optional(),
        })
        .strict()
        .superRefine(refinePosition);

    const linearMoveRegex =
        /^G01(?:\sX(?<x>-?\d*\.?\d+))?(?:\sY(?<y>-?\d*\.?\d+))?(?:\sZ(?<z>-?\d*\.?\d+))?(?:\sF(?<f>-?\d*\.?\d+))?$/;

    export type ArcMove = z.infer<typeof arcMoveSchema>;

    const arcMoveSchema = z
        .object({
            command: z.union([z.literal(GCode.Command.G02), z.literal(GCode.Command.G03)]),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
            i: stringNumber.optional(),
            j: stringNumber.optional(),
            k: stringNumber.optional(),
            f: stringNumber.optional(),
        })
        .strict()
        .superRefine(refinePosition)
        .superRefine(refineOffset);

    const arcMoveRegex =
        /^(G02|G03)(?:\sX(?<x>-?\d*\.?\d+))?(?:\sY(?<y>-?\d*\.?\d+))?(?:\sZ(?<z>-?\d*\.?\d+))?(?:\sI(?<i>-?\d*\.?\d+))?(?:\sJ(?<j>-?\d*\.?\d+))?(?:\sK(?<k>-?\d*\.?\d+))?(?:\sF(?<f>-?\d*\.?\d+))?$/;

    export type Home = z.infer<typeof homeSchema>;

    const homeSchema = z
        .object({
            command: z.literal(GCode.Command.G28),
        })
        .strict();

    const homeRegex = /^G28$/;

    export type Pause = z.infer<typeof pauseSchema>;

    const pauseSchema = z
        .object({
            command: z.literal(GCode.Command.M00),
        })
        .strict();

    const pauseRegex = /^M00$/;

    export type Resume = z.infer<typeof resumeSchema>;

    const resumeSchema = z
        .object({
            command: z.literal(GCode.Command.M99),
        })
        .strict();

    const resumeRegex = /^M99$/;

    export const schema = z.union([
        rapidMoveSchema,
        linearMoveSchema,
        arcMoveSchema,
        homeSchema,
        pauseSchema,
        resumeSchema,
    ]);

    const regex: Record<GCode.Command, RegExp> = {
        [GCode.Command.G00]: rapidMoveRegex,
        [GCode.Command.G01]: linearMoveRegex,
        [GCode.Command.G02]: arcMoveRegex,
        [GCode.Command.G03]: arcMoveRegex,
        [GCode.Command.G28]: homeRegex,
        [GCode.Command.M00]: pauseRegex,
        [GCode.Command.M99]: resumeRegex,
    };

    type MatchParametersOptions = { command: GCode.Command; message: string };

    const matchParameters = (options: MatchParametersOptions) => {
        const match = regex[options.command].exec(options.message);
        return match?.groups || {};
    };

    type ValidateOptions = { data: unknown };

    const validate = (options: ValidateOptions): GCode | null => {
        const result = schema.safeParse(options.data);
        return result.success === true ? result.data : null;
    };

    export const parse = (message: string): GCode | null => {
        const command = matchCommand(message);
        if (command === null) return null;

        const parameters = matchParameters({ command, message });
        const gCode = validate({ data: { ...parameters, command } });

        return gCode;
    };
}
