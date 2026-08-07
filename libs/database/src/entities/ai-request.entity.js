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
exports.AiRequest = void 0;
const typeorm_1 = require("typeorm");
const shared_1 = require("../../../shared/src");
let AiRequest = class AiRequest {
    id;
    correlationId;
    provider;
    messageType;
    payloadHash;
    status;
    responseSummary;
    error;
    createdAt;
    updatedAt;
    completedAt;
};
exports.AiRequest = AiRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AiRequest.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: shared_1.AiProvider }),
    __metadata("design:type", String)
], AiRequest.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: shared_1.MessageType }),
    __metadata("design:type", String)
], AiRequest.prototype, "messageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AiRequest.prototype, "payloadHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: shared_1.AiRequestStatus, default: shared_1.AiRequestStatus.PENDING }),
    __metadata("design:type", String)
], AiRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AiRequest.prototype, "responseSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AiRequest.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AiRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AiRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], AiRequest.prototype, "completedAt", void 0);
exports.AiRequest = AiRequest = __decorate([
    (0, typeorm_1.Entity)('ai_requests')
], AiRequest);
//# sourceMappingURL=ai-request.entity.js.map