import { Document, model, Schema } from "mongoose";

type LikeType = {
  user: string;
  emoji?: "like" | "support";
};

type CommentType = {
  commentType: "main" | "child";
  id: string;
  user: string;
  text: string;
  date: string;
  likes?: LikeType[];
};

type ChildCommentType = CommentType & {
  mainCommentId: string;
};

type FeedCommentType = CommentType & {
  childComments: ChildCommentType[];
};

type ReactionType = {
  media: "feed";
  likes?: LikeType[];
  comments?: FeedCommentType[];
  feedId: string;
};

type ReactionSchemaType = ReactionType & Document;

type CommentSchemaType = {
  commentType: String;
  id: String;
  user: String;
  text: String;
  date: string;
  likes?: Array<{
    user: String;
    emoji: String;
  }>;
};

type ChildCommentSchemaType = CommentSchemaType & {
  mainCommentId: String;
};

type MainCommentSchemaType = CommentSchemaType & {
  childComments: Array<ChildCommentSchemaType>;
};

const ReactionSchema = new Schema<ReactionSchemaType>({
  feedId: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    required: true,
  },
  likes: {
    type: Array<{
      user: String;
      emoji: String;
    }>,
    required: true,
  },
  comments: {
    type: Array<MainCommentSchemaType>,
    required: true,
  },
});

const ReactionModel = model<ReactionSchemaType>("reaction", ReactionSchema);

export { ReactionModel };
export type {
  LikeType,
  CommentType,
  ChildCommentType,
  FeedCommentType,
  ReactionType,
  ReactionSchemaType,
  CommentSchemaType,
  ChildCommentSchemaType,
  MainCommentSchemaType,
};
