export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    ok: boolean;
    errors: ValidationError[];
}

/**
 * Validates datasource input fields.
 */
export function validateDatasource(data: { name: string }): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.name || !data.name.trim()) {
        errors.push({
            field: "name",
            message: "Datasource name is required"
        });
    }

    return {
        ok: errors.length === 0,
        errors
    };
}

/**
 * Validates blueprint (plan) input fields.
 */
export function validateBlueprint(data: { name: string }): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.name || !data.name.trim()) {
        errors.push({
            field: "name",
            message: "Semester Blueprint Name is required"
        });
    }

    return {
        ok: errors.length === 0,
        errors
    };
}
