"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const fs_1 = require("fs");
const defaultAllowList = [
    '\n',
    ' '
];
const createRule = utils_1.ESLintUtils.RuleCreator(() => '');
const rule = createRule({
    create(context, options) {
        return {
            JSXOpeningElement(node) {
                if (node.name.name != options[0].jsxElementName)
                    return;
                const locales = options[0].locales;
                const translations = importTranslationsFile(options[0].localesPath, locales);
                const target = findLiteralFromJSXOpeningElement(node, defaultAllowList);
                const text = target.value;
                const textTranslations = translations[text];
                const translationsDoesntExist = !textTranslations;
                if (translationsDoesntExist) {
                    context.report({
                        messageId: 'exists',
                        node: node
                    });
                }
            },
        };
    },
    name: 'json-key-exists',
    meta: {
        docs: {
            description: 'I18n keys are translated',
        },
        messages: {
            exists: 'Add this key to the translations file',
        },
        type: 'suggestion',
        schema: [
            {
                type: 'object',
                properties: {
                    jsxElementName: {
                        "type": "string"
                    },
                    localesPath: {
                        "type": "string"
                    },
                    locales: {
                        "type": "array",
                        items: { "type": "string" }
                    }
                }
            }
        ],
    },
    defaultOptions: [
        {
            jsxElementName: 'LocaleText',
            localesPath: 'src/i18n/translations.ts',
            locales: ['fr']
        }
    ],
});
let translations = undefined;
function importTranslationsFile(filePath, locales) {
    if (translations !== undefined)
        return translations;
    const fullPath = `${process.cwd()}/${filePath}`;
    const translationsFile = (0, fs_1.readFileSync)(fullPath, 'utf-8');
    const firstIndex = translationsFile.indexOf('{');
    const translationsString = translationsFile.slice(firstIndex);
    translations = JSON.parse(replaceLocales(translationsString, locales));
    return translations;
}
function replaceLocales(translationsString, locales) {
    let replacedTranslations = translationsString;
    locales.forEach(locale => {
        replacedTranslations = replacedTranslations.replaceAll(locale + ':', `"${locale}":`);
    });
    return replacedTranslations;
}
function findLiteralFromJSXOpeningElement(node, allowList) {
    for (const child of node.parent.children) {
        const target = findLiteral(child);
        if (target) {
            const value = filterValue(target.value, allowList);
            if (value) {
                return target;
            }
        }
    }
    return null;
}
function isLiteral(node) {
    return node.type === 'Literal';
}
function isJSXLiteral(node) {
    return node.type === 'JSXText';
}
function isLiteralUsedDirectlyInJSXExpressionContainer(node) {
    return node.type === 'JSXExpressionContainer' && node.expression.type === 'Literal';
}
function findLiteral(node) {
    if (isLiteral(node) || isJSXLiteral(node)) {
        return node;
    }
    if (isLiteralUsedDirectlyInJSXExpressionContainer(node)) {
        return node.expression;
    }
    return null;
}
function replaceAll(source, str, newStr) {
    return source.replace(new RegExp(str, 'g'), newStr);
}
function filterValue(value, allowList) {
    allowList.forEach(allowStr => {
        value = replaceAll(value, allowStr, '');
    });
    return value;
}
exports.default = rule;
