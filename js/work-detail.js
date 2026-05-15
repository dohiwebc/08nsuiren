/**
 * 制作実績の詳細モーダル
 * 「詳細を見る」ボタンで説明・技術・制作範囲・参考制作費などを表示します。
 */

const worksDetailStore = {};
let workDetailListenersReady = false;

/** 作品データを ID で引けるように登録 */
function registerWorksForDetail(works) {
  if (!Array.isArray(works)) return;
  works.forEach((work) => {
    if (work && work.id) {
      worksDetailStore[work.id] = work;
    }
  });
}

/** クリック監視を1回だけ設定 */
function setupWorkDetailListeners() {
  if (workDetailListenersReady) return;
  workDetailListenersReady = true;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-work-detail]");
    if (!btn) return;

    e.preventDefault();
    const work = worksDetailStore[btn.getAttribute("data-work-detail")];
    if (work) {
      openWorkDetailModal(work);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWorkDetailModal();
    }
  });
}

function ensureWorkDetailModal() {
  let modal = document.getElementById("work-detail-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "work-detail-modal";
  modal.className = "work-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="work-modal__backdrop" data-work-modal-close></div>
    <div class="work-modal__panel" role="dialog" aria-modal="true" aria-labelledby="work-modal-title">
      <button type="button" class="work-modal__close" data-work-modal-close aria-label="閉じる">×</button>
      <div class="work-modal__content" id="work-modal-content"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll("[data-work-modal-close]").forEach((el) => {
    el.addEventListener("click", closeWorkDetailModal);
  });

  return modal;
}

function openWorkDetailModal(work) {
  const modal = ensureWorkDetailModal();
  const contentEl = document.getElementById("work-modal-content");
  if (!contentEl) return;

  contentEl.innerHTML = renderWorkDetailContent(work);
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("work-modal-open");

  const closeBtn = modal.querySelector(".work-modal__close");
  if (closeBtn) closeBtn.focus();
}

function closeWorkDetailModal() {
  const modal = document.getElementById("work-detail-modal");
  if (!modal) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("work-modal-open");
}

function renderWorkDetailContent(work) {
  const imgUrl = getImageUrl(work.thumbnail, work.title);
  const techTags = Array.isArray(work.tech)
    ? work.tech.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")
    : "";
  const demoUrl = getSafeOptionalUrl(work.url, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });

  const demoBtn =
    demoUrl
      ? `<a href="${escapeHtml(demoUrl)}" class="btn btn--accent" target="_blank" rel="noopener noreferrer">デモを見る →</a>`
      : "";

  const rows = [];

  if (techTags) {
    rows.push(`
      <div class="work-modal__row">
        <dt class="work-modal__label">使用技術</dt>
        <dd class="work-modal__value"><div class="tags">${techTags}</div></dd>
      </div>
    `);
  }

  const scope = getWorkScope(work);
  const priceRange = getWorkPriceRange(work);

  if (scope) {
    rows.push(`
      <div class="work-modal__row">
        <dt class="work-modal__label">制作範囲</dt>
        <dd class="work-modal__value">${escapeHtml(scope)}</dd>
      </div>
    `);
  }

  if (priceRange) {
    rows.push(`
      <div class="work-modal__row">
        <dt class="work-modal__label">参考制作費</dt>
        <dd class="work-modal__value">${escapeHtml(priceRange)}</dd>
      </div>
    `);
  }

  return `
    <div class="work-modal__visual">
      <img src="${escapeHtml(imgUrl)}" alt="" width="640" height="360" loading="lazy">
    </div>
    <div class="work-modal__header">
      ${renderCategoryBadge(getWorkCategories(work))}
      <h2 id="work-modal-title" class="work-modal__title">${escapeHtml(work.title)}</h2>
    </div>
    <p class="work-modal__description">${formatMultilineText(work.description || "")}</p>
    ${rows.length ? `<dl class="work-modal__details">${rows.join("")}</dl>` : ""}
    ${demoBtn ? `<div class="work-modal__actions">${demoBtn}</div>` : ""}
  `;
}

// ページ読み込み時にリスナーを準備
setupWorkDetailListeners();
