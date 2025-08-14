"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRQShowsFn = exports.showQueryKeys = void 0;
const http_1 = __importDefault(require("@/utils/http"));
// Effective React Query Keys
// https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
// https://tkdodo.eu/blog/leveraging-the-query-function-context#query-key-factories
exports.showQueryKeys = {
    all: ["shows"],
    detail: (query) => [...exports.showQueryKeys.all, query],
    pagination: (options) => [...exports.showQueryKeys.all, options],
    infinite: () => [...exports.showQueryKeys.all, "infinite"],
};
const getRQShowsFn = async ({ type, value }) => {
    const shows = await (0, http_1.default)(`${process.env.NEXT_PUBLIC_BASEURL}/api/movies/${type}/${type === "pagination" ? value.toString() : value}`, { method: "GET" });
    return shows;
};
exports.getRQShowsFn = getRQShowsFn;
