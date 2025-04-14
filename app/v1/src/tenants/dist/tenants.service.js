"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.TenantService = void 0;
var common_1 = require("@nestjs/common");
var constants_1 = require("./constants");
var application_exceptions_1 = require("../common/exceptions/application.exceptions");
var TenantService = /** @class */ (function () {
    function TenantService(tenantRepository, setupContainer, keycloakTenantService, transactionService, i18n) {
        this.tenantRepository = tenantRepository;
        this.setupContainer = setupContainer;
        this.keycloakTenantService = keycloakTenantService;
        this.transactionService = transactionService;
        this.i18n = i18n;
        this.logger = new common_1.Logger(TenantService_1.name);
    }
    TenantService_1 = TenantService;
    TenantService.prototype.getTenantById = function (orgId) {
        return __awaiter(this, void 0, Promise, function () {
            var tenant, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tenantRepository.findById(orgId)];
                    case 1:
                        tenant = _a.sent();
                        return [2 /*return*/, tenant];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Error fetching tenant by orgId: " + error_1, error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TenantService.prototype.createTenant = function (createTenantDto) {
        return __awaiter(this, void 0, Promise, function () {
            var name, ownerEmail, ownerFirstName, ownerLastName, domain, existingTenant, containerInfo, createOrganizationData, keycloakResponse, keycloakOrgData, locationHeader, organizationId, tenantData, tenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = createTenantDto.name, ownerEmail = createTenantDto.ownerEmail, ownerFirstName = createTenantDto.ownerFirstName, ownerLastName = createTenantDto.ownerLastName;
                        domain = createTenantDto.domain;
                        return [4 /*yield*/, this.checkExistingTenant(domain, name)];
                    case 1:
                        existingTenant = _a.sent();
                        if (existingTenant) {
                            throw new application_exceptions_1.BadRequestException(this.i18n, "tenants", "domain.alreadyExist");
                        }
                        return [4 /*yield*/, this.setupTenantContainer(name)];
                    case 2:
                        containerInfo = _a.sent();
                        return [4 /*yield*/, this.setupContainer.runMigrations(containerInfo)];
                    case 3:
                        _a.sent();
                        createOrganizationData = {
                            name: name,
                            alias: domain,
                            description: "Organization for " + name,
                            redirectUrl: "https://" + domain,
                            domains: [{ name: domain, verified: false }],
                            attributes: {}
                        };
                        return [4 /*yield*/, this.keycloakTenantService.createOrganization(createOrganizationData, ownerEmail, ownerFirstName, ownerLastName)];
                    case 4:
                        keycloakResponse = _a.sent();
                        keycloakOrgData = JSON.parse(keycloakResponse.config.data);
                        locationHeader = keycloakResponse.headers.location;
                        organizationId = locationHeader.split('/').pop();
                        if (!organizationId) {
                            throw new common_1.InternalServerErrorException('Failed to extract organization ID from Keycloak response');
                        }
                        tenantData = {
                            id: organizationId,
                            name: name,
                            owner_email: ownerEmail,
                            redirect_url: keycloakOrgData.redirectUrl,
                            alias: keycloakOrgData.alias,
                            host_domain: domain,
                            db_name: containerInfo.dbName,
                            db_user: containerInfo.dbUser,
                            db_password: containerInfo.dbPassword,
                            db_port: containerInfo.port,
                            container_id: containerInfo.containerId
                        };
                        return [4 /*yield*/, this.insertTenantRecord(tenantData)];
                    case 5:
                        tenant = _a.sent();
                        this.logger.log("Tenant created successfully: " + JSON.stringify(tenant));
                        if (!tenant) {
                            throw new common_1.InternalServerErrorException('Failed to retrieve created tenant');
                        }
                        return [2 /*return*/, tenant];
                }
            });
        });
    };
    TenantService.prototype.checkExistingTenant = function (domain, name) {
        return __awaiter(this, void 0, Promise, function () {
            var existingTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tenantRepository.findByDomainOrName(domain, name)];
                    case 1:
                        existingTenant = _a.sent();
                        if (existingTenant) {
                            if (existingTenant.host_domain === domain) {
                                return [2 /*return*/, { error: 'A tenant with this domain already exists' }];
                            }
                            '';
                            if (existingTenant.name === name) {
                                return [2 /*return*/, { error: 'A tenant with this name already exists' }];
                            }
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    TenantService.prototype.setupTenantContainer = function (name) {
        return __awaiter(this, void 0, Promise, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.setupContainer.createContainer(name.toLowerCase().replace(/\s/g, '_'))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Error setting up tenant container: " + error_2, error_2);
                        throw new common_1.InternalServerErrorException('Failed to set up tenant container');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TenantService.prototype.insertTenantRecord = function (tenantData) {
        return __awaiter(this, void 0, Promise, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tenantRepository.create(tenantData)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error("Error inserting tenant record: " + error_3, error_3);
                        throw new common_1.InternalServerErrorException('Failed to insert tenant record');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TenantService.prototype.updateTenant = function (id, updateTenantDto) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var existingTenant, updatedOrganizationData, ownerFirstName, ownerLastName, domain, updateData, updatedTenantData, updatedTenant, error_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.tenantRepository.findById(id)];
                    case 1:
                        existingTenant = _e.sent();
                        if (!existingTenant) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Tenant not found',
                                    error: 'Tenant not found'
                                }];
                        }
                        updatedOrganizationData = {
                            name: (_a = updateTenantDto.name) !== null && _a !== void 0 ? _a : existingTenant.name,
                            alias: existingTenant.alias,
                            description: "Organization for " + ((_b = updateTenantDto.name) !== null && _b !== void 0 ? _b : existingTenant.name),
                            redirectUrl: "https://" + ((_c = updateTenantDto.domain) !== null && _c !== void 0 ? _c : existingTenant.host_domain),
                            domains: [
                                {
                                    name: (_d = updateTenantDto.domain) !== null && _d !== void 0 ? _d : existingTenant.host_domain,
                                    verified: false
                                }
                            ],
                            attributes: {} // Keep existing attributes or initialize empty
                        };
                        // Update organization in Keycloak
                        return [4 /*yield*/, this.keycloakTenantService.updateOrganization(existingTenant.id, updatedOrganizationData)];
                    case 2:
                        // Update organization in Keycloak
                        _e.sent();
                        ownerFirstName = updateTenantDto.ownerFirstName, ownerLastName = updateTenantDto.ownerLastName, domain = updateTenantDto.domain, updateData = __rest(updateTenantDto, ["ownerFirstName", "ownerLastName", "domain"]);
                        updatedTenantData = __assign(__assign(__assign({}, existingTenant), updateData), { host_domain: domain });
                        return [4 /*yield*/, this.tenantRepository.update(id, updatedTenantData)];
                    case 3:
                        updatedTenant = _e.sent();
                        this.logger.log("Tenant updated successfully: " + JSON.stringify(updatedTenant));
                        return [2 /*return*/, updatedTenant];
                    case 4:
                        error_4 = _e.sent();
                        this.logger.error("Error updating tenant: " + error_4, error_4);
                        return [2 /*return*/, {
                                success: false,
                                message: 'Failed to update tenant'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var TenantService_1;
    TenantService = TenantService_1 = __decorate([
        common_1.Injectable(),
        __param(0, common_1.Inject(constants_1.TENANT_REPOSITORY_TOKEN))
    ], TenantService);
    return TenantService;
}());
exports.TenantService = TenantService;
