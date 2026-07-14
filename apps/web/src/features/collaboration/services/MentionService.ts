import { Mention } from '@ai-video-editor/shared';

export class MentionService {
  /**
   * Scans a comment body to extract user mentions (e.g. "@jules") or role references (e.g. "@editor", "@reviewer").
   */
  public static parseMentions(text: string): { usernames: string[]; roles: string[] } {
    const mentionRegex = /@(\w+)/g;
    const usernames: string[] = [];
    const roles: string[] = [];

    const standardRoles = new Set(['editor', 'reviewer', 'admin', 'producer', 'client']);

    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const name = match[1].toLowerCase();
      if (standardRoles.has(name)) {
        roles.push(name);
      } else {
        usernames.push(match[1]);
      }
    }

    return {
      usernames,
      roles,
    };
  }

  /**
   * Replaces raw mentions in text with styled HTML elements or custom markers for frontend rendering.
   */
  public static highlightMentions(text: string): string {
    return text.replace(/@(\w+)/g, (match, name) => {
      return `<span class="mention" style="color: #90caf9; font-weight: bold;">@${name}</span>`;
    });
  }
}
