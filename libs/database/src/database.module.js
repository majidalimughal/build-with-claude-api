"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const ai_request_entity_1 = require("./entities/ai-request.entity");
const conversation_message_entity_1 = require("./entities/conversation-message.entity");
const conversation_session_entity_1 = require("./entities/conversation-session.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('POSTGRES_HOST', 'localhost'),
                    port: config.get('POSTGRES_PORT', 5432),
                    username: config.get('POSTGRES_USER', 'app'),
                    password: config.get('POSTGRES_PASSWORD', 'app'),
                    database: config.get('POSTGRES_DB', 'ai_platform'),
                    entities: [ai_request_entity_1.AiRequest, conversation_session_entity_1.ConversationSession, conversation_message_entity_1.ConversationMessage],
                    synchronize: config.get('TYPEORM_SYNC', 'false') === 'true',
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                ai_request_entity_1.AiRequest,
                conversation_session_entity_1.ConversationSession,
                conversation_message_entity_1.ConversationMessage,
            ]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map