import { useCollaborationStore } from '../store/collaborationStore';
import { webComments } from '../comments';

export function useReviewComments() {
  const store = useCollaborationStore();

  const addComment = (authorId: string, authorName: string, text: string, frame?: number) => {
    const comment = webComments.addComment(authorId, authorName, text, { frame });
    store.appendComment(comment);
    return comment;
  };

  const resolveComment = (id: string) => {
    webComments.resolveComment(id);
    store.setComments(webComments.getComments());
  };

  return {
    comments: store.comments,
    addComment,
    resolveComment,
  };
}
