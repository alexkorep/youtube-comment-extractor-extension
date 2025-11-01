## YouTube Studio comment exporter

This Chrome extension injects a floating **Download comments** button on any `studio.youtube.com` page. Click it to collect every visible comment (`<yt-formatted-string id="content-text">`) and download them as a numbered Markdown document:

```
# 1
First comment text

# 2
Second comment text
```

### Installing locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `studio` folder from this repo.

The button appears after the page finishes loading. If no comments are present, a toast notification lets you know nothing was saved.
