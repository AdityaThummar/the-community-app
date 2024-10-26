import Joi from "joi";

const craeteFeedSchema = Joi.object({
  title: Joi.string()?.required()?.min(3),
});

export { craeteFeedSchema };
