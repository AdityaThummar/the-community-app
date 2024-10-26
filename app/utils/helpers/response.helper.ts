import { Response } from "express";
import { InternalServerError, Unauthorized } from "http-errors";

const sendSuccessResponse = (res: Response, data: any, message?: string) => {
  try {
    return res.status(200).send({
      success: true,
      data,
      ...(message ? { message } : {}),
    });
  } catch (error) {
    console.log("🚀 ~ sendSuccessResponse ~ error:", error);
    return InternalServerError;
  }
};

const handleError = (err: any) => {
  const str = (err?.message ?? err)?.toString();
  if (str.includes("Unauthorized")) {
    return Unauthorized("Unauthorized");
  } else {
    return err;
  }
};

export { sendSuccessResponse, handleError };
