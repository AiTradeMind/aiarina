export class EvaluationValidator {
  validate(data: any): boolean {
    return !!data.entityId && !!data.entityType;
  }
}
export const evaluationValidator = new EvaluationValidator();
