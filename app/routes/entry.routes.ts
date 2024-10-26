import { Router, Response, Request, NextFunction } from "express";
import { NotFound } from "http-errors";
import { APP_ROUTE, AUTH_ROUTE } from "./points.routes";
import { AuthRouter } from "./auth";
import { AppRotuer } from "./app";
import { tokenValidator } from "../middlewares/tokenValidator";

const AppRouter = Router();

AppRouter.use(AUTH_ROUTE, AuthRouter);
AppRouter.use(APP_ROUTE, tokenValidator, AppRotuer);

AppRouter.use((_: Request, __: Response, next: NextFunction) => {
  next(NotFound());
});

AppRouter.use((error: any, _: Request, res: Response, __: NextFunction) => {
  try {
    res.status(error?.status).send({
      error,
      success: false,
    });
  } catch (error) {
    console.log("🚀 ~ AppRouter.use ~ error:", error);
    res.status(500).send({
      success: false,
      error: {
        message: "Internal server error from outer",
      },
    });
  }
});

export { AppRouter };
