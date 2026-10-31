/**
 * Xử lý tương tác giao diện cửa hàng Rikkei Shop (demo.js)
 * Học viên: Vũ Ngọc Minh Phương - Lớp: PTHB260930 - Session 02 Ex 01
 */

// Trạng thái hiện tại của ứng dụng
const appState = {
  currentPage: 1,
  pageSize: 10,
  currentQuery: "",
  currentCategory: "",
  totalProducts: 0
};

// Phần tử DOM
const inputSearch = document.getElementById("input-search");
const selectCategory = document.getElementById("select-category");
const selectLimit = document.getElementById("select-limit");
const inputId = document.getElementById("input-id");
const btnSearch = document.getElementById("btn-search-submit");
const btnQuickSearchPhone = document.getElementById("btn-quick-search-phone");
const btnQuickCatSmartphones = document.getElementById("btn-quick-cat-smartphones");
const btnQuick404 = document.getElementById("btn-quick-404");
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
const pageIndicator = document.getElementById("page-indicator");
const descText = document.getElementById("desc-text");
const productGrid = document.getElementById("product-grid");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const inspectorUrl = document.getElementById("inspector-url");
const inspectorStatus = document.getElementById("inspector-status");
const productModal = document.getElementById("product-modal");
const modalContent = document.getElementById("modal-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

/**
 * Hiển thị thông báo lỗi trên giao diện
 * @param {string} msg - Chuỗi thông báo lỗi
 */
function showError(msg) {
  if (!errorBanner) return;
  errorMessage.textContent = msg;
  errorBanner.style.display = "flex";
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Ẩn thông báo lỗi
 */
function hideError() {
  if (errorBanner) {
    errorBanner.style.display = "none";
  }
}

/**
 * Cập nhật thanh giám sát URL và mã HTTP
 * @param {string} url - Đường dẫn API vừa gọi
 * @param {number} status - Mã phản hồi HTTP (200, 404, 500,...)
 * @param {boolean} isSuccess - Thành công hay thất bại
 */
function updateInspector(url, status = 200, isSuccess = true) {
  if (inspectorUrl) inspectorUrl.textContent = url;
  if (inspectorStatus) {
    inspectorStatus.textContent = isSuccess ? `${status} OK` : `${status} ERROR`;
    inspectorStatus.className = isSuccess ? "status-badge ok" : "status-badge error";
  }
}

/**
 * Render danh sách sản phẩm ra dạng card lưới
 * @param {Array} products - Mảng các sản phẩm nhận được từ API
 */
function renderProductGrid(products) {
  if (!productGrid) return;

  if (!products || products.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">📦</div>
        <h3>Không tìm thấy sản phẩm nào</h3>
        <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrapper">
        <span class="product-badge">${p.category || "General"}</span>
        <span class="product-id-badge">ID: #${p.id}</span>
        <img class="product-img" src="${p.thumbnail || (p.images && p.images[0]) || 'https://via.placeholder.com/300x200?text=Product'}" alt="${p.title}" loading="lazy">
      </div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.description || "Chưa có mô tả cho sản phẩm này."}</p>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-usd">$${p.price}</span>
            <span class="price-rate">★ ${p.rating || "5.0"} (${p.stock || 0} còn lại)</span>
          </div>
          <button class="btn-detail" onclick="viewProductDetail(${p.id})">Chi tiết</button>
        </div>
      </div>
    </div>
  `).join("");
}

/**
 * Tải và hiển thị danh sách sản phẩm theo bộ lọc hiện tại
 */
async function loadProducts() {
  hideError();
  productGrid.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-icon">⏳</div>
      <h3>Đang tải sản phẩm từ DummyJSON API...</h3>
    </div>
  `;

  try {
    const q = appState.currentQuery;
    const category = appState.currentCategory;
    const limit = appState.pageSize;
    const skip = (appState.currentPage - 1) * limit;

    // Dựng URL dự kiến để hiển thị thanh giám sát
    let path = "/products";
    let params = { limit, skip };
    if (q) {
      path = "/products/search";
      params = { q, limit, skip };
    } else if (category) {
      path = `/products/category/${encodeURIComponent(category)}`;
      params = { limit, skip };
    }
    const fullUrl = `${BASE_URL}${path}${buildQuery(params)}`;

    // Gọi hàm nghiệp vụ getProducts
    const data = await getProducts({ limit, skip, q, category });

    updateInspector(fullUrl, 200, true);

    appState.totalProducts = data.total || 0;

    // Cập nhật dòng mô tả trang bằng hàm nghiệp vụ describePage
    if (descText) {
      descText.innerHTML = `
        <span>${describePage(data)}</span>
        <span class="page-desc-badge">Trang ${appState.currentPage}</span>
      `;
    }

    // Cập nhật trạng thái nút chuyển trang
    if (pageIndicator) pageIndicator.textContent = `Trang ${appState.currentPage}`;
    if (btnPrevPage) btnPrevPage.disabled = appState.currentPage <= 1;
    if (btnNextPage) {
      const maxPages = Math.ceil(appState.totalProducts / appState.pageSize) || 1;
      btnNextPage.disabled = appState.currentPage >= maxPages;
    }

    renderProductGrid(data.products);
  } catch (err) {
    showError(err.message || "Đã xảy ra lỗi khi tải danh sách sản phẩm");
    updateInspector(`${BASE_URL}/products`, 500, false);
    productGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">❌</div>
        <h3>Tải danh sách sản phẩm thất bại</h3>
        <p style="color: #f87171;">${err.message}</p>
      </div>
    `;
  }
}

/**
 * Tra cứu và xem chi tiết sản phẩm qua getProduct(id)
 * @param {number|string} id - Mã sản phẩm
 */
async function viewProductDetail(id) {
  hideError();
  const fullUrl = `${BASE_URL}/products/${encodeURIComponent(id)}`;

  try {
    const p = await getProduct(id);
    updateInspector(fullUrl, 200, true);

    modalContent.innerHTML = `
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <img src="${p.thumbnail || (p.images && p.images[0]) || ''}" alt="${p.title}" style="max-width: 200px; border-radius: 10px; object-fit: cover;">
        <div style="flex: 1; min-width: 220px;">
          <span style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase;">${p.category}</span>
          <h2 style="font-size: 20px; font-weight: 700; margin: 4px 0 10px 0; color: #ffffff;">${p.title}</h2>
          <div style="font-size: 22px; font-weight: 800; color: #34d399; margin-bottom: 8px;">$${p.price}</div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">${p.description}</p>
          <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Thương hiệu:</strong> ${p.brand || "Đang cập nhật"}</div>
            <div><strong>Tồn kho:</strong> ${p.stock || 0} sản phẩm</div>
            <div><strong>Đánh giá:</strong> ★ ${p.rating} / 5.0</div>
          </div>
        </div>
      </div>
    `;
    productModal.classList.add("active");
  } catch (err) {
    showError(err.message);
    updateInspector(fullUrl, 404, false);
  }
}

// Thiết lập các sự kiện giao diện
document.addEventListener("DOMContentLoaded", () => {
  // Tải danh sách mặc định khi mở trang
  loadProducts();

  // Nút tìm kiếm & lọc
  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      const searchId = inputId.value.trim();
      if (searchId) {
        viewProductDetail(searchId);
        return;
      }
      appState.currentQuery = inputSearch.value.trim();
      appState.currentCategory = selectCategory.value;
      appState.pageSize = parseInt(selectLimit.value, 10) || 10;
      appState.currentPage = 1;
      loadProducts();
    });
  }

  // Phím tắt kiểm thử 1: Tìm 'phone' limit=3 (200 OK)
  if (btnQuickSearchPhone) {
    btnQuickSearchPhone.addEventListener("click", () => {
      inputSearch.value = "phone";
      selectCategory.value = "";
      selectLimit.value = "3";
      inputId.value = "";
      appState.currentQuery = "phone";
      appState.currentCategory = "";
      appState.pageSize = 3;
      appState.currentPage = 1;
      loadProducts();
    });
  }

  // Phím tắt kiểm thử 2: Lọc smartphones (200 OK)
  if (btnQuickCatSmartphones) {
    btnQuickCatSmartphones.addEventListener("click", () => {
      inputSearch.value = "";
      selectCategory.value = "smartphones";
      selectLimit.value = "6";
      inputId.value = "";
      appState.currentQuery = "";
      appState.currentCategory = "smartphones";
      appState.pageSize = 6;
      appState.currentPage = 1;
      loadProducts();
    });
  }

  // Phím tắt kiểm thử 3: Tra cứu ID=9999 (404 Error)
  if (btnQuick404) {
    btnQuick404.addEventListener("click", () => {
      inputId.value = "9999";
      viewProductDetail(9999);
    });
  }

  // Chuyển trang trước / sau
  if (btnPrevPage) {
    btnPrevPage.addEventListener("click", () => {
      if (appState.currentPage > 1) {
        appState.currentPage--;
        loadProducts();
      }
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener("click", () => {
      const maxPages = Math.ceil(appState.totalProducts / appState.pageSize) || 1;
      if (appState.currentPage < maxPages) {
        appState.currentPage++;
        loadProducts();
      }
    });
  }

  // Đóng modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      productModal.classList.remove("active");
    });
  }

  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) {
        productModal.classList.remove("active");
      }
    });
  }
});
