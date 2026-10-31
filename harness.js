/**
 * Test Harness dành cho kiểm thử tự động các hàm trong script.js (Session 02 - Ex 01)
 * Hỗ trợ cả hàm đồng bộ (synchronous) và bất đồng bộ (async / Promise)
 * Rikkei Shop - AI-SDLC • Lớp PTHB260930
 */

const testSuite = [];

/**
 * Đăng ký một test case vào bộ kiểm thử
 * @param {string} description - Mô tả mục tiêu kiểm thử
 * @param {Function} testFn - Hàm thực thi kiểm thử (có thể là async)
 */
function test(description, testFn) {
  testSuite.push({ description, testFn });
}

/**
 * Khẳng định kết quả kiểm thử (Assertion)
 * @param {any} actual - Kết quả thực tế
 */
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Kỳ vọng: ${JSON.stringify(expected)} (${typeof expected}), nhưng nhận được: ${JSON.stringify(actual)} (${typeof actual})`);
      }
    },
    toEqual(expected) {
      const actualJson = JSON.stringify(actual);
      const expectedJson = JSON.stringify(expected);
      if (actualJson !== expectedJson) {
        throw new Error(`Kỳ vọng tương đương:\n  ${expectedJson}\nnhưng nhận được:\n  ${actualJson}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Kỳ vọng giá trị truthy, nhưng nhận được: ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Kỳ vọng giá trị falsy, nhưng nhận được: ${JSON.stringify(actual)}`);
      }
    },
    toThrow(expectedMessage) {
      if (typeof actual !== "function") {
        throw new Error("Kỳ vọng một hàm để kiểm tra ngoại lệ được ném ra");
      }
      let didThrow = false;
      let thrownError = null;
      try {
        actual();
      } catch (err) {
        didThrow = true;
        thrownError = err;
      }
      if (!didThrow) {
        throw new Error("Kỳ vọng hàm sẽ ném ngoại lệ (throw Error), nhưng không có ngoại lệ nào được ném");
      }
      if (expectedMessage && (!thrownError.message || !thrownError.message.includes(expectedMessage))) {
        throw new Error(`Kỳ vọng thông báo lỗi chứa "${expectedMessage}", nhưng nhận được "${thrownError ? thrownError.message : ""}"`);
      }
    },
    rejects: {
      async toThrow(expectedMessage) {
        let didThrow = false;
        let thrownError = null;
        try {
          if (typeof actual === "function") {
            await actual();
          } else {
            await actual;
          }
        } catch (err) {
          didThrow = true;
          thrownError = err;
        }
        if (!didThrow) {
          throw new Error("Kỳ vọng Promise bị từ chối (reject / throw Error), nhưng Promise đã hoàn thành thành công");
        }
        if (expectedMessage && (!thrownError.message || !thrownError.message.includes(expectedMessage))) {
          throw new Error(`Kỳ vọng thông báo lỗi chứa "${expectedMessage}", nhưng nhận được "${thrownError ? thrownError.message : ""}"`);
        }
      }
    }
  };
}

/**
 * Thực thi toàn bộ bộ kiểm thử và cập nhật giao diện tests.html
 */
async function runTests() {
  const container = document.getElementById("test-results");
  let passedCount = 0;
  const total = testSuite.length;
  const resultItems = [];

  for (let index = 0; index < testSuite.length; index++) {
    const t = testSuite[index];
    let passed = false;
    let errorMsg = "";
    try {
      await t.testFn();
      passed = true;
      passedCount++;
    } catch (err) {
      errorMsg = err.message || String(err);
    }

    resultItems.push({
      index: index + 1,
      description: t.description,
      passed,
      errorMsg
    });
  }

  if (container) {
    const summaryCard = document.getElementById("test-summary");
    if (summaryCard) {
      summaryCard.className = passedCount === total ? "summary-box pass" : "summary-box fail";
      summaryCard.innerHTML = `
        <div class="summary-badge">${passedCount === total ? "✓" : "✗"}</div>
        <div class="summary-text">
          <div class="summary-number">${passedCount}/${total} test đạt</div>
          <div class="summary-sub">${passedCount === total ? "Tất cả các bài kiểm tra đã vượt qua thành công! (100%)" : "Có test case chưa vượt qua, hãy kiểm tra mã nguồn."}</div>
        </div>
      `;
    }

    container.innerHTML = resultItems.map(item => `
      <div class="test-item ${item.passed ? "test-pass" : "test-fail"}">
        <div class="test-header">
          <span class="test-badge">${item.passed ? "PASS" : "FAIL"}</span>
          <span class="test-title"><strong>Test ${item.index}:</strong> ${item.description}</span>
        </div>
        ${!item.passed ? `<div class="test-error">${item.errorMsg}</div>` : ""}
      </div>
    `).join("");
  }

  return { passedCount, total };
}

// Tự động chạy khi mở trang web
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    runTests();
  });
}

// Hỗ trợ xuất mô-đun Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { test, expect, runTests, testSuite };
}
