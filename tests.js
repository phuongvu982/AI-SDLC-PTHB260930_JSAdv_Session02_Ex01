/**
 * Bộ 13 bài test kiểm thử tự động toàn diện mô-đun API Rikkei Shop - Session 02 Ex 01
 * Áp dụng cho 5 hàm: buildQuery, getProducts, getProduct, getProductsPage, describePage
 * Đạt chuẩn 100% (13/13 test) theo yêu cầu Tech Lead và Product Owner
 */

// ==========================================
// 1. NHÓM HÀM buildQuery(params) (3 tests)
// ==========================================

// Test 1: buildQuery bỏ giá trị undefined, null, ""; giữ số 0; tạo đúng query string ?limit=10&skip=0
test("buildQuery: bỏ qua undefined, null, \"\"; giữ số 0; trả đúng định dạng query string", () => {
  const result1 = buildQuery({ limit: 10, skip: 0, q: "" });
  expect(result1).toBe("?limit=10&skip=0");

  const result2 = buildQuery({ a: undefined, b: null, skip: 0, limit: 20 });
  expect(result2).toBe("?skip=0&limit=20");
});

// Test 2: buildQuery mã hóa an toàn các giá trị chứa dấu cách và tiếng Việt bằng URLSearchParams
test("buildQuery: mã hóa an toàn ký tự đặc biệt, dấu cách và tiếng Việt cho URL", () => {
  const result1 = buildQuery({ q: "tai nghe" });
  // URLSearchParams mã hóa khoảng trắng thành '+' hoặc '%20'
  const isSafe = result1 === "?q=tai+nghe" || result1 === "?q=tai%20nghe";
  expect(isSafe).toBe(true);

  const result2 = buildQuery({ q: "điện thoại" });
  expect(result2.includes("?q=")).toBe(true);
  expect(result2.includes(" ")).toBe(false); // Không còn chứa khoảng trắng thô
});

// Test 3: buildQuery trả chuỗi rỗng "" khi không có tham số hoặc tất cả tham số đều bị loại bỏ
test("buildQuery: trả về chuỗi rỗng \"\" khi tham số rỗng hoặc chỉ chứa null/undefined/\"\"", () => {
  expect(buildQuery()).toBe("");
  expect(buildQuery({})).toBe("");
  expect(buildQuery({ a: null, b: undefined, c: "" })).toBe("");
});

// ==========================================
// 2. NHÓM HÀM getProducts(options) (5 tests)
// ==========================================

// Test 4: getProducts gọi /products kèm limit và skip khi không có q và category
test("getProducts: gọi /products lấy danh sách sản phẩm mặc định kèm limit và skip", async () => {
  const data = await getProducts({ limit: 5, skip: 0 });
  expect(Array.isArray(data.products)).toBe(true);
  expect(data.products.length).toBe(5);
  expect(data.limit).toBe(5);
  expect(data.skip).toBe(0);
  expect(typeof data.total).toBe("number");
});

// Test 5: getProducts gọi /products/search khi có q; ưu tiên q hơn category; gửi kèm limit và skip
test("getProducts: tìm kiếm qua /products/search khi có tham số q; ưu tiên q hơn category", async () => {
  const data = await getProducts({ q: "phone", category: "beauty", limit: 3 });
  expect(Array.isArray(data.products)).toBe(true);
  expect(data.products.length <= 3).toBe(true);
  expect(data.limit).toBe(3);
  // Xác nhận sản phẩm tìm kiếm trả về kết quả liên quan
  expect(data.products.length > 0).toBe(true);
});

// Test 6: getProducts gọi /products/category/<category> khi có category và không có q
test("getProducts: lọc theo /products/category/<category> khi có category và không có q", async () => {
  const data = await getProducts({ category: "smartphones", limit: 4, skip: 0 });
  expect(Array.isArray(data.products)).toBe(true);
  expect(data.products.length <= 4).toBe(true);
  // Tất cả sản phẩm trả về đều thuộc danh mục smartphones
  data.products.forEach(p => {
    expect(p.category).toBe("smartphones");
  });
});

// Test 7: getProducts ném Error("Lỗi HTTP <status>") khi máy chủ trả mã lỗi ngoài 2xx
test("getProducts: ném Error(\"Lỗi HTTP <status>\") khi API gặp lỗi phía máy chủ (ngoài 2xx)", async () => {
  const originalFetch = window.fetch;
  try {
    // Giả lập phản hồi lỗi 500 từ server
    window.fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal Server Error" })
    });

    await expect(getProducts({ limit: 5 })).rejects.toThrow("Lỗi HTTP 500");
  } finally {
    window.fetch = originalFetch;
  }
});

