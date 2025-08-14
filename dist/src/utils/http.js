"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This function constructs urls according to the calling context
 *
 * @param url - The resource url
 * @param options - Object containing options to configure the request, if not supplied, the default method will be POST and not GET, and the default header content-type will be application/json.
 * @param ctx - An object that represents the calling context
 * @returns The result of the fetch call in json format
 *
 */
async function fetcher(url, options = {}, ctx = {}) {
    var _a, _b, _c;
    try {
        if (ctx && ctx.tmdbContext) {
            const showUrl = new URL(url);
            showUrl.searchParams.set("api_key", (_a = ctx === null || ctx === void 0 ? void 0 : ctx.tmdbContext) === null || _a === void 0 ? void 0 : _a.api_key);
            // In the case of account id retrieval, we need to supply the session id
            // reminder: session_id is only needed for mutation purpose like adding ratings
            if ((_b = ctx === null || ctx === void 0 ? void 0 : ctx.tmdbContext) === null || _b === void 0 ? void 0 : _b.session_id) {
                showUrl.searchParams.set("session_id", (_c = ctx === null || ctx === void 0 ? void 0 : ctx.tmdbContext) === null || _c === void 0 ? void 0 : _c.session_id);
            }
            const tmdbResponse = await baseFetch(showUrl, options, "tmdbContext");
            const tmdbErrorResponse = tmdbResponse;
            if (tmdbErrorResponse.success === false)
                throw Error(tmdbErrorResponse.status_message);
            return tmdbResponse;
        }
        const showsResponse = await baseFetch(url, options, "nextproxyContext");
        return showsResponse;
    }
    catch (error) {
        throw error;
    }
}
exports.default = fetcher;
const baseFetch = async (url, options, ctxName) => {
    try {
        const response = await fetch(url, updateOptions(options, ctxName));
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const result = await response.json();
        return result;
    }
    catch (error) {
        if (error instanceof Error)
            throw Error(error.message);
        throw Error(typeof error === "string" ? error : "Unhandled error");
    }
};
const updateOptions = (options, ctxName) => {
    const update = { ...options };
    if (!update.method) {
        update.method = "POST";
    }
    switch (ctxName) {
        case "tmdbContext":
            update.headers = {
                Authorization: "Bearer " + process.env.TMDB_ACCESS_TOKEN,
                "Content-Type": "application/json",
            };
            break;
    }
    return update;
};
