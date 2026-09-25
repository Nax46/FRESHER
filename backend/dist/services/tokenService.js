"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
let currentTokenCounter = 0;
let currentSpotlightCounter = 500;
let currentLuckyCounter = 900;
class TokenService {
    static async generateUniqueTokens() {
        currentTokenCounter += 1;
        currentSpotlightCounter += 1;
        currentLuckyCounter += 1;
        return {
            tokenNo: currentTokenCounter,
            spotlightNo: currentSpotlightCounter,
            luckyNo: currentLuckyCounter
        };
    }
    static resetCounters() {
        currentTokenCounter = 0;
        currentSpotlightCounter = 500;
        currentLuckyCounter = 900;
    }
}
exports.TokenService = TokenService;
