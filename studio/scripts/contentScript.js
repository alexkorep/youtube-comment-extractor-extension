(() => {
  const CONTAINER_ID = 'ytcex-button-container';
  const DOWNLOAD_BUTTON_ID = 'ytcex-download-comments';
  const START_BUTTON_ID = 'ytcex-start-scroll';
  const SCROLL_CONTAINER_SELECTOR = 'ytcp-activity-section[fixed-height]';

  let scrollIntervalId = null;
  const collectedComments = [];
  const collectedCommentKeys = new Set();
  let nodeCommentKey = new WeakMap();

  const getScrollContainer = () =>
    document.querySelector(SCROLL_CONTAINER_SELECTOR);

  const performScroll = () => {
    const container = getScrollContainer();
    if (!container) {
      return false;
    }

    const distance =
      (container instanceof HTMLElement ? container.clientHeight : 0) ||
      window.innerHeight ||
      600;

    if (typeof container.scrollBy === 'function') {
      container.scrollBy({ top: distance, behavior: 'smooth' });
      return true;
    }

    if ('scrollTop' in container) {
      container.scrollTop += distance;
      return true;
    }

    return false;
  };

  const buildCommentData = (node) => {
    const text = node.textContent?.trim();
    if (!text) {
      return null;
    }

    const commentElement = node.closest('ytcp-comment');
    const authorLink =
      commentElement?.querySelector?.('a#name') ??
      commentElement?.querySelector?.('#name');
    const author = authorLink?.textContent?.trim() ?? '';
    const authorHref =
      authorLink instanceof HTMLAnchorElement ? authorLink.href : '';
    const published =
      commentElement?.querySelector?.('.published-time-text')?.textContent?.trim() ??
      '';

    const key = [authorHref, author, published, text].filter(Boolean).join('||');

    return {
      text,
      key
    };
  };

  const harvestComments = () => {
    const nodes = document.querySelectorAll('yt-formatted-string#content-text');

    for (const node of nodes) {
      const data = buildCommentData(node);
      if (!data) {
        continue;
      }

      const { text, key } = data;
      const previousKey = nodeCommentKey.get(node);

      if (previousKey === key) {
        continue;
      }

      nodeCommentKey.set(node, key);

      if (collectedCommentKeys.has(key)) {
        continue;
      }

      collectedCommentKeys.add(key);
      collectedComments.push(text);
    }

    updateDownloadButtonLabel();
  };

  const updateStartButtonState = () => {
    const startButton = document.getElementById(START_BUTTON_ID);
    if (!startButton) {
      return;
    }

    if (scrollIntervalId !== null) {
      startButton.textContent = 'Stop scrolling';
      startButton.style.backgroundColor = '#185abc';
    } else {
      startButton.textContent = 'Start scrolling';
      startButton.style.backgroundColor = '#1a73e8';
    }
  };

  const updateDownloadButtonLabel = () => {
    const downloadButton = document.getElementById(DOWNLOAD_BUTTON_ID);
    if (!downloadButton) {
      return;
    }

    downloadButton.textContent = `Download comments (${collectedComments.length})`;
  };

  const ensureButtons = () => {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;
      Object.assign(container.style, {
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-end',
        zIndex: '2147483647'
      });
      document.body.appendChild(container);
    }

    let startButton = document.getElementById(START_BUTTON_ID);
    if (!startButton) {
      startButton = document.createElement('button');
      startButton.id = START_BUTTON_ID;
      startButton.textContent = 'Start scrolling';
      Object.assign(startButton.style, {
        padding: '10px 16px',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      });

      startButton.addEventListener('mouseenter', () => {
        startButton.style.backgroundColor = '#185abc';
      });

      startButton.addEventListener('mouseleave', () => {
        updateStartButtonState();
      });

      startButton.addEventListener('click', handleStartToggle);
      container.appendChild(startButton);
      updateStartButtonState();
    }

    let downloadButton = document.getElementById(DOWNLOAD_BUTTON_ID);
    if (!downloadButton) {
      downloadButton = document.createElement('button');
      downloadButton.id = DOWNLOAD_BUTTON_ID;
      Object.assign(downloadButton.style, {
        padding: '10px 16px',
        backgroundColor: '#0f9d58',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      });

      downloadButton.addEventListener('mouseenter', () => {
        downloadButton.style.backgroundColor = '#0b8043';
      });

      downloadButton.addEventListener('mouseleave', () => {
        downloadButton.style.backgroundColor = '#0f9d58';
      });

      downloadButton.addEventListener('click', handleDownload);
      container.appendChild(downloadButton);
      updateDownloadButtonLabel();
    }
  };

  const handleStartToggle = () => {
    if (scrollIntervalId !== null) {
      stopScrolling();
      notify('Stopped scrolling.');
      return;
    }

    harvestComments();
    startScrolling();
    notify('Started scrolling to collect comments.');
  };

  const startScrolling = () => {
    if (scrollIntervalId !== null) {
      return;
    }

    if (!getScrollContainer()) {
      notify('Could not find the comments list to scroll.');
      return;
    }

    scrollIntervalId = window.setInterval(() => {
      if (!performScroll()) {
        stopScrolling();
        notify('Stopped scrolling because the comments list disappeared.');
        return;
      }

      harvestComments();
    }, 1000);

    if (!performScroll()) {
      stopScrolling();
      notify('Could not scroll the comments list.');
      return;
    }

    updateStartButtonState();
  };

  const stopScrolling = () => {
    if (scrollIntervalId === null) {
      return;
    }

    window.clearInterval(scrollIntervalId);
    scrollIntervalId = null;

    updateStartButtonState();
  };

  const handleDownload = () => {
    harvestComments();

    if (!collectedComments.length) {
      notify('No comments collected yet.');
      return;
    }

    stopScrolling();

    const markdown = collectedComments
      .map((comment, index) => `# ${index + 1}\n${comment}\n`)
      .join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    anchor.href = url;
    anchor.download = `youtube-studio-comments-${timestamp}.md`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    notify(
      `Saved ${collectedComments.length} comment${
        collectedComments.length === 1 ? '' : 's'
      }.`
    );

    resetCollection();
  };

  const resetCollection = () => {
    collectedComments.length = 0;
    collectedCommentKeys.clear();
    nodeCommentKey = new WeakMap();
    updateDownloadButtonLabel();
  };

  const notify = (message) => {
    const existing = document.querySelector('.ytcex-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'ytcex-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      maxWidth: '320px',
      padding: '12px 16px',
      backgroundColor: '#202124',
      color: '#fff',
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: '18px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      zIndex: '2147483647'
    });
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  };

  const init = () => {
    ensureButtons();

    // YouTube Studio heavily uses dynamic rendering; observe for navigation changes.
    const observer = new MutationObserver(() => {
      ensureButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
