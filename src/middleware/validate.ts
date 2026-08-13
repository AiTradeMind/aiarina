import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === "ZodError") {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors,
          timestamp: new Date().toISOString(),
          correlationId: (req as any).correlationId
        });
      } else {
        next(error);
      }
    }
  };
};
