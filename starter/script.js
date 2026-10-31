const BASE_URL = "https://dummyjson.com";

function buildQuery(params) {
  let query = "?";
  for (const key in params) {
    if (params[key]) {
      query += key + "=" + params[key] + "&";
    }
  }
  return query;
}

function getProducts({ limit, skip, q, category } = {}) {
  const url = BASE_URL + "/products" + buildQuery({ limit, skip });
  return fetch(url).then((response) => response.json());
}

async function getProduct(id) {
  const response = await fetch(BASE_URL + "/products/" + id);
  return response.json();
}

function getProductsPage(page, pageSize = 10) {
  return getProducts({ limit: pageSize, skip: page * pageSize });
}

function describePage(data) {
  return (
    "Hiển thị " +
    data.skip +
    "-" +
    (data.skip + data.limit) +
    " trên tổng " +
    data.total +
    " sản phẩm"
  );
}
