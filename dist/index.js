"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const json_key_exists_rule_1 = __importDefault(require("./rules/json-key-exists-rule"));
const rules = {
    'json-key-exists': json_key_exists_rule_1.default
};
exports.rules = rules;
