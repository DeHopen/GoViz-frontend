import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  useGetFileQuery,
  useDeleteFileMutation,
  getViewUrl,
} from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/Icon/Icon';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import styles from '../../styles/ViewPage.module.scss';

// ─── Константы ──────────────────────────────────────────────────
const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20];
const DEFAULT_FONT_IDX = 2; // 13px

// ─── CSS-оверрайды для bildigo HTML ─────────────────────────────
function getOverrideCSS(isDark: boolean): string {
  const bg = isDark ? '#0f1117' : '#f8f9fb';
  const bgCard = isDark ? '#1a1b26' : '#ffffff';
  const text = isDark ? '#e4e5f1' : '#1a1a2e';
  const textMuted = isDark ? '#6b6d80' : '#8e90a6';
  const border = isDark ? '#2a2b3d' : '#e2e5eb';
  const accent = isDark ? '#818cf8' : '#4f46e5';
  const hoverBg = isDark ? '#24253a' : '#eef0f4';
  const scrollThumb = isDark ? '#3d3f56' : '#c8cdd6';
  const scrollTrack = isDark ? '#1a1b26' : '#f0f0f0';

  return `
    /* ═══ CSS custom properties ═══ */
    :root {
      --goviz-font-size: 13px;
      --goviz-line-height: 1.6;
    }

    /* ═══ Скрываем лишнее ═══ */
    .file-container,
    .file-tab,
    .dragbar.col,
    .dragbar.row,
    .bottom-container,
    .info-flex-container,
    .sep.horizontal,
    #search {
      display: none !important;
    }

    /* ═══ Основной layout ═══ */
    body, body.bg {
      margin: 0 !important;
      padding: 0 !important;
      background: ${bg} !important;
      color: ${text} !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Helvetica, Arial, sans-serif !important;
      overflow-x: hidden !important;
    }

    .main-container {
      width: 100vw !important;
      height: 100vh !important;
    }

    .upper-container {
      height: 100vh !important;
    }

    .right-code-container {
      flex: 1 !important;
      width: 100% !important;
    }

    /* ═══ Область кода ═══ */
    .bildigo-right-container {
      background: ${bg} !important;
    }

    .bildigo-code-container {
      padding-top: 8px !important;
      animation: goviz-fadein 0.3s ease !important;
    }

    @keyframes goviz-fadein {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ═══ Номера строк ═══ */
    .bildigo-linenums-box {
      color: ${textMuted} !important;
      padding-left: 16px !important;
      padding-right: 8px !important;
      font-size: var(--goviz-font-size) !important;
      line-height: var(--goviz-line-height) !important;
      user-select: none !important;
    }

    .bildigo-linenums-box a {
      color: ${textMuted} !important;
      text-decoration: none !important;
      transition: color 0.15s ease !important;
    }

    .bildigo-linenums-box a:hover {
      color: ${accent} !important;
    }

    /* ═══ Код ═══ */
    .code, .bildigo-code-box {
      font-size: var(--goviz-font-size) !important;
      line-height: var(--goviz-line-height) !important;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono',
        'Cascadia Code', Menlo, Monaco, Consolas, monospace !important;
      padding-right: 24px !important;
    }

    /* ═══ Scope triggers ═══ */
    .bildigo-scopeTriggers-box {
      font-size: var(--goviz-font-size) !important;
      line-height: var(--goviz-line-height) !important;
    }

    /* ─── Scope toggle: SVG-шеврон через CSS mask (мгновенно, без JS) ─── */
    .scope-toggle {
      cursor: pointer !important;
    }

    .scope-toggle::before {
      content: '' !important;
      display: inline-block !important;
      width: 14px !important;
      height: 14px !important;
      vertical-align: middle !important;
      margin-right: 2px !important;
      background-color: ${textMuted} !important;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
      -webkit-mask-size: contain !important;
      -webkit-mask-repeat: no-repeat !important;
      -webkit-mask-position: center !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
      mask-size: contain !important;
      mask-repeat: no-repeat !important;
      mask-position: center !important;
      transition: transform 0.2s ease, background-color 0.15s ease !important;
    }

    .scope-toggle:hover::before {
      background-color: ${accent} !important;
    }

    .scope-toggle.goviz-collapsed::before {
      transform: rotate(-90deg) !important;
    }

    /* ═══ Подсветка при наведении ═══ */
    a:hover,
    a:hover * {
      border-radius: 2px !important;
    }

    /* ═══ Тултипы ═══ */
    .tooltip > .tooltiptext {
      background: ${bgCard} !important;
      color: ${text} !important;
      border: 1px solid ${border} !important;
      border-radius: 8px !important;
      padding: 10px 14px !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? '0.5' : '0.15'}) !important;
      font-size: 12px !important;
      line-height: 1.5 !important;
      max-width: 420px !important;
    }

    /* ═══ Target-анимация ═══ */
    @keyframes target-bg-animation {
      0%   { background: ${accent}33; }
      100% { background: none; }
    }

    /* ═══ Highlight строки ═══ */
    .hl {
      background: ${hoverBg} !important;
    }

    /* ═══ Скроллбары ═══ */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${scrollTrack};
    }

    ::-webkit-scrollbar-thumb {
      background: ${scrollThumb};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: ${accent}88;
    }

    /* ═══ Decl/Usages панель ═══ */
    .decl-usages {
      background: ${bgCard} !important;
      color: ${text} !important;
      border-top: 1px solid ${border} !important;
      font-size: 12px !important;
    }

    .decl-usages a {
      color: ${accent} !important;
    }

    /* ═══ Поиск: подсветка совпадений ═══ */
    .goviz-highlight {
      background: ${isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.35)'} !important;
      border-radius: 2px !important;
      outline: 1px solid ${isDark ? 'rgba(251, 191, 36, 0.45)' : 'rgba(251, 191, 36, 0.55)'} !important;
      box-decoration-break: clone !important;
    }

    .goviz-highlight-active {
      background: ${isDark ? 'rgba(251, 191, 36, 0.55)' : 'rgba(251, 191, 36, 0.6)'} !important;
      outline: 2px solid ${isDark ? '#fbbf24' : '#f59e0b'} !important;
    }
  `;
}

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Размер шрифта ─────────────────────────────────────────────
  const [fontIdx, setFontIdx] = useState(DEFAULT_FONT_IDX);
  const fontSize = FONT_SIZES[fontIdx];

  // ── Полноэкранный режим ───────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Toast уведомление ─────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Поиск ─────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCount, setSearchCount] = useState(0);

  // ── API данные ────────────────────────────────────────────────
  const { data: file, isLoading, error } = useGetFileQuery(id!, { skip: !id });
  const isReady = file?.status === 'completed';
  const isFailed = file?.status === 'failed';

  // Поллинг пока файл обрабатывается
  useGetFileQuery(id!, {
    skip: !id || isReady || isFailed,
    pollingInterval: 2000,
  });

  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  // ── Загрузка HTML визуализации ────────────────────────────────
  const [rawHtml, setRawHtml] = useState<string | null>(null);
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [htmlError, setHtmlError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !id) return;

    setHtmlLoading(true);
    setHtmlError(null);

    fetch(getViewUrl(id))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setRawHtml)
      .catch((e) => setHtmlError(e.message))
      .finally(() => setHtmlLoading(false));
  }, [isReady, id]);

  // ── Styled HTML ───────────────────────────────────────────────
  const styledHtml = useMemo(() => {
    if (!rawHtml) return null;

    const css = getOverrideCSS(theme === 'dark');

    // Скрипт: автооткрытие файла + SVG scope-toggle + проброс клавиш
    const injectedScript = `
      <script>
        (function() {
          // ── Автооткрытие первого файла ──
          const _orig = window.openDefaultFile;
          window.openDefaultFile = function() {
            const keys = Object.keys(typeof files !== 'undefined' ? files : {});
            if (keys.length > 0) {
              window.location.hash = '#file:' + keys[0];
            } else if (_orig) {
              _orig();
            }
          };

          // ── Scope toggle: отслеживание состояния (шеврон рендерится через CSS) ──
          // Event delegation — мгновенная реакция на клик без привязки к каждому элементу
          document.addEventListener('click', function(e) {
            let el = e.target;
            while (el && el !== document.body) {
              if (el.classList && el.classList.contains('scope-toggle')) {
                el.classList.toggle('goviz-collapsed');
                return;
              }
              el = el.parentElement;
            }
          }, true);

          // Синхронизация expand/collapse all
          function bindExpandCollapse() {
            const exp = document.getElementById('scopes-expand');
            const col = document.getElementById('scopes-collapse');

            if (exp && !exp.dataset.goviz) {
              exp.dataset.goviz = 'true';
              exp.addEventListener('click', function() {
                document.querySelectorAll('.scope-toggle.goviz-collapsed').forEach(function(t) {
                  t.classList.remove('goviz-collapsed');
                });
              });
            }

            if (col && !col.dataset.goviz) {
              col.dataset.goviz = 'true';
              col.addEventListener('click', function() {
                document.querySelectorAll('.scope-toggle').forEach(function(t) {
                  t.classList.add('goviz-collapsed');
                });
              });
            }
          }

          bindExpandCollapse();
          window.addEventListener('hashchange', function() {
            setTimeout(bindExpandCollapse, 200);
          });

          // ── Проброс горячих клавиш в parent ──
          document.addEventListener('keydown', function(e) {
            const mod = e.ctrlKey || e.metaKey;
            let relay = false;

            if (mod && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0' || e.key === 'f')) relay = true;
            if (e.key === 'F11' || e.key === 'Escape') relay = true;

            if (relay) {
              e.preventDefault();
              e.stopPropagation();
              window.parent.dispatchEvent(new KeyboardEvent('keydown', {
                key: e.key,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                bubbles: true
              }));
            }
          });
        })();
      </script>
    `;

    return rawHtml
      .replace('</head>', `<style id="goviz-override">${css}</style></head>`)
      .replace('</body>', `${injectedScript}</body>`);
  }, [rawHtml, theme]);

  // ── Динамическое обновление размера шрифта ────────────────────
  const applyFontSize = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement) return;

    const lh = fontSize <= 13 ? '1.6' : fontSize <= 16 ? '1.5' : '1.45';
    doc.documentElement.style.setProperty('--goviz-font-size', `${fontSize}px`);
    doc.documentElement.style.setProperty('--goviz-line-height', lh);
  }, [fontSize]);

  useEffect(() => {
    applyFontSize();
  }, [applyFontSize]);

  const handleIframeLoad = useCallback(() => {
    applyFontSize();
  }, [applyFontSize]);

  // ── Fullscreen ────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void pageRef.current?.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Expand / Collapse scopes ──────────────────────────────────
  const toggleScopes = useCallback((expand: boolean) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const btn = doc.getElementById(expand ? 'scopes-expand' : 'scopes-collapse');
    btn?.click();
  }, []);

  // ── Toast ─────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Копировать код ────────────────────────────────────────────
  const copyCode = useCallback(async () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      const codeEl =
        doc.querySelector('.bildigo-code-box') || doc.querySelector('.code');
      if (!codeEl?.textContent) return;

      await navigator.clipboard.writeText(codeEl.textContent);
      showToast('Код скопирован в буфер обмена');
    } catch {
      showToast('Не удалось скопировать');
    }
  }, [showToast]);

  // ── Поиск по коду ────────────────────────────────────────────
  const clearHighlights = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    doc
      .querySelectorAll('.goviz-highlight, .goviz-highlight-active')
      .forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(doc.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
  }, []);

  const performSearch = useCallback(
    (query: string) => {
      clearHighlights();

      if (!query.trim()) {
        setSearchCount(0);
        return;
      }

      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;

      const codeBox =
        doc.querySelector('.bildigo-code-box') || doc.querySelector('.code');
      if (!codeBox) return;

      const lowerQuery = query.toLowerCase();
      const walker = doc.createTreeWalker(codeBox, NodeFilter.SHOW_TEXT, null);
      const matches: { node: Text; index: number }[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = (node.textContent || '').toLowerCase();
        let idx = text.indexOf(lowerQuery);
        while (idx !== -1) {
          matches.push({ node, index: idx });
          idx = text.indexOf(lowerQuery, idx + 1);
        }
      }

      let count = 0;
      for (let i = matches.length - 1; i >= 0; i--) {
        try {
          const { node, index } = matches[i];
          const range = doc.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + query.length);

          const mark = doc.createElement('span');
          mark.className =
            i === 0
              ? 'goviz-highlight goviz-highlight-active'
              : 'goviz-highlight';
          range.surroundContents(mark);
          count++;
        } catch {
          /* диапазон пересекает границы элементов */
        }
      }

      const first = doc.querySelector('.goviz-highlight-active');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setSearchCount(count);
    },
    [clearHighlights],
  );

  useEffect(() => {
    const timeout = setTimeout(() => performSearch(searchQuery), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, performSearch]);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchRef.current?.focus(), 50);
      } else {
        setSearchQuery('');
        clearHighlights();
        setSearchCount(0);
      }
      return !prev;
    });
  }, [clearHighlights]);

  // ── Горячие клавиши ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setFontIdx((i) => Math.min(i + 1, FONT_SIZES.length - 1));
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        setFontIdx((i) => Math.max(i - 1, 0));
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        setFontIdx(DEFAULT_FONT_IDX);
      }
      if (mod && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
        clearHighlights();
        setSearchCount(0);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSearch, toggleFullscreen, searchOpen, clearHighlights]);

  // ── Удалить файл ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!id || !window.confirm('Удалить файл и результат визуализации?')) return;
    try {
      await deleteFile(id).unwrap();
      navigate('/files');
    } catch {
      /* RTK Query error */
    }
  };

  // ── Ошибки ────────────────────────────────────────────────────
  const apiError =
    error && 'data' in error
      ? (error.data as { detail?: string; message?: string })?.detail ||
        (error.data as { message?: string })?.message
      : error
        ? 'Не удалось загрузить файл'
        : null;

  const displayError = apiError || htmlError;

  // ── Helpers ───────────────────────────────────────────────────
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function pluralMatches(n: number): string {
    if (n % 10 === 1 && n % 100 !== 11) return 'совпадение';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
      return 'совпадения';
    return 'совпадений';
  }

  // ═══ RENDER ═══════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Loader text="Загрузка..." fullPage />
      </div>
    );
  }

  if (displayError && !styledHtml) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <div>
            <ErrorMessage message={displayError} />
            <div className={styles.centerActions}>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/files')}
              >
                <Icon name="arrow-left" size={16} />
                К списку файлов
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/')}
              >
                <Icon name="upload" size={16} />
                Загрузить заново
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!file) return null;

  const isWaiting = !isReady && !isFailed;

  if (isWaiting || htmlLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <Loader
            text={
              htmlLoading
                ? 'Загрузка визуализации...'
                : `Подготовка «${file.filename}»...`
            }
            fullPage
          />
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <div>
            <ErrorMessage
              message={
                file.error_message ||
                'При обработке файла произошла ошибка.'
              }
            />
            <div className={styles.centerActions}>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/')}
              >
                <Icon name="upload" size={16} />
                Загрузить заново
              </button>
              <button
                className={`${styles.actionBtn} ${styles.danger}`}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Icon name="trash" size={16} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!styledHtml) return null;

  // ── Визуализация ──────────────────────────────────────────────
  return (
    <div className={styles.page} ref={pageRef}>
      {/* ─── Тулбар ─── */}
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarBtn}
          onClick={() => navigate('/files')}
          title="К списку файлов"
        >
          <Icon name="arrow-left" size={16} />
        </button>

        <div className={styles.sep} />

        <span className={styles.fileName}>{file.filename}</span>
        <span className={styles.meta}>{formatDate(file.created_at)}</span>

        <div className={styles.spacer} />

        {/* Поиск */}
        {searchOpen && (
          <div className={styles.searchBox}>
            <input
              ref={searchRef}
              type="text"
              className={styles.searchInput}
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchOpen(false);
                  setSearchQuery('');
                  clearHighlights();
                  setSearchCount(0);
                }
              }}
            />
            {searchQuery && (
              <span className={styles.searchCount}>
                {searchCount} {pluralMatches(searchCount)}
              </span>
            )}
          </div>
        )}

        <div className={styles.sep} />

        {/* Шрифт */}
        <div className={styles.group}>
          <button
            className={styles.toolbarBtn}
            onClick={() => setFontIdx((i) => Math.max(i - 1, 0))}
            disabled={fontIdx === 0}
            title="Уменьшить шрифт (Ctrl + −)"
          >
            A−
          </button>
          <span className={styles.fontLabel}>{fontSize}</span>
          <button
            className={styles.toolbarBtn}
            onClick={() =>
              setFontIdx((i) => Math.min(i + 1, FONT_SIZES.length - 1))
            }
            disabled={fontIdx === FONT_SIZES.length - 1}
            title="Увеличить шрифт (Ctrl + =)"
          >
            A+
          </button>
        </div>

        <div className={styles.sep} />

        {/* Блоки */}
        <div className={styles.group}>
          <button
            className={styles.toolbarBtn}
            onClick={() => toggleScopes(true)}
            title="Развернуть все блоки"
          >
            <Icon name="unfold" size={16} />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => toggleScopes(false)}
            title="Свернуть все блоки"
          >
            <Icon name="fold" size={16} />
          </button>
        </div>

        <div className={styles.sep} />

        {/* Действия */}
        <div className={styles.group}>
          <button
            className={`${styles.toolbarBtn} ${searchOpen ? styles.active : ''}`}
            onClick={toggleSearch}
            title="Поиск по коду (Ctrl + F)"
          >
            <Icon name="search" size={16} />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={copyCode}
            title="Копировать код"
          >
            <Icon name="copy" size={16} />
          </button>
          <button
            className={`${styles.toolbarBtn} ${isFullscreen ? styles.active : ''}`}
            onClick={toggleFullscreen}
            title="Полный экран (F11)"
          >
            <Icon name={isFullscreen ? 'minimize' : 'maximize'} size={16} />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => window.open(getViewUrl(id!), '_blank')}
            title="Открыть в новой вкладке"
          >
            <Icon name="external-link" size={16} />
          </button>
        </div>

        <div className={styles.sep} />

        <button
          className={`${styles.toolbarBtn} ${styles.danger}`}
          onClick={handleDelete}
          disabled={isDeleting}
          title="Удалить файл"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>

      {/* ─── Визуализация ─── */}
      <iframe
        ref={iframeRef}
        className={styles.iframe}
        srcDoc={styledHtml}
        title={`Визуализация: ${file.filename}`}
        onLoad={handleIframeLoad}
      />

      {/* ─── Toast ─── */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        {toast}
      </div>
    </div>
  );
}
