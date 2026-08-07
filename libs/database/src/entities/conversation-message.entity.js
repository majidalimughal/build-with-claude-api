"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMessage = void 0;
const typeorm_1 = require("typeorm");
const shared_1 = require("../../../shared/src");
const conversation_session_entity_1 = require("./conversation-session.entity");
let ConversationMessage = class ConversationMessage {
    id;
    sessionId;
    session;
    role;
    content;
    createdAt;
};
exports.ConversationMessage = ConversationMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConversationMessage.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_session_entity_1.ConversationSession, (session) => session.messages, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", conversation_session_entity_1.ConversationSession)
], ConversationMessage.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: shared_1.MessageRole }),
    __metadata("design:type", String)
], ConversationMessage.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ConversationMessage.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConversationMessage.prototype, "createdAt", void 0);
exports.ConversationMessage = ConversationMessage = __decorate([
    (0, typeorm_1.Entity)('conversation_messages')
], ConversationMessage);
//# sourceMappingURL=conversation-message.entity.js.map