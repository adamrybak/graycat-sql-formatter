# GrayCat SQL Formatter
---
An SQL formatting extension for Visual Studio Code.
This extension was designed in lieu of a highly configurable formatter engine not being available on the Marketplace.

Please report issues on [GitHub](https://github.com/adamrybak/graycat-sql-formatter/issues).

---
## Configuration Options
### `Case`
- Possible values: `Uppercase`, `Lowercase`, `Unchanged`

###### Line Comments (default: `Unchanged`)
`Unchanged`:
```sql
AND suburb <> 'Old Town' -- ignore Old Town
```
`Uppercase`:
```sql
AND suburb <> 'Old Town' -- IGNORE OLD TOWN
```

###### Block Comments (default: `Unchanged`)
`Unchanged`:
```sql
SELECT people.address /* home address */
```
`Uppercase`:
```sql
SELECT people.address /* HOME ADDRESS */
```

###### String Values (default: `Unchanged`)
`Unchanged`:
```sql
AND suburb <> 'Old Town' -- ignore Old Town
```
`Uppercase`:
```sql
AND suburb <> 'OLD TOWN' -- ignore Old Town
```

###### Literals (default: `Unchanged`)
`Unchanged`:
```sql
SELECT people.name AS [Name]
```
`Uppercase`:
```sql
SELECT people.name AS [NAME]
```

###### Keywords (default: `Uppercase`)
`Uppercase`:
```sql
WHERE postalcode >= 3000
      AND suburb <> 'OLD TOWN' -- ignore Old Town
```
`Lowercase`:
```sql
where postalcode >= 3000
      and suburb <> 'OLD TOWN' -- ignore Old Town
```

###### Functions (default: `Uppercase`)
`Uppercase`:
```sql
SELECT SUM(occupants)
FROM people
```
`Lowercase`:
```sql
SELECT sum(occupants)
FROM people
```

###### Identifiers (default: `Lowercase`)
`Lowercase`:
```sql
SELECT people.name AS [Name],
       people.address, /* home address */
```
`Uppercase`:
```sql
SELECT PEOPLE.NAME AS [Name],
       PEOPLE.ADDRESS, /* home address */
```

---
