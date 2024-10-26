import { Router } from "express";
import {
  authDeleteProfileController,
  authEditProfileController,
  authGetProfileController,
  authRefreshTokensController,
  authRegisterController,
  authSignInController,
} from "@controllers";
import { validator } from "@middlewares";
import { userBasicSchema, userProfileSchema } from "@validators";
import { RouterPoints } from "../points.routes";
import { tokenValidator } from "../../middlewares/tokenValidator";

const router = Router();

router.post(
  RouterPoints.AUTH_SIGNUP_REGISTER,
  validator(userBasicSchema),
  authRegisterController
);
router.post(
  RouterPoints.AUTH_SIGNIN,
  validator(userBasicSchema),
  authSignInController
);
router.post(RouterPoints.AUTH_REFRESH_TOKENS, authRefreshTokensController);
router.patch(
  RouterPoints.AUTH_PROFILE,
  validator(userProfileSchema),
  tokenValidator,
  authEditProfileController
);
router.get(RouterPoints.AUTH_PROFILE, tokenValidator, authGetProfileController);

router.delete(
  RouterPoints.DELETE_ACCOUNT,
  validator(userBasicSchema),
  tokenValidator,
  authDeleteProfileController
);

export { router as AuthRouter };
