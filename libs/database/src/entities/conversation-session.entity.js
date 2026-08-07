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
exports.ConversationSession = void 0;
const typeorm_1 = require("typeorm");
const shared_1 = require("../../../shared/src");
const conversation_message_entity_1 = require("./conversation-message.entity");
let ConversationSession = class ConversationSession {
    id;
    provider;
    model;
    title;
    messages;
    createdAt;
    updatedAt;
};
exports.ConversationSession = ConversationSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: shared_1.AiProvider }),
    __metadata("design:type", String)
], ConversationSession.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ConversationSession.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ConversationSession.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_message_entity_1.ConversationMessage, (message) => message.session),
    __metadata("design:type", Array)
], ConversationSession.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConversationSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConversationSession.prototype, "updatedAt", void 0);
exports.ConversationSession = ConversationSession = __decorate([
    (0, typeorm_1.Entity)('conversation_sessions')
], ConversationSession);
//# sourceMappingURL=conversation-session.entity.js.map