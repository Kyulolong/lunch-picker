export interface Restaurant {
  id: string;
  name: string;
  category: string;
  specialties: string[];
  area: string;
  address: string;
  rating: number;
  priceRange: '저렴' | '보통' | '비쌈';
  openHours?: string;
  phone?: string;
}

export const areas = {
  gangnam: '강남구',
  hongdae: '홍대',
  myeongdong: '명동',
  itaewon: '이태원',
  jongno: '종로',
  sinchon: '신촌',
  konkuk: '건대',
  yeouido: '여의도'
} as const;

export const restaurantList: Restaurant[] = [
  {
    id: 'r001',
    name: '본죽&비빔밥 강남역점',
    category: 'korean',
    specialties: ['비빔밥', '김치찌개', '된장찌개'],
    area: 'gangnam',
    address: '서울 강남구 강남대로 지하396',
    rating: 4.2,
    priceRange: '보통'
  },
  {
    id: 'r002',
    name: '마제소바 이치',
    category: 'japanese',
    specialties: ['라멘'],
    area: 'gangnam',
    address: '서울 강남구 테헤란로 123',
    rating: 4.5,
    priceRange: '보통'
  },
  {
    id: 'r003',
    name: '홍대 떡볶이 명가',
    category: 'snack',
    specialties: ['떡볶이', '순대'],
    area: 'hongdae',
    address: '서울 마포구 와우산로 29길',
    rating: 4.3,
    priceRange: '저렴'
  }
];

export function getRestaurantsForFood(foodName: string, foodCategory: string, selectedArea?: string): Restaurant[] {
  const results = restaurantList.filter(restaurant => {
    const categoryMatch = restaurant.category === foodCategory;
    const foodMatch = restaurant.specialties.includes(foodName);
    const areaMatch = selectedArea ? restaurant.area === selectedArea : true;
    
    return (categoryMatch || foodMatch) && areaMatch;
  });

  return results.slice(0, 5);
}

export function filterByPriceRange(restaurants: Restaurant[], priceRange: string): Restaurant[] {
  if (priceRange === 'all') return restaurants;
  return restaurants.filter(restaurant => restaurant.priceRange === priceRange);
}