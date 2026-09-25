let currentTokenCounter = 0;
let currentSpotlightCounter = 500;
let currentLuckyCounter = 900;

export class TokenService {
  public static async generateUniqueTokens(): Promise<{ tokenNo: number; luckyNo: number; spotlightNo: number }> {
    currentTokenCounter += 1;
    currentSpotlightCounter += 1;
    currentLuckyCounter += 1;

    return {
      tokenNo: currentTokenCounter,
      spotlightNo: currentSpotlightCounter,
      luckyNo: currentLuckyCounter
    };
  }

  public static resetCounters() {
    currentTokenCounter = 0;
    currentSpotlightCounter = 500;
    currentLuckyCounter = 900;
  }
}
