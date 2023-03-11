export const matchGroups = <T extends Record<string, string>>(regex: RegExp, message: string): T => {
    const matches = message.matchAll(regex);

    const groups = [...matches].reduce((result, matchArray) => {
        const groups = Object.entries(matchArray.groups || {}).reduce((groups, [key, value]) => {
            if (value === undefined) delete groups[key];
            return { ...groups };
        }, matchArray.groups || {});
        return { ...result, ...groups };
    }, {});

    return groups as T;
};
