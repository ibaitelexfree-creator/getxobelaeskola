import DOMPurify from 'isomorphic-dompurify';

const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: []
};

const sanitize = (content: string) => {
    return DOMPurify.sanitize(content, config);
};

const tests = [
    {
        input: '<p>Hello world</p>',
        expected: '<p>Hello world</p>',
        description: 'Allowed tag <p>'
    },
    {
        input: '<h1>Title</h1>',
        expected: '<h1>Title</h1>',
        description: 'Allowed tag <h1>'
    },
    {
        input: '<script>alert("xss")</script>',
        expected: '',
        description: 'Strip <script>'
    },
    {
        input: '<div onclick="alert(1)">Click me</div>',
        expected: 'Click me',
        description: 'Strip event handlers and disallowed tag <div>'
    },
    {
        input: '<p style="color:red">Styled</p>',
        expected: '<p>Styled</p>',
        description: 'Strip style attribute'
    },
    {
        input: '<a href="javascript:alert(1)">Link</a>',
        expected: 'Link',
        description: 'Strip javascript: URL and disallowed tag <a>'
    },
    {
        input: '<strong>Bold</strong> and <em>Italic</em>',
        expected: '<strong>Bold</strong> and <em>Italic</em>',
        description: 'Allowed formatting tags'
    }
];

let failed = false;

tests.forEach((test, index) => {
    const output = sanitize(test.input);
    if (output !== test.expected) {
        console.error(`Test ${index + 1} failed: ${test.description}`);
        console.error(`Expected: "${test.expected}"`);
        console.error(`Actual:   "${output}"`);
        failed = true;
    } else {
        console.log(`Test ${index + 1} passed: ${test.description}`);
    }
});

if (failed) {
    process.exit(1);
} else {
    console.log('All tests passed!');
}
