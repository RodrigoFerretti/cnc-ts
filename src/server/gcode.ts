import { z } from "zod";

export type GCode = GCode.GCode;

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

    const commandRegex = new RegExp(`^(${Object.values(Command).join("|")})`);

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
            command: z.literal(Command.G00),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
            f: z.undefined(),
        })
        .strict()
        .superRefine(refinePosition);

    const rapidMoveRegex = /^G00(?:\sX(?<x>-?\d*\.?\d+))?(?:\sY(?<y>-?\d*\.?\d+))?(?:\sZ(?<z>-?\d*\.?\d+))?$/;

    export type LinearMove = z.infer<typeof linearMoveSchema>;

    const linearMoveSchema = z
        .object({
            command: z.literal(Command.G01),
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
            command: z.union([z.literal(Command.G02), z.literal(Command.G03)]),
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
            command: z.literal(Command.G28),
        })
        .strict();

    const homeRegex = /^G28$/;

    export type Pause = z.infer<typeof pauseSchema>;

    const pauseSchema = z
        .object({
            command: z.literal(Command.M00),
        })
        .strict();

    const pauseRegex = /^M00$/;

    export type Resume = z.infer<typeof resumeSchema>;

    const resumeSchema = z
        .object({
            command: z.literal(Command.M99),
        })
        .strict();

    const resumeRegex = /^M99$/;

    const regex: Record<Command, RegExp> = {
        [Command.G00]: rapidMoveRegex,
        [Command.G01]: linearMoveRegex,
        [Command.G02]: arcMoveRegex,
        [Command.G03]: arcMoveRegex,
        [Command.G28]: homeRegex,
        [Command.M00]: pauseRegex,
        [Command.M99]: resumeRegex,
    };

    const schema = {
        [Command.G00]: rapidMoveSchema,
        [Command.G01]: linearMoveSchema,
        [Command.G02]: arcMoveSchema,
        [Command.G03]: arcMoveSchema,
        [Command.G28]: homeSchema,
        [Command.M00]: pauseSchema,
        [Command.M99]: resumeSchema,
    } satisfies Record<Command, z.ZodSchema>;

    export type GCode = z.infer<z.ZodUnion<[(typeof schema)[keyof typeof schema]]>>;

    const matchCommand = (message: string) => {
        const match = message.match(commandRegex);
        return match ? (match[0] as Command) : null;
    };

    const matchParameters = (command: Command, message: string) => {
        const match = regex[command].exec(message);
        return match?.groups || {};
    };

    const validate = (command: Command, parameters: Record<string, string>): GCode | null => {
        const result = schema[command].safeParse({ command, ...parameters });
        return result.success === true ? result.data : null;
    };

    export const parse = (message: string): GCode | null => {
        const command = matchCommand(message);
        if (command === null) return null;

        const parameters = matchParameters(command, message);
        const gCode = validate(command, parameters);

        return gCode;
    };
}
