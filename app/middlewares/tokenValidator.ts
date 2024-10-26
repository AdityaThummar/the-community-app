import { getTokenFromRequest, verifyToken } from "@utils";
import { Request, Response, NextFunction } from "express";
import { InternalServerError, Unauthorized } from "http-errors";

const tokenValidator = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      next(Unauthorized());
      return;
    }
    const isValid = await verifyToken(token, "access");
    if (!isValid) {
      next(Unauthorized());
      return;
    } else {
      req.headers.aud = isValid?.aud;
      next();
      return;
    }
  } catch (error: any) {
    console.log("🚀 ~ tokenValidator ~ error:", error);
    const str = error?.toString();
    const isExpired =
      str?.includes("TokenExpiredError") || str?.includes("JsonWebTokenError");
    next(
      isExpired
        ? Unauthorized()
        : InternalServerError(error?.message ?? error?.toString())
    );
    return;
  }
};

export { tokenValidator };
