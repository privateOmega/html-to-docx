/**
 * xmlbuilder2 types attribute values as strings but stringifies values itself
 * (`value + ""`) and treats null/undefined specially. Passing values through
 * unchanged keeps the generated XML identical while satisfying its types.
 */
export const attr = (value: string | number | boolean | null | undefined) => value as string;
