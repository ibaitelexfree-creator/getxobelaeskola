import { describe, it, expect } from 'vitest';
import {
    createRichText,
    createHeading,
    createParagraph,
    createCallout,
    createColumnList,
    createDivider,
    createBulletedListItem,
    getBestTitleCol
} from './notion-utils';
import { NotionSyncConfig } from './notion-types';

describe('createRichText', () => {
    it('creates a basic rich text object with defaults', () => {
        const result = createRichText('Hello world');
        expect(result).toEqual({
            type: 'text',
            text: { content: 'Hello world' },
            link: null,
            annotations: { bold: false, color: 'default' }
        });
    });

    it('creates a rich text object with all parameters provided', () => {
        const result = createRichText('Click here', true, 'red', 'https://example.com');
        expect(result).toEqual({
            type: 'text',
            text: { content: 'Click here' },
            link: { url: 'https://example.com' },
            annotations: { bold: true, color: 'red' }
        });
    });

    it('handles null/undefined content by casting to string', () => {
        const resultNull = createRichText(null as unknown as string);
        expect(resultNull.text.content).toBe('');

        const resultUndefined = createRichText(undefined as unknown as string);
        expect(resultUndefined.text.content).toBe('');
    });
});

describe('createHeading', () => {
    it('creates a level 1 heading', () => {
        const content = [createRichText('Heading 1')];
        const result = createHeading(1, content);
        expect(result).toEqual({
            type: 'heading_1',
            heading_1: { rich_text: content }
        });
    });

    it('creates a level 2 heading', () => {
        const content = [createRichText('Heading 2')];
        const result = createHeading(2, content);
        expect(result).toEqual({
            type: 'heading_2',
            heading_2: { rich_text: content }
        });
    });

    it('creates a level 3 heading', () => {
        const content = [createRichText('Heading 3')];
        const result = createHeading(3, content);
        expect(result).toEqual({
            type: 'heading_3',
            heading_3: { rich_text: content }
        });
    });
});

describe('createParagraph', () => {
    it('creates a paragraph block', () => {
        const content = [createRichText('Some text')];
        const result = createParagraph(content);
        expect(result).toEqual({
            type: 'paragraph',
            paragraph: { rich_text: content }
        });
    });
});

describe('createCallout', () => {
    it('creates a callout block with default color', () => {
        const content = [createRichText('Watch out!')];
        const result = createCallout(content, '⚠️');
        expect(result).toEqual({
            type: 'callout',
            callout: {
                rich_text: content,
                icon: { type: 'emoji', emoji: '⚠️' },
                color: 'default'
            }
        });
    });

    it('creates a callout block with custom color', () => {
        const content = [createRichText('Success!')];
        const result = createCallout(content, '✅', 'green_background');
        expect(result).toEqual({
            type: 'callout',
            callout: {
                rich_text: content,
                icon: { type: 'emoji', emoji: '✅' },
                color: 'green_background'
            }
        });
    });
});

describe('createColumnList', () => {
    it('creates a column list with columns', () => {
        const col1Content = [createParagraph([createRichText('Column 1')])];
        const col2Content = [createParagraph([createRichText('Column 2')])];

        const result = createColumnList([col1Content, col2Content]);
        expect(result).toEqual({
            type: 'column_list',
            column_list: {
                children: [
                    {
                        type: 'column',
                        column: { children: col1Content }
                    },
                    {
                        type: 'column',
                        column: { children: col2Content }
                    }
                ]
            }
        });
    });
});

describe('createDivider', () => {
    it('creates a divider block', () => {
        const result = createDivider();
        expect(result).toEqual({
            type: 'divider',
            divider: {}
        });
    });
});

describe('createBulletedListItem', () => {
    it('creates a bulleted list item block', () => {
        const content = [createRichText('List item')];
        const result = createBulletedListItem(content);
        expect(result).toEqual({
            type: 'bulleted_list_item',
            bulleted_list_item: { rich_text: content }
        });
    });
});

describe('getBestTitleCol', () => {
    it('returns nombre_es when available', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                users: {
                    properties: {
                        id: { type: 'string' },
                        nombre_es: { type: 'string' },
                        nombre: { type: 'string' },
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('nombre_es');
    });

    it('returns nombre when nombre_es is not available', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                users: {
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        name: { type: 'string' },
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('nombre');
    });

    it('returns name when higher priority cols are not available', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                users: {
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        titulo: { type: 'string' },
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('name');
    });

    it('returns titulo when higher priority cols are not available', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                users: {
                    properties: {
                        id: { type: 'string' },
                        titulo: { type: 'string' },
                        title: { type: 'string' },
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('titulo');
    });

    it('returns id when no recognizable title columns are found', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                users: {
                    properties: {
                        id: { type: 'string' },
                        age: { type: 'number' },
                        address: { type: 'string' },
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('id');
    });

    it('handles undefined schema gracefully', () => {
        expect(getBestTitleCol('users', undefined as unknown as NotionSyncConfig)).toBe('id');
    });

    it('handles table not found in schema gracefully', () => {
        const schema: NotionSyncConfig = {
            definitions: {
                other_table: {
                    properties: {
                        nombre: { type: 'string' }
                    }
                }
            }
        };
        expect(getBestTitleCol('users', schema)).toBe('id');
    });
});
