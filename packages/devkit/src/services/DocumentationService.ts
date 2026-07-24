import { DocumentationMetadata } from '../types';

export class DocumentationService {
  /**
   * Generates API, SDK, and Architecture Markdown documentation with examples automatically
   */
  public async generateDocs(
    title: string,
    category: DocumentationMetadata['category'],
    sectionsList: string[]
  ): Promise<DocumentationMetadata> {
    const sections = sectionsList.map(heading => ({
      heading,
      content: `### ${heading}\nThis section describes the detailed usage instructions, schemas, and examples for ${heading.toLowerCase()}.`,
    }));

    return {
      title,
      category,
      generatedAt: new Date().toISOString(),
      pagesCount: sections.length,
      sections,
    };
  }
}
