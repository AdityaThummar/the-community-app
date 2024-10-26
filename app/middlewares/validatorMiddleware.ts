import { Schema } from "joi";
import { Request, Response, NextFunction } from "express";
import { UnprocessableEntity } from "http-errors";

const validator = (validationSchema: Schema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      let inputValues = { ...req?.body };
      await validationSchema.validateAsync(inputValues, { abortEarly: false });
      next();
    } catch (error: any) {
      console.log("🚀 ~ validator ~ error:", error);
      next(
        UnprocessableEntity(
          (error?.message ?? error?.toString())
            ?.replace(/\"/g, "")
            ?.replace(/\. /g, "\n")
        )
      );
      return;
    }
  };
};

export { validator };
