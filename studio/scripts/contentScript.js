(() => {
  const BUTTON_ID = 'ytcex-download-comments';

  const ensureButton = () => {
    if (document.getElementById(BUTTON_ID)) {
      return;
    }

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.textContent = 'Download comments';
    Object.assign(button.style, {
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      padding: '10px 16px',
      backgroundColor: '#0f9d58',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#0b8043';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#0f9d58';
    });

    button.addEventListener('click', handleDownload);

    document.body.appendChild(button);
  };

  const handleDownload = () => {
    const nodes = Array.from(
      document.querySelectorAll('yt-formatted-string#content-text')
    );

    const comments = nodes
      .map((node) => node.textContent?.trim())
      .filter((text) => Boolean(text));

    if (!comments.length) {
      notify('No comments found on this page.');
      return;
    }

    const markdown = comments
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

    notify(`Saved ${comments.length} comment${comments.length === 1 ? '' : 's'}.`);
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
    ensureButton();

    // YouTube Studio heavily uses dynamic rendering; observe for navigation changes.
    const observer = new MutationObserver(() => {
      ensureButton();
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
