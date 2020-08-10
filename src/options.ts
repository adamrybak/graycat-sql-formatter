export enum CaseType {
    Lowercase,
    Uppercase,
    Unchanged,
}

export interface Options {
    initial_indent: number,

    case: {
        line_comments: CaseType,
        block_comments: CaseType,
        string_values: CaseType,
        literals: CaseType,
        keywords: CaseType,
        functions: CaseType,
        identifiers: CaseType,
    },

    blocks: {
        max_width: number,
    },
}