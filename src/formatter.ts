import * as vscode from 'vscode';
import * as request from 'request';

export const format = (document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions): vscode.ProviderResult<vscode.TextEdit[]> => {
    return new Promise((resolve, reject) => {
        let content = document.getText(range);

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
                resolve([new vscode.TextEdit(range, data.rspn_formatted_sql)]);
            }

            else {
                reject("Format operation failed.");
            }
        });
    });
};
