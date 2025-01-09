"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const getLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT * FROM locations;");
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});
const createLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { building_name, room_name, latitude, longitude, busyness_level, additional_info } = req.body;
        const newLocation = yield db_1.default.query("INSERT INTO locations (building_name, room_name, latitude, longitude, busyness_level, additional_info) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [building_name, room_name, latitude, longitude, busyness_level, additional_info]);
        res.json(newLocation.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
module.exports = { getLocations, createLocation };
