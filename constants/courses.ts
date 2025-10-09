export type FoodItem = { id: number; name: string; price: number };
export type Course = { id: number; name: string; items: FoodItem[] };

export function getSampleCourses(): Course[] {
const courses: Course[] = [
    { id: 1, name: 'Decadent Desserts', items: [
      { id: 1001, name: 'Chocolate Lava Cake', price: 280.0 },
      { id: 1002, name: 'Tiramisu', price: 260.0 },
      { id: 1003, name: 'New York Cheesecake', price: 250.0 },
      { id: 1004, name: 'Crème Brûlée', price: 270.0 },
      { id: 1005, name: 'Chocolate Lava Cake', price: 280.0 },
      { id: 1006, name: 'Tiramisu', price: 260.0 },
      { id: 1007, name: 'New York Cheesecake', price: 250.0 },
      { id: 1008, name: 'Crème Brûlée', price: 270.0 },
      { id: 1009, name: 'Chocolate Lava Cake', price: 280.0 },
      { id: 1010, name: 'Tiramisu', price: 260.0 },
      { id: 1011, name: 'New York Cheesecake', price: 250.0 },
      { id: 1012, name: 'Crème Brûlée', price: 270.0 },
    ]},
    { id: 2, name: 'Soups', items: [
      { id: 2001, name: 'Cream of Mushroom', price: 180.0 },
      { id: 2002, name: 'Tomato Basil', price: 170.0 },
      { id: 2003, name: 'French Onion', price: 200.0 },
      { id: 2004, name: 'Chicken Noodle', price: 190.0 },
      { id: 2005, name: 'Minestrone', price: 180.0 },
      { id: 2006, name: 'Thai Coconut Curry', price: 220.0 },
    ]},
    { id: 4, name: 'Fresh Juices', items: [
      { id: 4001, name: 'Watermelon Mint', price: 150.0 },
      { id: 4002, name: 'Green Detox', price: 160.0 },
      { id: 4003, name: 'Tropical Blend', price: 170.0 },
      { id: 4004, name: 'Carrot Ginger', price: 140.0 },
      { id: 4005, name: 'Orange Sunrise', price: 130.0 },
      { id: 4006, name: 'Berry Blast', price: 180.0 },
    ]},
    { id: 5, name: 'Mocktails', items: [
      { id: 5001, name: 'Virgin Mojito', price: 180.0 },
      { id: 5002, name: 'Strawberry Daiquiri', price: 190.0 },
      { id: 5003, name: 'Pina Colada', price: 200.0 },
      { id: 5004, name: 'Sunset Cooler', price: 170.0 },
      { id: 5005, name: 'Blue Lagoon', price: 185.0 },
      { id: 5006, name: 'Passion Fruit Fizz', price: 195.0 },
    ]},
    { id: 6, name: 'Italian Pizza', items: [
      { id: 6001, name: 'Margherita Classica', price: 420.0 },
      { id: 6002, name: 'Pepperoni Supreme', price: 480.0 },
      { id: 6003, name: 'Quattro Formaggi', price: 450.0 },
      { id: 6004, name: 'Truffle Mushroom', price: 520.0 },
      { id: 6005, name: 'BBQ Chicken', price: 460.0 },
      { id: 6006, name: 'Vegetariana', price: 440.0 },
    ]},
    { id: 7, name: 'Gourmet Sandwiches', items: [
      { id: 7001, name: 'Club Sandwich', price: 280.0 },
      { id: 7002, name: 'Grilled Cheese Deluxe', price: 220.0 },
      { id: 7003, name: 'Chicken Panini', price: 260.0 },
      { id: 7004, name: 'Reuben Sandwich', price: 300.0 },
      { id: 7005, name: 'BLT Supreme', price: 240.0 },
      { id: 7006, name: 'Steak & Cheese', price: 350.0 },
    ]},
    { id: 8, name: 'Artisan Pasta', items: [
      { id: 8001, name: 'Spaghetti Carbonara', price: 340.0 },
      { id: 8002, name: 'Fettuccine Alfredo', price: 360.0 },
      { id: 8003, name: 'Penne Arrabiata', price: 320.0 },
      { id: 8004, name: 'Lobster Linguine', price: 580.0 },
      { id: 8005, name: 'Pesto Genovese', price: 330.0 },
      { id: 8006, name: 'Lasagna Bolognese', price: 380.0 },
    ]},
    { id: 9, name: 'Poultry Excellence', items: [
      { id: 9001, name: 'Herb-Roasted Chicken', price: 420.0 },
      { id: 9002, name: "Duck à l'Orange", price: 680.0 },
      { id: 9003, name: 'Chicken Cordon Bleu', price: 480.0 },
      { id: 9004, name: 'Turkey Breast with Cranberry', price: 450.0 },
      { id: 9005, name: 'Grilled Chicken Breast', price: 380.0 },
      { id: 9006, name: 'Chicken Tikka Masala', price: 440.0 },
    ]},
    { id: 11, name: 'Seafood Specialties', items: [
      { id: 11001, name: 'Grilled Atlantic Salmon', price: 650.0 },
      { id: 11002, name: 'Lobster Thermidor', price: 1280.0 },
      { id: 11003, name: 'Garlic Butter Tiger Prawns', price: 580.0 },
      { id: 11004, name: 'Seafood Paella', price: 720.0 },
      { id: 11005, name: 'Pan-Seared Sea Bass', price: 620.0 },
      { id: 11006, name: 'Grilled Octopus', price: 690.0 },
    ]},
    { id: 12, name: 'Side Orders', items: [
      { id: 12001, name: 'Garlic Mashed Potatoes', price: 120.0 },
      { id: 12002, name: 'Seasonal Vegetables', price: 100.0 },
      { id: 12003, name: 'Truffle Fries', price: 150.0 },
      { id: 12004, name: 'Onion Rings', price: 130.0 },
      { id: 12005, name: 'Creamed Spinach', price: 110.0 },
      { id: 12006, name: 'Mac & Cheese', price: 140.0 },
    ]},
    { id: 13, name: 'Signature Burgers', items: [
      { id: 13001, name: 'Classic Cheeseburger', price: 320.0 },
      { id: 13002, name: 'Gourmet Beef Burger', price: 380.0 },
      { id: 13003, name: 'Chicken Burger', price: 290.0 },
      { id: 13004, name: 'Vegetarian Burger', price: 270.0 },
      { id: 13005, name: 'Bacon BBQ Burger', price: 360.0 },
      { id: 13006, name: 'Mushroom Swiss Burger', price: 340.0 },
    ]},
  ].sort((a, b) => a.id - b.id);

  return courses;
}



