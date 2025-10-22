# CSV Import Format

## Overview

The CSV import supports **many-to-many relationships** for roles and groups. Members can have multiple roles and belong to multiple groups.

## Format

### Required Columns
- `nom` - Member name
- `email` - Member email (must be unique)
- `role` - Role name(s)
- `groupe` - Group name(s)

### Multiple Values

Use **semicolon (`;`)** to separate multiple roles or groups:

```csv
nom,email,role,groupe
Sophie Bernard,sophie@example.com,delegue_titulaire;membre,6ème 1;6ème 2
```

This creates a member with:
- **2 roles**: "Délégué titulaire" AND "Membre"
- **2 groups**: "6ème 1" AND "6ème 2"

## Examples

### Single Role & Group (Backward Compatible)
```csv
nom,email,role,groupe
Jean Dupont,jean@example.com,delegue_titulaire,6ème 1
```

### Multiple Roles, Single Group
```csv
nom,email,role,groupe
Marie Martin,marie@example.com,delegue_titulaire;membre,6ème 1
```

### Single Role, Multiple Groups
```csv
nom,email,role,groupe
Pierre Durand,pierre@example.com,membre,6ème 1;6ème 2;6ème 3
```

### Multiple Roles & Multiple Groups
```csv
nom,email,role,groupe
Sophie Bernard,sophie@example.com,delegue_titulaire;delegue_suppleant,6ème 1;6ème 2
```

## Valid Role Names (Parents d'élèves Template)

- `delegue_titulaire` - Délégué titulaire
- `delegue_suppleant` - Délégué suppléant
- `membre` - Membre

## Valid Group Names (Parents d'élèves Template)

### Niveau (Parent Groups)
- `6ème`
- `5ème`
- `4ème`
- `3ème`

### Classes (Child Groups)
- `6ème 1`, `6ème 2`, `6ème 3`, `6ème 4`
- `5ème 1`, `5ème 2`, `5ème 3`, `5ème 4`
- `4ème 1`, `4ème 2`, `4ème 3`, `4ème 4`
- `3ème 1`, `3ème 2`, `3ème 3`, `3ème 4`

## Validation Rules

1. **Email must be unique** - Duplicate emails will replace existing members
2. **Role names must exist** - Unknown roles will cause validation errors
3. **Group names must exist** - Unknown groups will cause validation errors
4. **At least one role required** - Members must have at least one role
5. **At least one group required** - Members must belong to at least one group

## Error Handling

The import will:
- ✅ Import all valid members
- ⚠️ Skip invalid rows with error messages
- 🔄 Replace existing members with same email (upsert behavior)
- 📊 Return summary with imported count and errors

## Sample CSV Files

- **`sample-members.csv`**: Small example with 7 members showing various combinations
- **`sample-members-500.csv`**: Large dataset with 500 members for testing
  - 16 delegates per class (titulaire + suppléant)
  - ~54 members with multiple roles
  - ~56 members with multiple groups
  - Realistic French names and email addresses

To generate a new 500-member sample:
```bash
cd specs/001-association-hub
python3 generate-sample-csv.py
```

## Migration from Old Format

**Old format (single role/group)** still works:
```csv
nom,email,role,groupe
Jean,jean@example.com,delegue_titulaire,6ème 1
```

**New format (multiple roles/groups)** uses semicolons:
```csv
nom,email,role,groupe
Jean,jean@example.com,delegue_titulaire;membre,6ème 1;6ème 2
```

Both formats are supported for backward compatibility.

## Export Format

When you export members, the CSV will use semicolon-separated values for members with multiple roles/groups:

```csv
nom,email,role,groupe
Jean Dupont,jean@example.com,delegue_titulaire,6ème 1
Sophie Bernard,sophie@example.com,delegue_titulaire;membre,6ème 1;6ème 2
```

**Round-trip compatibility**: Export → Edit → Import works seamlessly!
