"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const articles_routes_1 = __importDefault(require("./routes/articles.routes"));
const tickets_routes_1 = __importDefault(require("./routes/tickets.routes"));
const factures_routes_1 = __importDefault(require("./routes/factures.routes"));
const familles_routes_1 = __importDefault(require("./routes/familles.routes"));
const fournisseursRoutes_1 = __importDefault(require("./routes/fournisseursRoutes"));
const commandesRoutes_1 = __importDefault(require("./routes/commandesRoutes"));
const rapportsZRoutes_1 = __importDefault(require("./routes/rapportsZRoutes"));
const debugRoutes_1 = __importDefault(require("./routes/debugRoutes"));
const tvaRoutes_1 = __importDefault(require("./routes/tvaRoutes"));
const magasinRoutes_1 = __importDefault(require("./routes/magasinRoutes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const photos_routes_1 = __importDefault(require("./routes/photos.routes"));
const stockMagasinRoutes_1 = __importDefault(require("./routes/stockMagasinRoutes"));
const mouvementsStockRoutes_1 = __importDefault(require("./routes/mouvementsStockRoutes"));
const databaseService_1 = require("./services/databaseService");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes API
app.use('/api/health', health_routes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tva', tvaRoutes_1.default);
app.use('/api/magasins', magasinRoutes_1.default);
app.use('/api/send-email', email_routes_1.default);
app.use('/api/photos', photos_routes_1.default);
app.use('/api/debug', debugRoutes_1.default);
// Articles
app.use('/api/articles', articles_routes_1.default);
// Stock : on garde uniquement cette route
app.use('/api/stock-magasin', stockMagasinRoutes_1.default);
// Optionnel : garde cette route seulement si tu l’utilises vraiment
app.use('/api/mouvements-stock', mouvementsStockRoutes_1.default);
// Autres modules
app.use('/api/tickets', tickets_routes_1.default);
app.use('/api/factures', factures_routes_1.default);
app.use('/api/familles', familles_routes_1.default);
app.use('/api/fournisseurs', fournisseursRoutes_1.default);
app.use('/api/commandes', commandesRoutes_1.default);
app.use('/api/rapports-z', rapportsZRoutes_1.default);
console.log('✅ Routes API enregistrées');
// Initialiser la connexion au démarrage
databaseService_1.DatabaseService.initializeConnection().then((connected) => {
    if (connected) {
        console.log('✅ MEGA-Central Backend prêt !');
    }
    else {
        console.log('❌ MEGA-Central Backend non prêt - vérifiez la connexion MySQL');
    }
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
exports.default = app;
