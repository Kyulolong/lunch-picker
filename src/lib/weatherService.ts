export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  condition: 'clear' | 'rain' | 'snow' | 'clouds' | 'extreme' | 'drizzle' | 'thunderstorm';
}

export interface WeatherRecommendation {
  reason: string;
  recommendedTags: string[];
  avoidTags: string[];
  weightMultiplier: Record<string, number>;
}

export const weatherRecommendations: Record<string, WeatherRecommendation> = {
  clear: {
    reason: "맑은 날씨에는 가벼운 음식이 좋습니다",
    recommendedTags: ['상큼', '시원', '야채', '건강'],
    avoidTags: ['따뜻', '국물'],
    weightMultiplier: {
      'snack': 1.2,
      'western': 1.1,
      'korean': 0.9
    }
  },
  rain: {
    reason: "비 오는 날에는 따뜻한 국물 요리가 생각납니다",
    recommendedTags: ['국물', '매운맛', '따뜻'],
    avoidTags: ['시원', '차가운'],
    weightMultiplier: {
      'korean': 1.4,
      'japanese': 1.2,
      'snack': 1.3
    }
  },
  snow: {
    reason: "추운 눈 오는 날에는 뜨거운 음식으로 몸을 따뜻하게",
    recommendedTags: ['국물', '따뜻', '매운맛', '고기'],
    avoidTags: ['시원', '차가운'],
    weightMultiplier: {
      'korean': 1.5,
      'chinese': 1.2
    }
  },
  clouds: {
    reason: "흐린 날씨에는 든든한 한 끼가 필요합니다",
    recommendedTags: ['든든', '고기', '밥'],
    avoidTags: [],
    weightMultiplier: {
      'korean': 1.2,
      'western': 1.1
    }
  },
  thunderstorm: {
    reason: "천둥번개가 치는 날에는 따뜻한 국물이 최고",
    recommendedTags: ['국물', '매운맛', '따뜻'],
    avoidTags: ['시원'],
    weightMultiplier: {
      'korean': 1.4,
      'snack': 1.2
    }
  },
  drizzle: {
    reason: "이슬비 내리는 날에는 따뜻한 음식이 어울립니다",
    recommendedTags: ['국물', '따뜻'],
    avoidTags: ['시원'],
    weightMultiplier: {
      'korean': 1.3,
      'japanese': 1.1
    }
  },
  extreme: {
    reason: "극한 날씨에는 든든하고 영양가 있는 음식을",
    recommendedTags: ['영양', '든든', '고기'],
    avoidTags: [],
    weightMultiplier: {
      'korean': 1.3,
      'western': 1.1
    }
  }
};

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!API_KEY) {
    console.warn('OpenWeather API 키가 설정되지 않았습니다. 임시 데이터를 사용합니다.');
    return {
      temperature: 18,
      description: '구름조금',
      icon: '02d',
      humidity: 65,
      windSpeed: 2.1,
      condition: 'clouds'
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    );

    if (!response.ok) {
      throw new Error(`Weather API 오류: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      condition: mapWeatherCondition(data.weather[0].main.toLowerCase())
    };
  } catch (error) {
    console.error('날씨 정보 조회 실패:', error);
    return {
      temperature: 18,
      description: '정보 없음',
      icon: '02d',
      humidity: 50,
      windSpeed: 1.0,
      condition: 'clouds'
    };
  }
}

export async function getSeoulWeather(): Promise<WeatherData | null> {
  return getWeatherData(37.5665, 126.9780);
}

export async function getUserLocationWeather(): Promise<WeatherData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('위치 서비스가 지원되지 않습니다.');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const weather = await getWeatherData(latitude, longitude);
        resolve(weather);
      },
      (error) => {
        console.warn('위치 권한이 거부되었습니다:', error);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
}

function mapWeatherCondition(condition: string): WeatherData['condition'] {
  const conditionMap: Record<string, WeatherData['condition']> = {
    'clear': 'clear',
    'rain': 'rain',
    'snow': 'snow',
    'clouds': 'clouds',
    'thunderstorm': 'thunderstorm',
    'drizzle': 'drizzle',
    'mist': 'clouds',
    'fog': 'clouds',
    'haze': 'clouds',
    'dust': 'extreme',
    'sand': 'extreme',
    'ash': 'extreme',
    'squall': 'extreme',
    'tornado': 'extreme'
  };

  return conditionMap[condition] || 'extreme';
}

export function calculateWeatherScore(foodTags: string[], weather: WeatherData): number {
  const recommendation = weatherRecommendations[weather.condition];
  if (!recommendation) return 1.0;
  
  let score = 1.0;

  recommendation.recommendedTags.forEach(tag => {
    if (foodTags.includes(tag)) {
      score += 0.3;
    }
  });

  recommendation.avoidTags.forEach(tag => {
    if (foodTags.includes(tag)) {
      score -= 0.3;
    }
  });

  // 온도별 추가 조정
  if (weather.temperature < 5) {
    if (foodTags.includes('따뜻') || foodTags.includes('국물')) score += 0.2;
    if (foodTags.includes('시원')) score -= 0.2;
  } else if (weather.temperature > 25) {
    if (foodTags.includes('시원') || foodTags.includes('상큼')) score += 0.2;
    if (foodTags.includes('매운맛')) score -= 0.1;
  }

  return Math.max(0.1, score);
}