import Ajv, { type ValidateFunction, type ErrorObject } from "ajv";
import schema from "../schema/drugRepurposingSchema.json";
import type { DrugRepurposingData } from "../types/DrugDiseasePair";

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: DrugRepurposingData;
}

/**
 * Structured validation error information
 */
export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, any>;
}

/**
 * Data validator class for drug repurposing data
 */
export class DataValidator {
  private ajv: Ajv;
  private validate: ValidateFunction;

  constructor() {
    // Initialize AJV with strict mode
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: true,
    });

    // Compile the schema
    this.validate = this.ajv.compile(schema);
  }

  /**
   * Validate drug repurposing data against the schema
   *
   * @param data - The data to validate
   * @returns ValidationResult with success status and any errors
   */
  validateData(data: unknown): ValidationResult {
    const valid = this.validate(data);

    if (valid) {
      return {
        valid: true,
        errors: [],
        data: data as DrugRepurposingData,
      };
    }

    // Convert AJV errors to our structured format
    const errors = this.formatErrors(this.validate.errors || []);

    return {
      valid: false,
      errors,
    };
  }

  /**
   * Format AJV errors into a more readable structure
   */
  private formatErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    return ajvErrors.map((error) => {
      const path = error.instancePath || "root";
      let message = error.message || "Validation failed";

      // Enhance error messages based on keyword
      switch (error.keyword) {
        case "required":
          message = `Missing required field: ${error.params.missingProperty}`;
          break;
        case "type":
          message = `Expected type ${error.params.type}, got ${typeof error.data}`;
          break;
        case "minimum":
          message = `Value must be >= ${error.params.limit}`;
          break;
        case "maximum":
          message = `Value must be <= ${error.params.limit}`;
          break;
        case "minLength":
          message = `String must have at least ${error.params.limit} characters`;
          break;
        case "pattern":
          message = `Value does not match required pattern: ${error.params.pattern}`;
          break;
        case "additionalProperties":
          message = `Unexpected property: ${error.params.additionalProperty}`;
          break;
        default:
          message = error.message || "Validation failed";
      }

      return {
        path,
        message,
        keyword: error.keyword,
        params: error.params,
      };
    });
  }

  /**
   * Generate a human-readable error report
   */
  generateErrorReport(errors: ValidationError[]): string {
    if (errors.length === 0) {
      return "No errors found.";
    }

    const lines = ["Data validation failed:", ""];

    errors.forEach((error, index) => {
      lines.push(`${index + 1}. Path: ${error.path}`);
      lines.push(`   Error: ${error.message}`);
      if (error.keyword) {
        lines.push(`   Type: ${error.keyword}`);
      }
      lines.push("");
    });

    return lines.join("\n");
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();

/**
 * Convenience function to validate data
 */
export function validateDrugRepurposingData(
  data: unknown
): ValidationResult {
  return dataValidator.validateData(data);
}
