import { CommentService } from '@ai-video-editor/collaboration';

export const webComments = new CommentService();
export const listAllComments = () => webComments.getComments();
