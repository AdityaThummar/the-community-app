import {
  NotFound,
  BadRequest,
  Conflict,
  InternalServerError,
  Unauthorized,
} from "http-errors";
import { NextFunction, Request, Response } from "express";
import { FeedModel, ReactionModel, UserModel } from "@models";
import {
  checkPassword,
  generateToken,
  getAudElseError,
  getTokenFromRequest,
  getUserProfile,
  sendSuccessResponse,
  verifyToken,
} from "@utils";
import { userBasicSchema } from "@validators";

const authRegisterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedResponse = req.body;
    const isExist = await UserModel.findOne({
      email: validatedResponse?.email,
    });
    if (isExist) {
      next(Conflict("email is already registerd !!"));
      return;
    }
    const profile = { ...validatedResponse, newUser: true };
    const newUser = await UserModel.create(profile);
    const saved = await newUser.save();
    const access = await generateToken(saved?.id, "access");
    const refresh = await generateToken(saved?.id, "refresh");
    const data = {
      user: {
        email: saved?.email,
        id: saved?.id,
      },
      access,
      refresh,
    };
    sendSuccessResponse(res, data, "User registred successfully !!");
  } catch (error: any) {
    console.log("🚀 ~ error: authRegisterController", error);
    const joiError = error?.isJoi;
    const errorString = error?.toString();
    next(joiError ? BadRequest(errorString) : InternalServerError(errorString));
  }
};

const authRefreshTokensController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return next(Unauthorized("User not authorised !!"));
    }
    const verifyRefresh = await verifyToken(token, "refresh");
    if (!verifyRefresh) {
      InternalServerError();
      return;
    }
    const aud =
      typeof verifyRefresh?.aud === "object"
        ? verifyRefresh?.aud?.[0]
        : verifyRefresh?.aud;
    if (aud) {
      const access = await generateToken(aud, "access");
      const refresh = await generateToken(aud, "refresh");
      const data = { access, refresh };
      sendSuccessResponse(res, data, "Token refreshed successfully !!");
      return;
    }
    next(InternalServerError());
  } catch (error: any) {
    console.log("🚀 ~ error:authRefreshTokensController", error);
    const isExpired = error?.toString()?.includes("TokenExpiredError");
    next(isExpired ? Unauthorized(error) : InternalServerError(error));
  }
};

const authSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedResponse = req?.body;
    const isExist = await UserModel.findOne({
      email: validatedResponse?.email,
    });
    if (!isExist) {
      next(NotFound("User not found !!"));
      return;
    }
    const compared = await checkPassword(
      validatedResponse?.password,
      isExist?.password
    );
    if (!isExist || !compared) {
      next(NotFound("User not found !!"));
      return;
    }
    const access = await generateToken(isExist?.id, "access");
    const refresh = await generateToken(isExist?.id, "refresh");
    const profile = await getUserProfile({
      email: validatedResponse?.email,
    });
    const data = {
      user: profile,
      access,
      refresh,
    };
    sendSuccessResponse(res, data, "User signed in successfully !!");
  } catch (error: any) {
    console.log("🚀 ~ error:authSignInController", error);
    const joiError = error.isJoi;
    const errorString = error.toString();
    next(joiError ? BadRequest(errorString) : InternalServerError(errorString));
  }
};

const authEditProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getAudElseError(req);
    const itemFound = await getUserProfile({ _id });
    if (!itemFound) {
      next(NotFound("User not found !!"));
      return;
    }
    const profile = { ...req.body, newUser: false };
    await UserModel.updateOne({ _id }, profile);
    const newProfile = await getUserProfile({
      _id,
    });
    const data = { user: newProfile };
    sendSuccessResponse(res, data, "Profile updated successfully !!");
  } catch (error) {
    console.log("🚀 ~ authEditProfileController ~ error:", error);
    next(InternalServerError(error?.toString()));
  }
};

const authGetProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getAudElseError(req);
    const itemFound = await getUserProfile({ _id });
    if (!itemFound) {
      next(NotFound("User not found !!"));
      return;
    }
    const data = { user: itemFound };
    sendSuccessResponse(res, data, "Profile fetched successfully !!");
  } catch (error) {
    console.log("🚀 ~ authGetProfileController ~ error:", error);
    next(InternalServerError(error?.toString()));
  }
};

const authDeleteProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getAudElseError(req);
    const itemFound = await UserModel.findOne({ _id });
    if (!itemFound) {
      next(NotFound("User not found !!"));
      return;
    }
    const compared = await checkPassword(
      req?.body?.password,
      itemFound?.password
    );
    if (!compared) {
      next(NotFound("User not found !!"));
      return;
    }
    await UserModel.deleteOne({ _id });
    const feeds = await FeedModel.find({ user: _id });
    await FeedModel?.deleteMany({ user: _id });
    await ReactionModel?.deleteMany({
      feedId: { $in: feeds?.map((__) => __.id) },
    });

    const data = { redirect: "/login" };
    sendSuccessResponse(res, data, "Account deleted successfully !!");
  } catch (error) {
    console.log("🚀 ~ authDeleteProfileController ~ error:", error);
    next(InternalServerError(error?.toString()));
  }
};

export {
  authRegisterController,
  authEditProfileController,
  authSignInController,
  authRefreshTokensController,
  authDeleteProfileController,
  authGetProfileController,
};
