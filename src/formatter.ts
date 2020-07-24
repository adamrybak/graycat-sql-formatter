import * as request from 'request';

export const format = (content: string, options: object): Promise<string> => {
    return new Promise((resolve, reject) => {
        let formatOptions = {
            "capitalization": {
                "keywords": {
                    "fmt100_case_keyword": "lower"
                },
                "datatype": {
                    "fmt101_case_datatype": "lower"
                },
                "identifier": {
                    "generic": {
                        "fmt102_case_identifier": "lower"
                    },
                    "quotedIdentifier": {
                        "fmt103_case_quoted_identifier": "no_change"
                    },
                    "prefixedIdentifier": {
                        "fmt104_case_prefixed_identifier": "no_change"
                    },
                    "tableName": {
                        "fmt105_case_table_name": "upper"
                    },
                    "columnName": {
                        "fmt106_case_column_name": "upper"
                    },
                    "functionName": {
                        "fmt107_case_function_name": "lower"
                    },
                    "Alias": {
                        "generic": {
                            "fmt108_case_alias_name": "upper"
                        },
                        "columnAlias": {
                            "fmt110_case_column_alias_name": "upper"
                        }
                    },
                    "variable": {
                        "fmt111_case_variable": "no_change"
                    }
                }
            }
        };

        request.post({
            url: 'https://www.gudusoft.com/format.php',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body:
                "rqst_input_sql=" + encodeURIComponent(content) +
                "&rqst_formatOptions=" + encodeURIComponent(JSON.stringify(formatOptions))
        }, (err, _, body) => {
            if (err) {
                reject(err);
            }

            let data = JSON.parse(body);

            if (data.rspn_http_status == 200) {
                resolve(String(data.rspn_formatted_sql).trim());
            }

            else {
                reject("Format operation failed.");
            }
        });
    });
}

const tokenize = (content: string): string[] => {
    let tokens: string[] = [];

    const tokensPush = (text: string) => {
        tokens.push(text.trim());
        content = content.substring(text.length);
    }

    while (content.length > 0) {
        let token;

        // leading whitespace
        token = content.match(/^\s+/m);
        if (token) {
            content = content.substring(token[0].length);
            continue;
        }

        // 'quoted text'
        token = content.match(/^'[^']*(?:''[^']*)*'/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // [literal]
        token = content.match(/^\[[^\]]*\]/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // `literal`
        token = content.match(/^`[^`]*`/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // "literal"
        token = content.match(/^"[^"]*"/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // numbers
        token = content.match(/^\d+(\.\d*)?/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // operators
        token = content.match(/^((!<)|(!=)|(!>)|(%=)|(&=)|(\*=)|(\+=)|(\-=)|(\/=)|(<=)|(<>)|(>=)|(\^=)|(\|=)|(%)|(&)|(\()|(\))|(\*)|(\+)|(\,)|(\-)|(\/)|(<)|(=)|(>)|(\^)|(\|)|(~)|(;))/m);
        if (token) {
            tokensPush(token[0]);
            continue;
        }

        // tokens
        token = content.match(/(^.+?)((\s+)|(!<)|(!=)|(!>)|(%=)|(&=)|(\*=)|(\+=)|(\-=)|(\/=)|(<=)|(<>)|(>=)|(\^=)|(\|=)|(%)|(&)|(\()|(\))|(\*)|(\+)|(\,)|(\-)|(\/)|(<)|(=)|(>)|(\^)|(\|)|(~)|(;))/m);
        if (token) {
            tokensPush(token[1]);
            continue;
        }

        // remaining content
        tokensPush(content);
    }

    return tokens;
}

export const format2 = (content: string, options: object): Promise<string> => {
    return new Promise((resolve, reject) => {
        let result = '';

        let tokens = tokenize(content);

        result = tokens.join(' ');

        console.log(result);
        resolve(result);
    });
}