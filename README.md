# GrayCat SQL Formatter
---
An SQL formatting extension for Visual Studio Code.
This extension was designed in lieu of a highly configurable formatter engine not being available on the Marketplace.

Please report issues on [GitHub](https://github.com/adamrybak/graycat-sql-formatter/issues).

---
## Configuration Options
### `Blocks`
- `Max Width` (possible values: `0 to 65535`, default: `80`)
Ajusts the maximum character width of a block before it is broken up across lines.

### `Case`
Transforms the case of statements.
- Possible values: `Uppercase`, `Lowercase`, `Unchanged`
  - Line Comments (default: `Unchanged`)
  - Block Comments (default: `Unchanged`)
  - String Values (default: `Unchanged`)
  - Literals (default: `Unchanged`)
  - Keywords (default: `Uppercase`)
  - Functions (default: `Uppercase`)
  - Identifiers (default: `Lowercase`)

```sql
SELECT table_name.identifier AS [Literal],
       FUNC(*) -- line comment
FROM table_name /* block comment */
WHERE table_name.field = 'String Value'
```

---
