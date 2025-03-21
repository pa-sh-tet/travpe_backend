"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = require("./routes/auth.routes");
const post_routes_1 = require("./routes/post.routes");
const user_routes_1 = require("./routes/user.routes");
const like_routes_1 = require("./routes/like.routes");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use(express_1.default.json());
exports.app.use("/api/auth", auth_routes_1.authRouter);
exports.app.use("/api/posts", post_routes_1.postRouter);
exports.app.use("/api/users", user_routes_1.userRouter);
exports.app.use("/api/likes", like_routes_1.likeRouter);
exports.app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
