import { Document, model, Schema } from "mongoose";

export type FeedType = {
  title: string;
  user: string;
  date: string;
};

export type FeedSchemaType = FeedType & Document;

const FeedSchema = new Schema<FeedSchemaType>({
  title: {
    type: String,
    required: true,
    min: 3,
  },
  user: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const FeedModel = model<FeedSchemaType>("feed", FeedSchema);

export { FeedModel };
