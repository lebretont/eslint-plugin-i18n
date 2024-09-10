import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { readFileSync } from 'fs';

const defaultAllowList = [
  '\n',
  ' '
]

const createRule = ESLintUtils.RuleCreator(() => '');

const rule = createRule({
  create(context, options) {
    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        if ((node.name as TSESTree.JSXIdentifier).name != options[0].jsxElementName) return;
        
        const locales = options[0].locales;

        const translations = importTranslationsFile(options[0].localesPath, locales);
        
        const target = findLiteralFromJSXOpeningElement(node, defaultAllowList);
        
        if (!target) return;

        const text = target.value;

        const textTranslations = translations[text];
        
        const translationsDoesntExist = !textTranslations

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
      description:
        'I18n keys are translated',
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
            items: { "type": "string"}
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

let translations: Record<string, Record<string, string>> | undefined = undefined;

function importTranslationsFile(filePath: string, locales: string[]) {

  if (translations !== undefined) return translations;

  const fullPath = `${process.cwd()}/${filePath}`;
  const translationsFile = readFileSync(fullPath, 'utf-8');

  const firstIndex = translationsFile.indexOf('{');

  const translationsString = translationsFile.slice(firstIndex);
  
  translations = JSON.parse(replaceLocales(translationsString, locales)) as unknown as Record<string, Record<string, string>>;

  return translations;
}

function replaceLocales(translationsString: string, locales:string[]) {
  let replacedTranslations = translationsString;
  
  locales.forEach(locale => {
    replacedTranslations = replacedTranslations.replaceAll(locale + ':', `"${locale}":`)
  });
  
  return replacedTranslations;
}

function findLiteralFromJSXOpeningElement(node: TSESTree.JSXOpeningElement, allowList: string[]) {
  for (const child of (node.parent as TSESTree.JSXElement).children) {
    const target = findLiteral(child)
    if (target) {
      const value = filterValue(target.value, allowList)
      if (value) {
        return target
      }
    }
  }

  return null
}

function isLiteral(node: TSESTree.Node) {
  return node.type === 'Literal'
}

function isJSXLiteral(node: TSESTree.Node) {
  return node.type === 'JSXText'
}

function isLiteralUsedDirectlyInJSXExpressionContainer(node: TSESTree.Node) {
  return node.type === 'JSXExpressionContainer' && node.expression.type === 'Literal'
}

function findLiteral(node: TSESTree.Node) {
  if (isLiteral(node) || isJSXLiteral(node)) {
    return node
  }
  if (isLiteralUsedDirectlyInJSXExpressionContainer(node)) {
    return (node as any).expression
  }

  return null
}

function replaceAll(source: string, str: string, newStr: string) {
  return source.replace(new RegExp(str, 'g'), newStr);
}

function filterValue(value: any, allowList: string[]) {
  allowList.forEach(allowStr => {
    value = replaceAll(value, allowStr, '')
  })

  return value
}

export default rule;