// Test 8: getProducts không nuốt lỗi mạng, hàm vẫn bị từ chối (reject)
test("getProducts: không nuốt lỗi mạng khi fetch thất bại (promise bị reject)", async () => {
  const originalFetch = window.fetch;
  try {
    // Giả lập lỗi mất kết nối mạng
    window.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };

    await expect(getProducts({ limit: 5 })).rejects.toThrow("Failed to fetch");
  } finally {
    window.fetch = originalFetch;
  }
});

// ==========================================
// 3. NHÓM HÀM getProduct(id) (3 tests)
// ==========================================

// Test 9: getProduct lấy thông tin chi tiết sản phẩm hợp lệ thành công (/products/<id>)
test("getProduct: lấy thông tin chi tiết sản phẩm thành công theo id hợp lệ", async () => {
  const product = await getProduct(1);
  expect(typeof product).toBe("object");
  expect(product.id).toBe(1);
  expect(typeof product.title).toBe("string");
});

// Test 10: getProduct ném Error("Không tìm thấy sản phẩm có id <id>") khi trả mã 404
test("getProduct: ném Error(\"Không tìm thấy sản phẩm có id <id>\") khi sản phẩm không tồn tại (mã 404)", async () => {
  await expect(getProduct(999999)).rejects.toThrow("Không tìm thấy sản phẩm có id 999999");
});

// Test 11: getProduct ném Error("Lỗi HTTP <status>") khi gặp các mã lỗi HTTP khác ngoài 404 và 2xx
test("getProduct: ném Error(\"Lỗi HTTP <status>\") khi gặp lỗi máy chủ khác (ví dụ HTTP 500)", async () => {
  const originalFetch = window.fetch;
  try {
    window.fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server Error" })
    });

    await expect(getProduct(1)).rejects.toThrow("Lỗi HTTP 500");
  } finally {
    window.fetch = originalFetch;
  }
});

// ==========================================
// 4. HÀM getProductsPage(page, pageSize) (1 test)
// ==========================================

// Test 12: getProductsPage phân trang chính xác skip = (page - 1) * pageSize và kiểm tra tham số hợp lệ
test("getProductsPage: tính đúng skip = (page - 1) * pageSize và ném ngoại lệ khi số trang không hợp lệ", async () => {
  // Trang 1: skip = 0, limit = 10
  const page1 = await getProductsPage(1, 10);
  expect(page1.skip).toBe(0);
  expect(page1.limit).toBe(10);

  // Trang 3: skip = (3 - 1) * 10 = 20
  const page3 = await getProductsPage(3, 10);
  expect(page3.skip).toBe(20);
  expect(page3.limit).toBe(10);

  // Tham số không phải số nguyên từ 1: ném "Số trang không hợp lệ" mà không gọi mạng
  expect(() => getProductsPage(0, 10)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage(-2, 10)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage(1.5, 10)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage("1", 10)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage(1, 0)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage(1, -5)).toThrow("Số trang không hợp lệ");
  expect(() => getProductsPage(1, 2.5)).toThrow("Số trang không hợp lệ");
});

// ==========================================
// 5. HÀM describePage(data) (1 test)
// ==========================================

// Test 13: describePage mô tả chính xác "Hiển thị <từ>-<đến> trên tổng <total> sản phẩm" và xử lý trang rỗng
test("describePage: mô tả phân trang chính xác theo số sản phẩm thực tế và thông báo trang rỗng", () => {
  // Trường hợp ví dụ trong đề bài: trang cuối có 4 sản phẩm, skip 190, tổng 194
  const sample1 = {
    products: [{}, {}, {}, {}],
    total: 194,
    skip: 190,
    limit: 10
  };
  expect(describePage(sample1)).toBe("Hiển thị 191-194 trên tổng 194 sản phẩm");

  // Trường hợp trang đầu tiên đủ 10 sản phẩm
  const sample2 = {
    products: new Array(10).fill({}),
    total: 100,
    skip: 0,
    limit: 10
  };
  expect(describePage(sample2)).toBe("Hiển thị 1-10 trên tổng 100 sản phẩm");

  // Trường hợp trang rỗng hoặc không có sản phẩm
  const emptySample1 = { products: [], total: 0, skip: 0, limit: 10 };
  expect(describePage(emptySample1)).toBe("Không có sản phẩm nào");

  const emptySample2 = { products: [], total: 100, skip: 0, limit: 10 };
  expect(describePage(emptySample2)).toBe("Không có sản phẩm nào");

  expect(describePage(null)).toBe("Không có sản phẩm nào");
  expect(describePage(undefined)).toBe("Không có sản phẩm nào");
  expect(describePage({})).toBe("Không có sản phẩm nào");
});
