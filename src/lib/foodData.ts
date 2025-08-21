import { Food, foodCategories } from '@/types';

export { foodCategories } from '@/types';

export const foodList: Food[] = [
  // 한식
  { id: 'k1', name: '김치찌개', category: 'korean', tags: ['매운맛', '국물', '따뜻'] },
  { id: 'k2', name: '불고기', category: 'korean', tags: ['고기', '달콤', '구이'] },
  { id: 'k3', name: '비빔밥', category: 'korean', tags: ['야채', '건강', '영양'] },
  { id: 'k4', name: '냉면', category: 'korean', tags: ['시원', '면', '여름'] },
  { id: 'k5', name: '삼겹살', category: 'korean', tags: ['고기', '구이', '소주'] },
  { id: 'k6', name: '김치볶음밥', category: 'korean', tags: ['매운맛', '밥', '간단'] },
  { id: 'k7', name: '된장찌개', category: 'korean', tags: ['국물', '건강', '전통'] },
  { id: 'k8', name: '갈비탕', category: 'korean', tags: ['고기', '국물', '보양'] },
  
  // 중식
  { id: 'c1', name: '짜장면', category: 'chinese', tags: ['면', '달콤', '클래식'] },
  { id: 'c2', name: '짬뽕', category: 'chinese', tags: ['면', '매운맛', '국물', '해산물'] },
  { id: 'c3', name: '탕수육', category: 'chinese', tags: ['고기', '달콤', '튀김', '바삭'] },
  { id: 'c4', name: '마파두부', category: 'chinese', tags: ['매운맛', '두부', '사천'] },
  { id: 'c5', name: '볶음밥', category: 'chinese', tags: ['밥', '볶음', '간단'] },
  { id: 'c6', name: '깐풍기', category: 'chinese', tags: ['닭고기', '매콤달콤', '튀김'] },
  { id: 'c7', name: '유린기', category: 'chinese', tags: ['닭고기', '상큼', '소스'] },
  
  // 일식
  { id: 'j1', name: '초밥', category: 'japanese', tags: ['생선', '밥', '신선'] },
  { id: 'j2', name: '라멘', category: 'japanese', tags: ['면', '국물', '진한맛'] },
  { id: 'j3', name: '돈까스', category: 'japanese', tags: ['고기', '튀김', '바삭'] },
  { id: 'j4', name: '우동', category: 'japanese', tags: ['면', '국물', '부드러운'] },
  { id: 'j5', name: '규동', category: 'japanese', tags: ['밥', '고기', '간장맛'] },
  { id: 'j6', name: '연어덮밥', category: 'japanese', tags: ['생선', '밥', '신선'] },
  { id: 'j7', name: '치킨가라아게', category: 'japanese', tags: ['닭고기', '튀김', '바삭'] },
  
  // 양식
  { id: 'w1', name: '까르보나라', category: 'western', tags: ['파스타', '크림', '진한맛'] },
  { id: 'w2', name: '마르게리타피자', category: 'western', tags: ['피자', '치즈', '토마토'] },
  { id: 'w3', name: '햄버거', category: 'western', tags: ['고기', '빵', '패스트푸드'] },
  { id: 'w4', name: '스테이크', category: 'western', tags: ['고기', '구이', '고급'] },
  { id: 'w5', name: '리조또', category: 'western', tags: ['밥', '크림', '치즈'] },
  { id: 'w6', name: '토마토파스타', category: 'western', tags: ['파스타', '토마토', '상큼'] },
  { id: 'w7', name: '시저샐러드', category: 'western', tags: ['야채', '건강', '상큼'] },
  
  // 분식
  { id: 's1', name: '떡볶이', category: 'snack', tags: ['매운맛', '떡', '달콤'] },
  { id: 's2', name: '김밥', category: 'snack', tags: ['밥', '야채', '간편'] },
  { id: 's3', name: '순대', category: 'snack', tags: ['고기', '따뜻', '전통'] },
  { id: 's4', name: '튀김', category: 'snack', tags: ['튀김', '바삭', '간식'] },
  { id: 's5', name: '라면', category: 'snack', tags: ['면', '국물', '간편'] },
  { id: 's6', name: '핫도그', category: 'snack', tags: ['고기', '빵', '간편'] },
  { id: 's7', name: '토스트', category: 'snack', tags: ['빵', '간편', '아침'] },
  
  // 기타
  { id: 'e1', name: '쌀국수', category: 'etc', tags: ['면', '국물', '베트남', '향신료'] },
  { id: 'e2', name: '팟타이', category: 'etc', tags: ['면', '볶음', '태국', '새콤달콤'] },
  { id: 'e3', name: '인도커리', category: 'etc', tags: ['카레', '밥', '매운맛', '향신료'] },
  { id: 'e4', name: '멕시칸타코', category: 'etc', tags: ['고기', '야채', '멕시코', '매운맛'] },
  { id: 'e5', name: '케밥', category: 'etc', tags: ['고기', '빵', '터키', '향신료'] }
];

// 카테고리별 음식 가져오기
export function getFoodsByCategory(category: string): Food[] {
  if (category === 'all') return foodList;
  return foodList.filter(food => food.category === category);
}

// 랜덤 음식 선택
export function getRandomFood(category: string = 'all'): Food {
  const foods = getFoodsByCategory(category);
  const randomIndex = Math.floor(Math.random() * foods.length);
  return foods[randomIndex];
}