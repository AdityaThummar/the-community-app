import Joi from "joi";

const userBasicSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const userProfileSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  gender: Joi.string().required(),
  bio: Joi.string().required().max(500),
});

export { userBasicSchema, userProfileSchema };
