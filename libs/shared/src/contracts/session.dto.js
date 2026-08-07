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
exports.SendSessionMessageDto = exports.CreateSessionDto = void 0;
const class_validator_1 = require("class-validator");
const ai_provider_enum_1 = require("../enums/ai-provider.enum");
class CreateSessionDto {
    provider;
    model;
    title;
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, class_validator_1.IsEnum)(ai_provider_enum_1.AiProvider),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "title", void 0);
class SendSessionMessageDto {
    content;
}
exports.SendSessionMessageDto = SendSessionMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSessionMessageDto.prototype, "content", void 0);
//# sourceMappingURL=session.dto.js.map