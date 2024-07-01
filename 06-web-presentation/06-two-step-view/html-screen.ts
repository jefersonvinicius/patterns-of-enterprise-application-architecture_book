import { Element, LogicalRenderer, TableElement, TitleElement } from './logical-screen';

interface ElementHTMLRenderer {
  render(): Promise<string>;
}

export class TitleElementHTMLRenderer implements ElementHTMLRenderer {
  constructor(private element: TitleElement) {}

  async render(): Promise<string> {
    return `<h1>${this.element.content}</h1>`;
  }
}

export class TableElementHTMLRenderer implements ElementHTMLRenderer {
  constructor(private element: TableElement) {}

  async render(): Promise<string> {
    const headersColumns = `<tr>${this.element.columns.map((column) => `<th>${column}</th>`).join('')}</tr>`;
    const rows = this.element.rows
      .map((row) => `<tr>${row.columns.map((column) => `<td>${column}</td>`).join('')}</tr>`)
      .join('');
    return `
      <table>
        ${headersColumns}
        ${rows}
      </table>
    `;
  }
}

export class HtmlScreen {
  private elements: Element[] = [];

  constructor(logicalRenderer: LogicalRenderer) {
    this.elements = logicalRenderer.render();
  }

  async render() {
    const renders = this.elements.map((element) => this.rendererFor(element).render());
    const page = (await Promise.all(renders)).join('');
    return page;
  }

  private rendererFor(element: Element) {
    switch (element.name) {
      case 'table':
        return new TableElementHTMLRenderer(element);
      case 'title':
        return new TitleElementHTMLRenderer(element);
      default:
        throw new Error(`Unknown ${JSON.stringify(element)} element`);
    }
  }
}
