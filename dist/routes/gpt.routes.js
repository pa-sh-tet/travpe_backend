"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gptRouter = void 0;
const express_1 = require("express");
const gpt_controller_1 = require("../controllers/gpt.controller");
exports.gptRouter = (0, express_1.Router)();
exports.gptRouter.get("/places", gpt_controller_1.suggestPlaces);
