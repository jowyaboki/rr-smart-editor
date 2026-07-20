import { webComments } from '../comments';

export const createReviewThreadComment = (
  authorId: string,
  authorName: string,
  text: string,
  frame: number
) => {
  return webComments.addComment(authorId, authorName, text, { frame });
};
