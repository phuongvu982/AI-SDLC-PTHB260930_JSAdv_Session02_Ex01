/**
 * Mock API Data & Helpers - Rikkei Shop (Mô-đun Gọi API bằng fetch)
 * DummyJSON Product API Mocking & Endpoint Catalog
 * Học viên: Vũ Ngọc Minh Phương - Lớp: PTHB260930 - Session 02 Ex 01
 */

const MOCK_API = {
  baseUrl: "https://dummyjson.com",
  endpoints: {
    products: "/products",
    search: "/products/search",
    category: "/products/category",
    singleProduct: "/products/:id",
    statusError: "/http/:code"
  },
  categories: [
    "beauty",
    "fragrances",
    "furniture",
    "groceries",
    "home-decoration",
    "kitchen-accessories",
    "laptops",
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
    "mobile-accessories",
    "motorcycle",
    "skin-care",
    "smartphones",
    "sports-accessories",
    "sunglasses",
    "tablets",
    "tops",
    "vehicle",
    "womens-bags",
    "womens-dresses",
    "womens-jewellery",
    "womens-shoes",
    "womens-watches"
  ],
  sampleProducts: [
    {
      id: 1,
      title: "Essence Mascara Lash Princess",
      description: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.",
      category: "beauty",
      price: 9.99,
      discountPercentage: 7.17,
      rating: 4.94,
      stock: 5,
      brand: "Essence"
    },
    {
      id: 2,
      title: "Eyeshadow Palette with Mirror",
      description: "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks.",
      category: "beauty",
      price: 19.99,
      discountPercentage: 5.5,
      rating: 3.28,
      stock: 44,
      brand: "Glamour Beauty"
    },
    {
      id: 3,
      title: "Powder Canister",
      description: "The Powder Canister is a finely milled setting powder designed to set makeup and control shine.",
      category: "beauty",
      price: 14.99,
      discountPercentage: 18.14,
      rating: 3.82,
      stock: 59,
      brand: "Velvet Touch"
    },
    {
      id: 101,
      title: "Apple AirPods Max Silver",
      description: "The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio.",
      category: "mobile-accessories",
      price: 549.99,
      discountPercentage: 5.12,
      rating: 4.11,
      stock: 25,
      brand: "Apple"
    },
    {
      id: 121,
      title: "iPhone 5s",
      description: "The iPhone 5s is a classic smartphone with a compact design and 4-inch Retina display.",
      category: "smartphones",
      price: 199.99,
      discountPercentage: 11.85,
      rating: 3.92,
      stock: 65,
      brand: "Apple"
    }
  ]
};

// Hỗ trợ môi trường Node.js nếu chạy test runner qua terminal
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MOCK_API };
}
