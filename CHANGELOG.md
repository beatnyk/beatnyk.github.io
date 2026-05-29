# CHANGELOG

## 2026-03-30

### Bug Fixes

#### data.json
- Fixed malformed YouTube embed URL for "agents of malarkey" (`https://embed-url:www.youtube.com/...` → `https://www.youtube.com/embed/...`)
- Fixed broken image path `media/malarkey/03.jpg` → `media/malarkey/03.png` (correct extension on disk)

#### script.js
- Fixed scroll trap: `#workScrollContainer` ID reference (didn't exist) → `#workResultsScroll`
- Fixed `initParallax()` was defined but never called → replaced with `initWorkParallax()` integrated into new work section init
- Fixed chaos animation memory: `startChaosAnimation()` now queries `.chaos-char` fresh each tick (avoids stale NodeList); intervals cleared on `beforeunload`
- Fixed `openProjectDetail()` now renders events in `#detailEventsSidebar` (was always empty)
- Fixed `activeFilters` variable renamed to `activeWorkFilters` to avoid conflicts
- Added keyboard support (`Enter`/`Space`) to all interactive category elements
- Added `tabindex="0"` and `role="checkbox"` / `role="button"` to JS-generated interactive elements
- Fixed `createFilterToggle` for lab filters: unchanged (OR logic for lab is intentional)
- Added `sanitizeUrl` guard to media rendering (already present, confirmed working)
- Added `beforeunload` cleanup for chaos animation intervals

#### style.css
- Fixed `font-weight: 1000` → `900` on `.hero-title` and `.contact-title` (1000 is invalid for variable fonts, max is 900)
- Fixed `.project-detail-overlay { z-index: 50 }` → `z-index: 1100` (was buried under fixed header at z-index 1000)
- Fixed `.work-item, .lab-item { width: 80% }` → `width: 100%` (ragged right edge)
- Added `.dud { opacity: 0.4; }` (TextScramble creates `<span class="dud">` but class had no styles)
- Removed dead CSS for `.work-category-cloud` and `.cloud-category` (replaced by new work section)

#### index.html
- Work section: replaced `#workCategoryCloud` with new `#workCatsHero` and `#workMindmapView` structure
- Added `#allProjectsBtn` entry point for mind map
- Added `aria-label` on menu button (already present, confirmed)

---

### Feature: Work Page Redesign

**Categories-first layout:**
- All categories now displayed as large, bold Jost text filling the full work section viewport
- Font size scales with project count (most common = largest, min 2.5rem, max ~9rem)
- Categories default to muted gray; hover = mid-gray; active (selected) = black italic
- Inactive categories dim to 10% opacity when any filter is active
- Subtle parallax on mousemove (RAF-throttled)
- Keyboard accessible: `Enter`/`Space` to toggle each category

**AND-gate filter logic:**
- Selecting multiple categories narrows results to projects that satisfy ALL selected categories
- Selecting one category → matching projects slide in below (category panel compresses)
- "Clear all" resets to full-categories view

**"All Projects" mind map:**
- Clicking "all projects →" opens a full-section SVG mind map
- Categories arranged in a radial ring; project nodes clustered near their category centroids
- Golden-angle distribution prevents node overlap
- Connections drawn as subtle quadratic Bézier curves
- Hover over project node: highlights its connections + connected categories, shows shortDesc in hover preview
- Hover over category node: highlights all connected projects and their links
- Click project node → opens detail overlay
- Click category node → closes mind map and activates that filter
- "← back" button closes mind map
- Full keyboard navigation (`tabindex`, `Enter` to activate)
