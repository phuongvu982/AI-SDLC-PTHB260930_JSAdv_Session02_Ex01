# BÁO CÁO SỬA MÃ GỌI API DANH SÁCH VÀ CHI TIẾT SẢN PHẨM RIKKEI SHOP (FETCH & ASYNC/AWAIT)
**Học viên:** Vũ Ngọc Minh Phương  
**Khóa học:** AI-SDLC • Lớp PTHB260930  
**Bài tập:** JSAdv Session 02 - Ex 01 (Mô-đun Gọi API DummyJSON bằng Fetch)  

---

## 1. Ghi chú tóm tắt quá trình tìm lỗi và sửa mã (3 - 5 câu theo yêu cầu)

1. Khi rà soát mã nguồn ban đầu của cửa hàng, em phát hiện hàm `buildQuery` ghép chuỗi thô sơ khiến giá trị `skip=0` bị loại bỏ (do ép kiểu falsy), xuất hiện dấu `?` và `&` thừa khi không có tham số, đồng thời không mã hóa URL cho tiếng Việt hoặc khoảng trắng; em đã khắc phục bằng cách sử dụng đối tượng chuẩn `URLSearchParams` và kiểm tra điều kiện nghiêm ngặt để giữ lại số `0`.
2. Ở hai hàm gọi mạng `getProducts` và `getProduct`, mã cũ bỏ sót tham số `q` và `category`, dùng Promise thô sơ và không kiểm tra `response.ok` khiến `fetch` không thể phát hiện mã lỗi 404 hay 500; em đã chuyển đổi sang `async/await`, phân nhánh đúng các endpoint `/products/search` và `/products/category/<category>`, đồng thời kiểm tra `response.status` để ném ngoại lệ chính xác: mã 404 ném `"Không tìm thấy sản phẩm có id <id>"` và các mã khác ngoài 2xx ném `"Lỗi HTTP <status>"`.
3. Hàm phân trang `getProductsPage` bị lỗi nghiêm trọng khi tính `skip = page * pageSize` (khiến trang 2 bắt đầu từ sản phẩm thứ 21 và bỏ sót mất 10 sản phẩm của trang); em đã sửa lại công thức chuẩn `skip = (page - 1) * pageSize`, bổ sung kiểm tra điều kiện `Number.isInteger` để chặn các giá trị số trang không hợp lệ trước khi gửi yêu cầu mạng.
4. Cuối cùng, hàm `describePage` ban đầu tính chỉ số đếm từ 0 và cộng trực tiếp `data.limit` làm vượt quá tổng số sản phẩm ở trang cuối; em đã sửa để đếm từ 1 (`data.skip + 1`), tính mốc kết thúc theo số sản phẩm thực tế trong mảng (`data.skip + data.products.length`), và trả về `"Không có sản phẩm nào"` khi trang rỗng.

---

## 2. Bảng phân tích chi tiết các Test Case phát hiện lỗi trên mã nguồn ban đầu

