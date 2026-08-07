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
exports.ConversationRequestDto = exports.MessageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ai_provider_enum_1 = require("../enums/ai-provider.enum");
const message_type_enum_1 = require("../enums/message-type.enum");
class MessageDto {
    role;
    content;
}
exports.MessageDto = MessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessageDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessageDto.prototype, "content", void 0);
class ConversationRequestDto {
    provider;
    messageType;
    messages;
    model;
    options;
    correlationId;
}
exports.ConversationRequestDto = ConversationRequestDto;
__decorate([
    (0, class_validator_1.IsEnum)(ai_provider_enum_1.AiProvider),
    __metadata("design:type", String)
], ConversationRequestDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(message_type_enum_1.MessageType),
    __metadata("design:type", String)
], ConversationRequestDto.prototype, "messageType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MessageDto),
    __metadata("design:type", Array)
], ConversationRequestDto.prototype, "messages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationRequestDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ConversationRequestDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationRequestDto.prototype, "correlationId", void 0);
//# sourceMappingURL=conversation-request.dto.js.map