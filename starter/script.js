/**
 * Mô-đun gọi API sản phẩm Rikkei Shop bằng fetch
 * Học viên: Vũ Ngọc Minh Phương - Lớp: PTHB260930 - Session 02 Ex 01
 */

const BASE_URL = "https://dummyjson.com";

/**
 * Xây dựng chuỗi truy vấn (query string) URL an toàn từ đối tượng tham số
 * @param {Object} params - Đối tượng chứa các tham số truy vấn
 * @returns {string} Chuỗi query string dạng ?key=val&... hoặc chuỗi rỗng
 */
function buildQuery(params) {
  if (!params || typeof params !== "object") {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    // Bỏ qua undefined, null, chuỗi rỗng; giữ lại số 0 và các giá trị hợp lệ khác
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Lấy danh sách sản phẩm từ API theo từ khóa tìm kiếm, danh mục hoặc phân trang
 * @param {Object} [options={}] - Các tùy chọn lọc và phân trang
 * @param {number} [options.limit] - Số lượng sản phẩm tối đa
 * @param {number} [options.skip] - Số lượng sản phẩm bỏ qua
 * @param {string} [options.q] - Từ khóa tìm kiếm
 * @param {string} [options.category] - Tên danh mục sản phẩm
 * @returns {Promise<Object>} Dữ liệu JSON gồm { products, total, skip, limit }
 */
async function getProducts({ limit, skip, q, category } = {}) {
  let endpoint = "/products";
  let queryParams = {};

  const hasQ = q !== undefined && q !== null && String(q).trim() !== "";
  const hasCategory = !hasQ && category !== undefined && category !== null && String(category).trim() !== "";

  if (hasQ) {
    endpoint = "/products/search";
    queryParams = { q, limit, skip };
  } else if (hasCategory) {
    endpoint = `/products/category/${encodeURIComponent(category)}`;
    queryParams = { limit, skip };
  } else {
    endpoint = "/products";
    queryParams = { limit, skip };
  }

  const url = `${BASE_URL}${endpoint}${buildQuery(queryParams)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lỗi HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Lấy thông tin chi tiết một sản phẩm theo mã định danh (id)
 * @param {number|string} id - Mã định danh của sản phẩm
 * @returns {Promise<Object>} Đối tượng chi tiết sản phẩm
 */
async function getProduct(id) {
  const url = `${BASE_URL}/products/${encodeURIComponent(id)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Không tìm thấy sản phẩm có id ${id}`);
    }
    throw new Error(`Lỗi HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Lấy danh sách sản phẩm theo số trang và số lượng sản phẩm mỗi trang
 * @param {number} page - Số thứ tự trang (bắt đầu từ 1)
 * @param {number} [pageSize=10] - Số lượng sản phẩm mỗi trang (mặc định 10)
 * @returns {Promise<Object>} Danh sách sản phẩm kèm metadata phân trang
 */
function getProductsPage(page, pageSize = 10) {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  ) {
    throw new Error("Số trang không hợp lệ");
  }

  const skip = (page - 1) * pageSize;
  return getProducts({ limit: pageSize, skip });
}

/**
 * Mô tả thông tin trang sản phẩm hiện tại
 * @param {Object} data - Dữ liệu phản hồi gồm products, total, skip, limit
 * @returns {string} Chuỗi mô tả phân trang
 */
function describePage(data) {
  if (
    !data ||
    !Array.isArray(data.products) ||
    data.products.length === 0 ||
    data.total === 0
  ) {
    return "Không có sản phẩm nào";
  }

  const from = data.skip + 1;
  const to = data.skip + data.products.length;

  return `Hiển thị ${from}-${to} trên tổng ${data.total} sản phẩm`;
}

// Hỗ trợ môi trường kiểm thử Node.js nếu cần
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BASE_URL,
    buildQuery,
    getProducts,
    getProduct,
    getProductsPage,
    describePage
  };
}
