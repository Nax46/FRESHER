"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
let currentTokenCounter = 0;
let currentLuckyCounter = 100;
let currentSpotlightCounter = 10;
class TokenService {
    static async generateUniqueTokens() {
        currentTokenCounter += 1;
        currentLuckyCounter += 1;
        currentSpotlightCounter += 1;
        return {
            tokenNo: currentTokenCounter,
            luckyNo: currentLuckyCounter,
            spotlightNo: currentSpotlightCounter
        };
    }
    static resetCounters() {
        currentTokenCounter = 0;
        currentLuckyCounter = 100;
        currentSpotlightCounter = 10;
    }
}
exports.TokenService = TokenService;