| STT | Hàm & Dữ liệu đầu vào (Input) | Kết quả thực tế bị lỗi (Buggy Output) | Kết quả kỳ vọng đúng (Expected Output) | Dòng code gây lỗi (Failing Code) | Giải thích nguyên nhân & Hướng xử lý |
|:---:|---|---|---|---|---|
| **1** | `buildQuery({ limit: 10, skip: 0, q: "" })` | `"?limit=10&"` | `"?limit=10&skip=0"` | `if (params[key])` | Trong JavaScript, số `0` bị ép kiểu boolean thành `false`, dẫn đến tham số `skip: 0` bị bỏ qua; đồng thời vòng lặp luôn nối thêm dấu `&` thừa ở cuối chuỗi. Cần dùng `URLSearchParams` và lọc `value !== undefined && value !== null && value !== ""`. |
| **2** | `buildQuery({ q: "tai nghe" })` | `"?q=tai nghe&"` | `"?q=tai+nghe"` | `query += key + "=" + params[key]` | Ghép chuỗi trực tiếp không mã hóa URL ký tự khoảng trắng hoặc tiếng Việt có dấu (`encodeURIComponent` / `URLSearchParams`), làm URL bị lỗi khi truyền qua giao thức HTTP. |
| **3** | `buildQuery({})` | `"?"` | `""` | `let query = "?"; return query;` | Khởi tạo chuỗi bằng dấu `"?"` rồi trả về ngay cả khi đối tượng không chứa tham số nào, gây thừa dấu hỏi chấm ở cuối URL gọi mạng. |
| **4** | `getProducts({ category: "smartphones" })` | Gọi endpoint `/products`, trả về danh mục hỗn hợp | Gọi endpoint `/products/category/smartphones` | `const url = BASE_URL + "/products"` | Bỏ qua hoàn toàn thuộc tính `category`, khiến khách hàng chọn lọc danh mục "smartphones" nhưng hệ thống vẫn tải toàn bộ danh sách chưa lọc. |
| **5** | `getProducts({ q: "phone", limit: 3 })` | Bỏ sót `q`, gọi `/products?limit=3` | Gọi endpoint `/products/search?q=phone&limit=3` | Bỏ qua tham số `q` trong `getProducts` | Cần ưu tiên kiểm tra `q`: nếu có `q` thì gọi `/products/search?q=...`; nếu không có `q` mà có `category` thì gọi `/products/category/<category>`. |
| **6** | `getProducts` gặp lỗi máy chủ HTTP 500 | Không ném lỗi, trả về đối tượng JSON lạ | Ném ngoại lệ `Error("Lỗi HTTP 500")` | Thiếu kiểm tra `response.ok` | Bản chất cơ chế `fetch` không tự động reject khi gặp mã trạng thái 4xx hoặc 500; cần chủ động kiểm tra `if (!response.ok) throw new Error("Lỗi HTTP " + response.status);`. |
| **7** | `getProduct(9999)` (Sản phẩm không tồn tại) | Không ném lỗi, trả về `{ message: "..." }` khiến trang trắng trơn | Ném ngoại lệ `Error("Không tìm thấy sản phẩm có id 9999")` | `return response.json();` | Khi gặp mã 404, cần nhận diện `response.status === 404` để ném đúng câu thông báo tiếng Việt theo quy định của Tech Lead. |
| **8** | `getProductsPage(2, 10)` | `skip = 20` (bắt đầu từ sản phẩm 21) | `skip = 10` (bắt đầu từ sản phẩm 11) | `skip: page * pageSize` | Phân trang tính từ trang 1, nên trang 1 phải có `skip = 0`, trang 2 có `skip = 10`. Công thức đúng phải là `(page - 1) * pageSize`. |
| **9** | `getProductsPage(0, 10)` | Vẫn thực thi và gọi API với số trang không hợp lệ | Ném ngoại lệ `Error("Số trang không hợp lệ")` | Không có bước xác thực (validate) đầu vào | Cần kiểm tra `Number.isInteger(page) && page >= 1` và `Number.isInteger(pageSize) && pageSize >= 1` trước khi thực hiện gọi mạng. |
| **10** | `describePage({ products: [4 phần tử], total: 194, skip: 190, limit: 10 })` | `"Hiển thị 190-200 trên tổng 194 sản phẩm"` | `"Hiển thị 191-194 trên tổng 194 sản phẩm"` | `data.skip + "-" + (data.skip + data.limit)` | Chỉ số bắt đầu bị đếm từ 0 thay vì 1; chỉ số kết thúc bị cộng cứng theo `data.limit` (190 + 10 = 200) thay vì cộng theo số lượng phần tử thực tế của trang cuối (`data.products.length`). |
| **11** | `describePage({ products: [], total: 0 })` | `"Hiển thị 0-0 trên tổng 0 sản phẩm"` | `"Không có sản phẩm nào"` | Không xử lý trường hợp danh sách rỗng | Cần kiểm tra nếu mảng sản phẩm rỗng hoặc tổng số bằng 0 thì trả về chuỗi `"Không có sản phẩm nào"`. |

---

## 3. Kết quả nghiệm thu bộ kiểm thử

- **Trang kiểm thử:** `tests.html` (13/13 test cases đạt 100%).
- **Kiểm thử mạng thực tế (Network Tab):**
  - Yêu cầu `GET /products/search?q=phone&limit=3` phản hồi mã **200 OK**.
  - Yêu cầu `GET /products/9999` phản hồi mã **404 Not Found**, giao diện bắt lỗi và hiển thị thông báo thân thiện.
- **Quy chuẩn mã nguồn:** Sử dụng hoàn toàn `const`/`let`, cú pháp `async/await`, đặt tên chuẩn `camelCase` tiếng Anh và có chú thích JSDoc tiếng Việt chi tiết cho từng hàm.
