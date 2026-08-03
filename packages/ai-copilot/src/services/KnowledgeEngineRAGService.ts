export interface KnowledgeDoc {
  id: string;
  sourceType: 'documentation' | 'template' | 'plugin' | 'user_project' | 'workflow';
  title: string;
  content: string;
}

export class KnowledgeEngineRAGService {
  private knowledgeBase: KnowledgeDoc[] = [];

  constructor() {
    this.seedDefaultKnowledge();
  }

  private seedDefaultKnowledge() {
    this.knowledgeBase.push(
      {
        id: 'doc-1',
        sourceType: 'documentation',
        title: 'NLE Timeline Trimming and Splitting Guide',
        content: 'Trimming and splitting can be done by calling trimClip(projectId, clipId, start, end) and splitClip(projectId, clipId, splitTimeSec).'
      },
      {
        id: 'doc-2',
        sourceType: 'plugin',
        title: 'Transition Generator Plugin SDK Reference',
        content: 'The dynamic transition generator plugin lets you apply camera slide, dissolve, or fade_cross transitions dynamically across cuts.'
      },
      {
        id: 'doc-3',
        sourceType: 'template',
        title: 'Cinematic Vertical Shorts Template Blueprint',
        content: 'Vertical shorts template crops horizontal clips to portrait format 9:16 aspect ratio automatically using auto-crop focus nodes.'
      }
    );
  }

  public indexKnowledge(doc: KnowledgeDoc): void {
    this.knowledgeBase.push(doc);
  }

  public queryRAG(queryText: string): { answer: string; matchedSources: KnowledgeDoc[] } {
    const q = queryText.toLowerCase();

    // Semantic vector matching simulation using keyword weights
    const matched = this.knowledgeBase.filter(doc =>
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.sourceType.toLowerCase().includes(q)
    );

    let answer = `I could not locate specific references for "${queryText}". Try asking about transitions, templates, or splitting clips.`;
    if (matched.length > 0) {
      const topMatch = matched[0];
      answer = `Based on our knowledge base retrieved from [${topMatch.sourceType.toUpperCase()}]: **${topMatch.title}**, here is the context: ${topMatch.content}`;
    }

    return {
      answer,
      matchedSources: matched,
    };
  }
}
