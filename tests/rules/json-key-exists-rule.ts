import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from "../../src/rules/json-key-exists-rule";

const tester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    }
  }
});

const options = {localesPath: 'test-utils/translations.ts', jsxElementName: 'LocaleText', locales: ['fr']};

tester.run('json-key-exists', rule, {
  valid: [{
    code: '<LocaleText>Home</LocaleText>',
    options: [options]
  }],
  invalid: [
    {
      code: '<LocaleText>Sign In</LocaleText>',
      errors: [{ messageId: 'exists' }],
      options: [options]
    },
  ],
});

tester.run('text-in-curly-braces', rule, {
  valid: [{
    code: '<LocaleText>{"Home"}</LocaleText>',
    options: [options]
  }],
  invalid: [
    {
      code: '<LocaleText>{"Sign In"}</LocaleText>',
      errors: [{ messageId: 'exists' }],
      options: [options]
    },
  ],
});

tester.run('no-error', rule, {
  valid: [{
    code: '<LocaleText>{title}</LocaleText>',
    options: [options]
  }],
  invalid: [
  ],
});
