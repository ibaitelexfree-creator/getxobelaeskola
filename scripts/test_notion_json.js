
const rt = (content, bold = false, color = 'default', link = null) => {
    const obj = { type: 'text', text: { content } };
    if (link) obj.text.link = { url: link };
    if (bold || color !== 'default') {
        obj.annotations = {};
        if (bold) obj.annotations.bold = true;
        if (color !== 'default') obj.annotations.color = color;
    }
    return obj;
};

const block = {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
        rich_text: [
            rt(`Customer: `, true),
            rt(`Amount`)
        ]
    }
};

console.log(JSON.stringify(block, null, 2));
