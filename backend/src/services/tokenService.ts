let currentTokenCounter = 0;
let currentLuckyCounter = 100;
let currentSpotlightCounter = 10;

export class TokenService {
  public static async generateUniqueTokens(): Promise<{ tokenNo: number; luckyNo: number; spotlightNo: number }> {
    currentTokenCounter += 1;
    currentLuckyCounter += 1;
    currentSpotlightCounter += 1;

    return {
      tokenNo: currentTokenCounter,
      luckyNo: currentLuckyCounter,
      spotlightNo: currentSpotlightCounter
    };
  }

  public static resetCounters() {
    currentTokenCounter = 0;
    currentLuckyCounter = 100;
    currentSpotlightCounter = 10;
  }
}
