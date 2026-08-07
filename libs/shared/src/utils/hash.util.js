"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPayload = hashPayload;
exports.truncateSummary = truncateSummary;
const crypto_1 = require("crypto");
function hashPayload(payload) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(payload)).digest('hex');
}
function truncateSummary(text, maxLength = 500) {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, maxLength)}...`;
}
//# sourceMappingURL=hash.util.js.map