# Project: Eliminate Shorts — Chrome Extension

## Goal

Build a Manifest V3 Chrome browser extension called **"Eliminate Shorts"** that completely removes short-form video content from YouTube.

The extension must aggressively eliminate Shorts and short-form recommendations from every possible location on YouTube while remaining lightweight and performant.

Target platform:

- Google Chrome
- Chromium browsers (Edge, Brave, Arc, Opera)

---

# Primary Requirements

Remove ALL YouTube short-form content including:

### Home Feed

Remove:

- Shorts shelves
- Horizontal Shorts carousels
- Vertical Shorts sections
- Shorts recommendations
- "People also watched" sections containing Shorts
- Any video under configured duration threshold (optional setting)

Examples:

- `/shorts/*`
- Shorts cards on homepage
- Mobile-layout Shorts blocks

---

### Sidebar / Navigation

Remove:

- Shorts button from left navigation
- Shorts icon from mini sidebar
- Shorts menu entries
- Shorts entries in subscriptions area

---

### Search Results

Remove:

- Shorts results
- Vertical short video cards
- Shorts shelves appearing between results

---

### Subscriptions Feed

Remove:

- Shorts recommendations
- Shorts shelf sections

---

### Channel Pages

Remove:

- Shorts tab
- Shorts shelf
- Shorts recommendations

Example:

Before:

Home | Videos | Shorts | Live | Playlists

After:

Home | Videos | Live | Playlists

---

### Watch Page

Remove:

- Recommended Shorts sidebar
- Shorts appearing under related videos
- Shorts autoplay suggestions
- End-screen Shorts suggestions

---

### Explore / Trending

Remove:

- Shorts sections
- Shorts category buttons

---

### Notifications

Remove:

- Shorts recommendation notifications
- Shorts notification cards

---

### URL Blocking

Automatically redirect:

```

youtube.com/shorts/\*

```

to:

```

youtube.com

```

or:

```

youtube.com/feed/subscriptions

```

(configurable)

---

# Detection Strategy

Use MULTIPLE detection methods.

## URL Detection

Detect:

```

/shorts/

```

---

## DOM Selectors

Observe and remove elements containing:

Examples:

```

ytd-reel-shelf-renderer
ytd-rich-shelf-renderer
ytd-reel-video-renderer
ytd-shorts-lockup-view-model
ytm-shorts-lockup-view-model
ytd-guide-entry-renderer
yt-horizontal-list-renderer

```

Also detect:

- links containing `/shorts/`
- aria labels containing "Shorts"
- titles equal to "Shorts"
- badges indicating Shorts

Do NOT hardcode only current selectors.

Create resilient fallback detection.

---

## Mutation Observer

YouTube is SPA-based.

Implement:

```

MutationObserver

```

Requirements:

- Observe document.body
- Debounce processing
- Process added nodes only
- Avoid full DOM rescans when possible
- Prevent memory leaks

---

## Performance Requirements

Must:

- Avoid high CPU usage
- Prevent observer loops
- Batch DOM removals
- Use requestIdleCallback where useful
- Use WeakSet to avoid reprocessing nodes

Target:

- Minimal performance impact
- No visible UI flickering

---

# Popup UI Design

Theme:

Minimal modern dark UI.

Dimensions:

```

360px width
500px height

```

Design language:

- Rounded corners
- Glass-like dark appearance
- Accent color:

```

#FF0033

```

(YouTube-inspired red)

Background:

```

#0F0F0F

```

Cards:

```

#1A1A1A

```

Text:

```

#FFFFFF
#AAAAAA

```

Typography:

```

Inter
```

Fallback:

```

system-ui
```

---

## Popup Layout

### Header

Top:

Logo:

```

🚫 Shorts
```

Subtitle:

```

Remove short-form distractions
```

Status badge:

```

ACTIVE
```

Green when enabled.

Gray when disabled.

---

### Main Toggle

Large toggle switch:

```

Enable No Shorts
```

Instant update.

Persist using:

```

chrome.storage.sync
```

---

### Settings Card

Options:

#### Redirect Shorts URLs

Toggle

Default:

```

ON
```

---

#### Hide Videos Under Duration

Toggle

When enabled:

Show slider:

```

15 seconds
30 seconds
45 seconds
60 seconds
90 seconds
```

Default:

```

60 seconds
```

---

#### Remove Shorts Notifications

Toggle

Default:

```

ON
```

---

#### Aggressive Cleanup Mode

Toggle

Enables additional heuristic detection.

Default:

```

ON
```

---

### Statistics Section

Show:

```

Removed today: 142
Current page removals: 17
```

Track locally.

Persist daily reset.

---

### Footer

Small text:

```

Focus on long-form content.
```

Version:

```

v1.0.0
```

---

# Architecture

Structure:

```

extension/

├── manifest.json
├── background.js
├── content/
│   ├── detector.js
│   ├── mutationObserver.js
│   ├── remover.js
│   ├── redirector.js
│   └── stats.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── utils/
    ├── storage.js
    └── debounce.js

```

---

# Manifest Requirements

Manifest V3.

Permissions:

```json
[
"storage"
]
```

Host permissions:

```json
[
"*://*.youtube.com/*"
]
```

Use:

- content_scripts
- service_worker
- storage.sync

No unnecessary permissions.

---

# Quality Requirements

Must:

- Work after YouTube SPA navigation
- Survive YouTube DOM updates
- Avoid console spam
- Use TypeScript-friendly patterns
- Modular architecture
- No inline scripts
- No memory leaks

---

# Testing Checklist

Verify:

- Home page
- Shorts URL
- Search page
- Channel page
- Watch page
- Subscriptions
- Trending
- Sidebar collapsed
- Sidebar expanded
- Dark mode
- Light mode
- Logged in
- Logged out

---

# Deliverables

Produce:

1. Complete implementation
2. Manifest V3 compliant extension
3. Popup UI implementation
4. Modular source files
5. Comments explaining critical logic
6. Production-ready code

Build it as if publishing to Chrome Web Store.