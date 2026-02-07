export type Prices = {
  juices: Record<string, number>;
  shakes: Record<string, number>;
  fruitChaat: Record<string, number>;
  fruitCut: Record<string, number>;
  fruits: Record<string, number>;
  combos: Record<string, number>;
};

export const defaultPrices: Prices = {
  juices: {
    "Orange (S 300ml)": 30,
    "Orange (L 500ml)": 50,
    "Apple (S 300ml)": 30,
    "Apple (L 500ml)": 50,
    "Pineapple (S 300ml)": 30,
    "Pineapple (L 500ml)": 50,
    "Pomegranate (S 300ml)": 120,
    "Pomegranate (L 500ml)": 180,
    "Mixed Fruit (S 300ml)": 40,
    "Mixed Fruit (L 500ml)": 60,
  },
  shakes: {
    "Vanilla (S 300ml)": 30,
    "Vanilla (L 500ml)": 50,
    "Mango (S 300ml)": 30,
    "Mango (L 500ml)": 50,
    "Strawberry (S 300ml)": 30,
    "Strawberry (L 500ml)": 50,
    "Oreo (S 300ml)": 40,
    "Oreo (L 500ml)": 70,
    "Choco More (S 300ml)": 40,
    "Choco More (L 500ml)": 70,
  },
  fruitChaat: {
    "Fruit Chaat (Small 250g)": 40,
    "Fruit Chaat (Large 500g)": 70,
  },
  fruitCut: {
    "Fruit Cut (Small 250g)": 35,
    "Fruit Cut (Large 500g)": 60,
  },
  fruits: {
    "Seasonal Fruits (500g)": 60,
    "Seasonal Fruits (1 kg)": 120,
  },
  combos: {
    "2 Juices (S 300ml)": 55,
    "1 Juice (S) + 1 Shake (S)": 60,
    "Fruit Chaat (S) + Juice (S)": 65,
    "Family Fruit Box (1 kg)": 150,
  },
};
