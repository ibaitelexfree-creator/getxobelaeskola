
import { NotionBlock, NotionSyncConfig } from './notion-types';

export function createRichText(content: string, bold = false, color: string = 'default', link: string | null = null): any {
    return {
        type: 'text',
        text: { content: String(content || '') },
        link: link ? { url: link } : null,
        annotations: { bold, color }
    };
}

export function createHeading(level: 1 | 2 | 3, content: any[]): NotionBlock {
    const key = `heading_${level}`;
    return {
        type: key,
        [key]: { rich_text: content }
    };
}

export function createParagraph(content: any[]): NotionBlock {
    return {
        type: 'paragraph',
        paragraph: { rich_text: content }
    };
}

export function createCallout(content: any[], iconEmoji: string, color: string = 'default'): NotionBlock {
    return {
        type: 'callout',
        callout: {
            rich_text: content,
            icon: { type: 'emoji', emoji: iconEmoji },
            color
        }
    };
}

export function createColumnList(columns: NotionBlock[][]): NotionBlock {
    return {
        type: 'column_list',
        column_list: {
            children: columns.map(children => ({
                type: 'column',
                column: { children }
            }))
        }
    };
}

export function createDivider(): NotionBlock {
    return {
        type: 'divider',
        divider: {}
    };
}

export function createBulletedListItem(content: any[]): NotionBlock {
    return {
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: content }
    };
}

export function getBestTitleCol(table: string, schema: NotionSyncConfig): string {
    const definitions = schema?.definitions || {};
    const cols = definitions[table]?.properties || {};
    if (cols.nombre_es) return 'nombre_es';
    if (cols.nombre) return 'nombre';
    if (cols.name) return 'name';
    if (cols.titulo) return 'titulo';
    if (cols.title) return 'title';
    if (cols.asunto) return 'asunto';
    if (cols.email) return 'email';
    if (cols.edicion) return 'edicion';
    return 'id';
}
