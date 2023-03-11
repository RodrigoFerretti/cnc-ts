import { z } from "zod";
import { Either } from "./either";

export type GCode = z.infer<typeof GCode.schema>;

export namespace GCode {
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
            g: z.literal("00"),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
        })
        .strict()
        .superRefine(refinePosition);

    export type LinearMove = z.infer<typeof linearMoveSchema>;

    const linearMoveSchema = z
        .object({
            g: z.literal("01"),
            x: stringNumber.optional(),
            y: stringNumber.optional(),
            z: stringNumber.optional(),
            f: stringNumber.optional(),
        })
        .strict()
        .superRefine(refinePosition);

    export type ArcMove = z.infer<typeof arcMoveSchema>;

    const arcMoveSchema = z
        .object({
            g: z.union([z.literal("02"), z.literal("03")]),
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

    export type Home = z.infer<typeof homeSchema>;

    const homeSchema = z
        .object({
            g: z.literal("28"),
        })
        .strict();

    export type Pause = z.infer<typeof pauseSchema>;

    const pauseSchema = z
        .object({
            m: z.literal("00"),
        })
        .strict();

    export type Resume = z.infer<typeof resumeSchema>;

    const resumeSchema = z
        .object({
            m: z.literal("99"),
        })
        .strict();

    export const schema = z.union([
        rapidMoveSchema,
        linearMoveSchema,
        arcMoveSchema,
        homeSchema,
        pauseSchema,
        resumeSchema,
    ]);

    export const validate = (input: unknown): Either<GCode, z.ZodError> => {
        const result = schema.safeParse(input);

        return result.success === true ? [result.data, null] : [null, result.error];
    };
}
