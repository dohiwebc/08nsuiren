/**
 * 記事詳細ページ（article.html）
 */
(async function initArticlePage() {
  const contentEl = document.getElementById("article-content");
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!contentEl) return;

  if (!articleId) {
    contentEl.innerHTML = renderErrorMessage("記事IDが指定されていません");
    return;
  }

  contentEl.innerHTML = renderLoading();

  try {
    const post = await getBlogPost(articleId);
    renderArticle(contentEl, post);
    updateArticleMeta(post);
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = renderErrorMessage("記事が見つかりませんでした");
  }
})();

function stripHtmlToText(html) {
  const div = document.createElement("div");
  div.innerHTML = sanitizeRichText(html || "");
  return div.textContent.replace(/\s+/g, " ").trim();
}

function getArticleDescription(post) {
  const description = String(post.description || "").trim();
  if (description) return description;
  return stripHtmlToText(post.body).slice(0, 120) || "Suiren Notes のブログ記事。";
}

function setMetaContent(attributeName, attributeValue, content) {
  if (!content) return;

  let meta = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attributeName, attributeValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonicalUrl(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function updateArticleMeta(post) {
  const title = `${post.title || "記事"} | Suiren Notes`;
  const description = getArticleDescription(post);
  const pageUrl = window.location.href;
  const imageUrl = getImageUrl(getBlogEyecatch(post), post.title);
  const absoluteImageUrl = imageUrl.startsWith("data:")
    ? ""
    : new URL(imageUrl, window.location.href).href;

  document.title = title;
  setMetaContent("name", "description", description);
  setMetaContent("property", "og:title", title);
  setMetaContent("property", "og:description", description);
  setMetaContent("property", "og:type", "article");
  setMetaContent("property", "og:url", pageUrl);
  setMetaContent("name", "twitter:card", absoluteImageUrl ? "summary_large_image" : "summary");
  setMetaContent("name", "twitter:title", title);
  setMetaContent("name", "twitter:description", description);
  setCanonicalUrl(pageUrl);

  if (absoluteImageUrl) {
    setMetaContent("property", "og:image", absoluteImageUrl);
    setMetaContent("name", "twitter:image", absoluteImageUrl);
  }

  if (post.publishedAt) {
    setMetaContent("property", "article:published_time", post.publishedAt);
  }
  if (post.updatedAt) {
    setMetaContent("property", "article:modified_time", post.updatedAt);
  }
}

function renderArticle(el, post) {
  const imgUrl = getImageUrl(getBlogEyecatch(post), post.title);
  const date = getDisplayDate(post);
  const dateAttr = post.publishedAt || post.createdAt || "";
  const bodyHtml = sanitizeRichText(post.body || "<p>本文がありません。</p>");

  el.innerHTML = `
    <article class="article">
      <header class="article__header">
        <div class="article__meta">
          ${renderCategoryBadge(getBlogCategories(post))}
          ${date ? `<time class="article__date" datetime="${escapeHtml(dateAttr)}">${escapeHtml(date)}</time>` : ""}
        </div>
        <h1>${escapeHtml(post.title)}</h1>
      </header>
      <div class="article__eyecatch">
        <img src="${escapeHtml(imgUrl)}" alt="" width="800" height="450" loading="eager">
      </div>
      <div class="article__body rich-text">${bodyHtml}</div>
      <div class="article__actions">
        <a href="blog.html" class="btn btn--secondary">← 記事一覧へ</a>
      </div>
    </article>
  `;
}
