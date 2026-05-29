/* =============================================================================
   DATA LAYER
   ============================================================================= */
let heroProjects, workData, labData, aboutText;
let dataLoaded = false;

const dataReady = fetch('data.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(data => {
        heroProjects = data.heroProjects;
        
        // Sorter function for chronological order
        const sortByYearDesc = (a, b) => {
            const getYearVal = (yearStr) => {
                const str = String(yearStr).toLowerCase();
                if (str.includes('ongoing')) return 9999;
                const matches = str.match(/\d{4}/g);
                return matches ? Math.max(...matches.map(Number)) : 0;
            };
            return getYearVal(b.year) - getYearVal(a.year); 
        };

        workData = data.work.sort(sortByYearDesc);
        labData = data.lab.sort(sortByYearDesc);
        aboutText = data.about;
        dataLoaded = true;
    })
    .catch(err => {
        console.error('Failed to load data.json:', err);
        document.getElementById('loader').classList.add('hidden');
    });

/* =============================================================================
   SYSTEM LOGIC
   ============================================================================= */
const cursor = document.querySelector('.cursor');
let cursorX = 0, cursorY = 0, cursorRafPending = false;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (!cursorRafPending) {
        cursorRafPending = true;
        requestAnimationFrame(() => {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursorRafPending = false;
        });
    }
});

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

const loader = document.getElementById('loader');
const loaderText = document.getElementById('loaderText');
const loaderProgress = document.getElementById('loaderProgress');
let progress = 0;

const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 2;
    if (progress >= 100) progress = 100;

    loaderText.textContent = progress;
    const circumference = 282.6;
    const offset = circumference - (progress / 100) * circumference;
    loaderProgress.style.strokeDashoffset = offset;

    if (progress === 100) {
        clearInterval(loadInterval);
        setTimeout(() => {
            loader.classList.add('hidden');
            dataReady.then(() => {
                if (dataLoaded) initSite();
            });
        }, 500);
    }
}, 30);

const brandLogo = document.getElementById('brandLogo');
const chars = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = chars;
        this.originalText = el.textContent;
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

const scrambler = new TextScramble(brandLogo);
brandLogo.addEventListener('mouseenter', () => { scrambler.setText('beatnyk'); });
brandLogo.addEventListener('click', () => { scrollToSection(0); });

function initUniversalScramble() {
    const targets = document.querySelectorAll('.menu-list a, .social-list a');
    targets.forEach(el => {
        const s = new TextScramble(el);
        el.addEventListener('mouseenter', () => { s.setText(s.originalText); });
    });
}

const heroTitle = document.getElementById('heroTitle');
const contactTitle = document.getElementById('contactTitle');
const aboutTitle = document.getElementById('aboutTitle');
const workTitle = document.getElementById('workTitle');
const labTitle = document.getElementById('labTitle');
const chaosIntervals = [];

function prepareChaosText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'chaos-char';
        element.appendChild(span);
    });
}

function startChaosAnimation(element) {
    const id = setInterval(() => {
        element.querySelectorAll('.chaos-char').forEach(char => {
            const randomWeight = Math.floor(Math.random() * 9) * 100 + 100;
            const randomStyle = Math.random() > 0.5 ? 'italic' : 'normal';
            char.style.fontWeight = randomWeight;
            char.style.fontStyle = randomStyle;
        });
    }, 200);
    chaosIntervals.push(id);
}

function prepareHero() {
    const text = heroTitle.textContent.trim();
    heroTitle.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'hero-char chaos-char';
        heroTitle.appendChild(span);
    });
}

function prepareContact() {
    const parts = contactTitle.innerHTML.split(/<br\s*\/?>/i);
    contactTitle.innerHTML = '';
    parts.forEach((part, index) => {
        const text = part.trim();
        text.split('').forEach(c => {
            const span = document.createElement('span');
            span.className = 'contact-char chaos-char';
            span.textContent = c;
            contactTitle.appendChild(span);
        });
        if (index < parts.length - 1) {
            contactTitle.appendChild(document.createElement('br'));
        }
    });
}

function animateHeroIn() {
    const heroChars = heroTitle.querySelectorAll('.hero-char');
    heroChars.forEach((char, index) => {
        setTimeout(() => {
            char.style.opacity = '1'; char.style.filter = 'blur(0px)'; char.style.transform = 'translateY(0px) scale(1)';
        }, index * 100 + 300);
    });
}

function animateHeroOut() {
    const heroChars = heroTitle.querySelectorAll('.hero-char');
    const total = heroChars.length;
    heroChars.forEach((char, index) => {
        const reverseIndex = total - 1 - index;
        setTimeout(() => {
            char.style.opacity = '0'; char.style.filter = 'blur(10px)'; char.style.transform = 'translateY(-20px) scale(0.8)';
        }, reverseIndex * 50);
    });
}

function animateContactIn() {
    const contactChars = contactTitle.querySelectorAll('.contact-char');
    contactChars.forEach((char, index) => {
        setTimeout(() => {
            char.style.opacity = '1'; char.style.filter = 'blur(0px)'; char.style.transform = 'translateY(0px) scale(1)';
        }, index * 50 + 200);
    });
}

function animateContactOut() {
    const contactChars = contactTitle.querySelectorAll('.contact-char');
    const total = contactChars.length;
    contactChars.forEach((char, index) => {
        const reverseIndex = total - 1 - index;
        setTimeout(() => {
            char.style.opacity = '0'; char.style.filter = 'blur(10px)'; char.style.transform = 'translateY(-20px) scale(0.8)';
        }, reverseIndex * 30);
    });
}

const menuDot = document.getElementById('menuDot');
const sideMenu = document.getElementById('sideMenu');
const sitePusher = document.getElementById('sitePusher');

menuDot.addEventListener('click', () => {
    menuDot.classList.toggle('active');
    sideMenu.classList.toggle('active');
    sitePusher.classList.toggle('menu-open');
});

sideMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = parseInt(link.dataset.section);
        scrollToSection(section);
        menuDot.classList.remove('active');
        sideMenu.classList.remove('active');
        sitePusher.classList.remove('menu-open');
    });
});

const horizontalContainer = document.getElementById('horizontalContainer');
const sections = document.querySelectorAll('.section');
let currentSection = 0;
let isScrolling = false;

window.addEventListener('wheel', (e) => {
    if (isScrolling) return;

    if (currentSection === 2) {
        const detailOverlayEl = document.getElementById('projectDetailOverlay');
        if (detailOverlayEl.classList.contains('active')) return;

        const mindmapView = document.getElementById('workMindmapView');
        if (mindmapView.classList.contains('active')) {
            e.preventDefault();
            return;
        }

        const workContainer = document.getElementById('workResultsScroll');
        if (workContainer && workContainer.contains(e.target) && activeWorkFilters.size > 0) {
            const atTop = workContainer.scrollTop <= 0;
            const atBottom = Math.abs((workContainer.scrollHeight - workContainer.scrollTop) - workContainer.clientHeight) < 5;
            
            if (e.deltaY > 0 && !atBottom) return; 
            if (e.deltaY < 0 && !atTop) return;   
        }
    }

    if (currentSection === 3) {
        const detailOverlayEl = document.getElementById('projectDetailOverlay');
        if (detailOverlayEl.classList.contains('active')) return;
        
        const labContainer = document.getElementById('labScrollContainer');
        if (labContainer && labContainer.contains(e.target)) {
            const atTop = labContainer.scrollTop <= 0;
            const atBottom = Math.abs((labContainer.scrollHeight - labContainer.scrollTop) - labContainer.clientHeight) < 5;
            if (e.deltaY > 0 && !atBottom) return;
            if (e.deltaY < 0 && !atTop) return;
        }
    }

    if (Math.abs(e.deltaY) > 25) {
        e.preventDefault();
        if (e.deltaY > 0 && currentSection < 4) {
            triggerScroll(currentSection + 1);
        } else if (e.deltaY < 0 && currentSection > 0) {
            triggerScroll(currentSection - 1);
        }
    }
}, { passive: false });

function triggerScroll(index) {
    isScrolling = true;
    scrollToSection(index);
    setTimeout(() => isScrolling = false, 1200);
}

function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;

    if (currentSection === 0 && index !== 0) animateHeroOut();
    if (currentSection === 4 && index !== 4) animateContactOut();

    currentSection = index;
    const translateX = index * window.innerWidth;
    horizontalContainer.style.transform = `translateX(-${translateX}px)`;

    if (currentSection === 0) {
        brandLogo.classList.remove('visible');
    } else {
        brandLogo.classList.add('visible');
    }

    setTimeout(() => {
        if (currentSection === 0) animateHeroIn();
        if (currentSection === 1) triggerTypewriter(); else resetTypewriter();
        if (currentSection === 4) animateContactIn();
    }, 800);
}

const hoverPreview = document.getElementById('hoverPreview');

function updateHoverPreview(text) {
    if (text) {
        hoverPreview.textContent = text;
        hoverPreview.classList.add('active');
    } else {
        hoverPreview.classList.remove('active');
    }
}

function triggerTypewriter() {
    const aboutChars = document.querySelectorAll('.about-char');
    aboutChars.forEach((char, index) => {
        setTimeout(() => char.classList.add('active'), index * 10);
    });
}
function resetTypewriter() {
    document.querySelectorAll('.about-char').forEach(c => c.classList.remove('active'));
}

let heroInterval = null;

function renderHeroProjects() {
    const categories = ['upcoming', 'current', 'recent'];
    let idx = 0;
    function updateHero() {
        const cat = categories[idx];
        document.getElementById('projectLabel').textContent = cat;
        const itemsContainer = document.getElementById('projectItems');
        itemsContainer.innerHTML = '';
        heroProjects[cat].forEach(p => {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'project-item-title';
            titleDiv.textContent = p.title;

            const descDiv = document.createElement('div');
            descDiv.className = 'project-item-desc';
            descDiv.textContent = p.desc;

            const catDiv = document.createElement('div');
            catDiv.className = 'project-item-cat';
            catDiv.textContent = p.category;

            itemsContainer.appendChild(titleDiv);
            itemsContainer.appendChild(descDiv);
            itemsContainer.appendChild(catDiv);
        });
        idx = (idx + 1) % categories.length;
    }
    heroInterval = setInterval(updateHero, 5000);
    updateHero();
}

function renderAboutText() {
    const aboutContainer = document.getElementById('aboutText');
    aboutContainer.innerHTML = '';
    aboutText.split('\n\n').forEach(para => {
        const p = document.createElement('p');
        para.split(' ').forEach(word => {
            const span = document.createElement('span');
            span.className = 'about-char';
            span.textContent = word + ' ';
            p.appendChild(span);
        });
        aboutContainer.appendChild(p);
    });
}

let activeWorkFilters = new Set();

function initWorkCategories() {
    const categoryCounts = {};
    workData.forEach(p => p.categories.forEach(c => {
        const cat = c.trim();
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }));

    const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];

    const hero = document.getElementById('workCatsHero');
    hero.innerHTML = '';

    // "ALL" Category
    const allCatBtn = document.createElement('button');
    allCatBtn.className = 'work-cat-item';
    allCatBtn.textContent = 'all';
    allCatBtn.dataset.filter = 'ALL';
    allCatBtn.dataset.depth = '0.5';
    allCatBtn.style.setProperty('--base-size', '8rem');
    allCatBtn.setAttribute('tabindex', '0');
    allCatBtn.setAttribute('role', 'checkbox');
    allCatBtn.setAttribute('aria-checked', 'false');
    
    allCatBtn.addEventListener('click', () => {
        clearWorkFilters();
        activeWorkFilters.add('ALL');
        allCatBtn.classList.add('active');
        allCatBtn.setAttribute('aria-checked', 'true');
        updateCategoryDimming();
        renderWorkList();
    });
    allCatBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); allCatBtn.click(); } });
    allCatBtn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    allCatBtn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    hero.appendChild(allCatBtn);

    sorted.forEach(([cat, count]) => {
        const ratio = maxCount === minCount ? 0.5 : (count - minCount) / (maxCount - minCount);
        const size = 2.5 + ratio * 6.5; 
        const depth = (0.4 + Math.random() * 1.0).toFixed(2);

        const btn = document.createElement('button');
        btn.className = 'work-cat-item';
        btn.textContent = cat;
        btn.dataset.filter = cat;
        btn.dataset.depth = depth;
        btn.style.setProperty('--base-size', size + 'rem');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('role', 'checkbox');
        btn.setAttribute('aria-checked', 'false');
        btn.setAttribute('aria-label', cat);

        btn.addEventListener('click', () => toggleWorkFilter(cat, btn));
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleWorkFilter(cat, btn);
            }
        });
        btn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        btn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));

        hero.appendChild(btn);
    });

    // Uiverse Toggle Logic
    const viewToggleCheckbox = document.getElementById('viewToggleCheckbox');
    const labelList = document.getElementById('labelList');
    const labelMindmap = document.getElementById('labelMindmap');
    const categoriesView = document.getElementById('workCategoriesView');
    
    if (viewToggleCheckbox) {
        const toggleWorkView = () => {
            if (viewToggleCheckbox.checked) {
                labelList.classList.remove('active');
                labelMindmap.classList.add('active');
                categoriesView.classList.add('zoom-out');
                showMindMap();
            } else {
                labelList.classList.add('active');
                labelMindmap.classList.remove('active');
                categoriesView.classList.remove('zoom-out');
                hideMindMap();
            }
        };
        viewToggleCheckbox.addEventListener('change', toggleWorkView);
    }

    document.getElementById('clearFiltersBtn').addEventListener('click', clearWorkFilters);
    initWorkParallax();
}

function toggleWorkFilter(cat, btn) {
    if (activeWorkFilters.has('ALL')) {
        activeWorkFilters.delete('ALL');
        const allBtn = document.querySelector('.work-cat-item[data-filter="ALL"]');
        if (allBtn) {
            allBtn.classList.remove('active');
            allBtn.setAttribute('aria-checked', 'false');
        }
    }

    if (activeWorkFilters.has(cat)) {
        activeWorkFilters.delete(cat);
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
    } else {
        activeWorkFilters.add(cat);
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
    }
    updateCategoryDimming();
    renderWorkList();
}

function updateCategoryDimming() {
    document.querySelectorAll('.work-cat-item').forEach(item => {
        if (activeWorkFilters.size === 0) {
            item.classList.remove('dimmed');
        } else if (activeWorkFilters.has(item.dataset.filter)) {
            item.classList.remove('dimmed');
        } else {
            item.classList.add('dimmed');
        }
    });
}

function clearWorkFilters() {
    activeWorkFilters.clear();
    document.querySelectorAll('.work-cat-item').forEach(b => {
        b.classList.remove('active', 'dimmed');
        b.setAttribute('aria-checked', 'false');
    });
    renderWorkList();
}

function renderWorkList() {
    const container = document.getElementById('workResultsList');
    const content = document.querySelector('.work-content');
    const countEl = document.getElementById('resultsCount');

    container.innerHTML = '';

    if (activeWorkFilters.size === 0) {
        content.classList.remove('has-results');
        return;
    }

    let filtered = [];
    if (activeWorkFilters.has('ALL')) {
        filtered = workData;
    } else {
        filtered = workData.filter(work =>
            [...activeWorkFilters].every(f => work.categories.includes(f))
        );
    }

    countEl.textContent = filtered.length + ' project' + (filtered.length !== 1 ? 's' : '');
    content.classList.add('has-results');

    filtered.forEach(work => {
        const div = document.createElement('div');
        div.className = 'work-item';

        const yearDiv = document.createElement('div');
        yearDiv.className = 'work-year';
        yearDiv.textContent = work.year;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'work-title';
        titleDiv.textContent = work.title;

        const orgDiv = document.createElement('div');
        orgDiv.className = 'work-org';
        orgDiv.textContent = work.org;

        const locDiv = document.createElement('div');
        locDiv.className = 'work-loc';
        locDiv.textContent = work.location;

        div.appendChild(yearDiv);
        div.appendChild(titleDiv);
        div.appendChild(orgDiv);
        div.appendChild(locDiv);

        div.addEventListener('mouseenter', () => updateHoverPreview(work.shortDesc));
        div.addEventListener('mouseleave', () => updateHoverPreview(null));
        div.addEventListener('click', () => openProjectDetail(work));

        container.appendChild(div);
    });
}

function initWorkParallax() {
    const hero = document.getElementById('workCatsHero');
    let rafActive = false;
    hero.addEventListener('mousemove', (e) => {
        if (rafActive) return;
        rafActive = true;
        requestAnimationFrame(() => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            document.querySelectorAll('.work-cat-item:not(.active):not(.dimmed)').forEach(cat => {
                const depth = parseFloat(cat.dataset.depth);
                cat.style.transform = `translate(${x * depth * 30}px, ${y * depth * 18}px)`;
            });
            rafActive = false;
        });
    });
    hero.addEventListener('mouseleave', () => {
        document.querySelectorAll('.work-cat-item').forEach(cat => {
            cat.style.transform = 'translate(0, 0)';
        });
    });
}

function showMindMap() {
    const view = document.getElementById('workMindmapView');
    view.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => renderMindMap()));
}

function hideMindMap() {
    document.getElementById('workMindmapView').classList.remove('active');
}

function renderMindMap() {
    const svgEl = document.getElementById('mindmapSvg');
    svgEl.innerHTML = '';

    const W = svgEl.clientWidth || window.innerWidth;
    const H = svgEl.clientHeight || window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;
    const NS = 'http://www.w3.org/2000/svg';

    const catMap = {};
    workData.forEach(proj => {
        proj.categories.forEach(c => {
            if (!catMap[c]) catMap[c] = { name: c, x: 0, y: 0 };
        });
    });
    const catList = Object.values(catMap);

    const catRadius = Math.min(W, H) * 0.36;
    catList.forEach((cat, i) => {
        const angle = (2 * Math.PI * i / catList.length) - Math.PI / 2;
        cat.x = cx + catRadius * Math.cos(angle);
        cat.y = cy + catRadius * Math.sin(angle);
    });

    workData.forEach((proj, idx) => {
        const validCats = proj.categories.filter(c => catMap[c]);
        let sx = 0, sy = 0;
        validCats.forEach(c => { sx += catMap[c].x; sy += catMap[c].y; });
        if (validCats.length > 0) { sx /= validCats.length; sy /= validCats.length; }
        else { sx = cx; sy = cy; }

        sx = sx * 0.55 + cx * 0.45;
        sy = sy * 0.55 + cy * 0.45;

        const goldenAngle = 2.399;
        const angle = (idx * goldenAngle) % (2 * Math.PI);
        const r = 18 + (idx % 6) * 15;
        proj._mapX = sx + r * Math.cos(angle);
        proj._mapY = sy + r * Math.sin(angle);
    });

    const linksGroup = document.createElementNS(NS, 'g');
    const catsGroup = document.createElementNS(NS, 'g');
    const projsGroup = document.createElementNS(NS, 'g');

    workData.forEach((proj, pIdx) => {
        proj.categories.forEach(c => {
            if (!catMap[c]) return;
            const cat = catMap[c];
            const mx = (proj._mapX + cat.x) / 2;
            const my = (proj._mapY + cat.y) / 2;
            const cpx = mx + (cx - mx) * 0.12;
            const cpy = my + (cy - my) * 0.12;

            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', `M ${proj._mapX} ${proj._mapY} Q ${cpx} ${cpy} ${cat.x} ${cat.y}`);
            path.setAttribute('class', 'mindmap-link');
            path.dataset.pIdx = pIdx;
            path.dataset.cat = c;
            linksGroup.appendChild(path);
        });
    });

    catList.forEach(cat => {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'mindmap-cat-node');
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', cat.name);
        g.dataset.cat = cat.name;

        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', cat.x);
        text.setAttribute('y', cat.y);
        text.setAttribute('class', 'mindmap-cat-label');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = cat.name;

        g.appendChild(text);

        g.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            highlightCategory(cat.name, svgEl);
        });
        g.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            clearMindmapHighlight(svgEl);
        });
        
        g.addEventListener('click', () => {
            const checkbox = document.getElementById('viewToggleCheckbox');
            if (checkbox && checkbox.checked) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
            }
            clearWorkFilters();
            const btn = document.querySelector(`.work-cat-item[data-filter="${cat.name}"]`);
            if (btn) toggleWorkFilter(cat.name, btn);
        });
        
        g.addEventListener('keydown', e => {
            if (e.key === 'Enter') g.click();
        });

        catsGroup.appendChild(g);
    });

    workData.forEach((proj, pIdx) => {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'mindmap-proj-node');
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', proj.title);
        g.dataset.pIdx = pIdx;

        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', proj._mapX);
        circle.setAttribute('cy', proj._mapY);
        circle.setAttribute('r', '4');
        circle.setAttribute('class', 'mindmap-proj-dot');

        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', proj._mapX);
        text.setAttribute('y', proj._mapY + 13);
        text.setAttribute('class', 'mindmap-proj-label');
        text.setAttribute('text-anchor', 'middle');
        const label = proj.title.length > 22 ? proj.title.slice(0, 20) + '…' : proj.title;
        text.textContent = label;

        g.appendChild(circle);
        g.appendChild(text);

        g.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            updateHoverPreview(proj.shortDesc);
            highlightProject(pIdx, proj, svgEl);
        });
        g.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            updateHoverPreview(null);
            clearMindmapHighlight(svgEl);
        });
        g.addEventListener('click', () => openProjectDetail(proj));
        g.addEventListener('keydown', e => {
            if (e.key === 'Enter') openProjectDetail(proj);
        });

        projsGroup.appendChild(g);
    });

    svgEl.appendChild(linksGroup);
    svgEl.appendChild(catsGroup);
    svgEl.appendChild(projsGroup);
}

function highlightProject(pIdx, proj, svgEl) {
    svgEl.querySelectorAll('.mindmap-link').forEach(l => {
        const isOwn = l.dataset.pIdx === String(pIdx);
        l.classList.toggle('active', isOwn);
        l.classList.toggle('faded', !isOwn);
    });
    svgEl.querySelectorAll('.mindmap-cat-node').forEach(n => {
        const linked = proj.categories.includes(n.dataset.cat);
        n.classList.toggle('linked', linked);
        n.classList.toggle('faded', !linked);
    });
    svgEl.querySelectorAll('.mindmap-proj-node').forEach(n => {
        n.classList.toggle('faded', n.dataset.pIdx !== String(pIdx));
    });
}

function highlightCategory(catName, svgEl) {
    const relatedIndices = new Set();
    workData.forEach((p, i) => { if (p.categories.includes(catName)) relatedIndices.add(i); });

    svgEl.querySelectorAll('.mindmap-link').forEach(l => {
        const isOwn = l.dataset.cat === catName;
        l.classList.toggle('active', isOwn);
        l.classList.toggle('faded', !isOwn);
    });
    svgEl.querySelectorAll('.mindmap-cat-node').forEach(n => {
        n.classList.toggle('linked', n.dataset.cat === catName);
        n.classList.toggle('faded', n.dataset.cat !== catName);
    });
    svgEl.querySelectorAll('.mindmap-proj-node').forEach(n => {
        const related = relatedIndices.has(parseInt(n.dataset.pIdx));
        n.classList.toggle('faded', !related);
    });
}

function clearMindmapHighlight(svgEl) {
    svgEl.querySelectorAll('.mindmap-link, .mindmap-cat-node, .mindmap-proj-node').forEach(el => {
        el.classList.remove('active', 'faded', 'linked');
    });
}

const detailOverlay = document.getElementById('projectDetailOverlay');
const closeDetailBtn = document.getElementById('closeDetailBtn');

function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
    } catch (e) { }
    return '';
}

function openProjectDetail(item) {
    document.getElementById('detailYear').textContent = item.year;
    document.getElementById('detailCategories').textContent = item.categories.join(' / ');
    const titleEl = document.getElementById('detailTitle');
    titleEl.textContent = item.title;

    if (!titleEl._scramble) {
        const s = new TextScramble(titleEl);
        titleEl.addEventListener('mouseenter', () => { s.setText(s.originalText); });
        titleEl._scramble = s;
    }
    titleEl._scramble.originalText = item.title;

    document.getElementById('detailOrg').textContent = item.org || '';
    document.getElementById('detailLoc').textContent = item.location || '';

    const eventsSidebar = document.getElementById('detailEventsSidebar');
    eventsSidebar.innerHTML = '';
    if (item.events && item.events.length > 0) {
        const heading = document.createElement('div');
        heading.className = 'events-sidebar-title';
        heading.textContent = 'performances & events';
        eventsSidebar.appendChild(heading);

        item.events.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'event-sidebar-item';
            if (ev.year) {
                const yr = document.createElement('div');
                yr.className = 'event-sidebar-year';
                yr.textContent = ev.year;
                evDiv.appendChild(yr);
            }
            if (ev.title) {
                const nm = document.createElement('div');
                nm.className = 'event-sidebar-name';
                nm.textContent = ev.title;
                evDiv.appendChild(nm);
            }
            if (ev.org) {
                const org = document.createElement('div');
                org.className = 'event-sidebar-org';
                org.textContent = ev.org;
                evDiv.appendChild(org);
            }
            if (ev.place) {
                const place = document.createElement('div');
                place.className = 'event-sidebar-place';
                place.textContent = ev.place;
                evDiv.appendChild(place);
            }
            eventsSidebar.appendChild(evDiv);
        });
    }

    const body = document.getElementById('detailBody');
    const fullContent = item.fullDesc || '<p>Detailed documentation for this project is currently being updated.</p>';

    const safeLink = sanitizeUrl(item.link);
    const linkHtml = safeLink
        ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="detail-link-btn">visit project ↗</a>`
        : '';

    let mediaHtml = '';
    if (item.media && item.media.length > 0) {
        const mediaItems = item.media.map(m => {
            const safeUrl = sanitizeUrl(m.url);
            if (!safeUrl) return '';
            if (m.type === 'image') {
                return `<img src="${safeUrl}" alt="${item.title}" class="detail-media-img" loading="lazy">`;
            } else if (m.type === 'video') {
                return `<iframe src="${safeUrl}" class="detail-media-embed" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
            } else if (m.type === 'audio') {
                return `<iframe src="${safeUrl}" class="detail-media-embed detail-media-audio" frameborder="0" allow="autoplay"></iframe>`;
            }
            return '';
        }).join('');
        mediaHtml = `<div class="detail-media-container">${mediaItems}</div>`;
    }

    body.innerHTML = `${fullContent}${linkHtml}${mediaHtml}`;
    detailOverlay.classList.add('active');
    closeDetailBtn.focus();
}

closeDetailBtn.addEventListener('click', () => { detailOverlay.classList.remove('active'); });

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && detailOverlay.classList.contains('active')) {
        detailOverlay.classList.remove('active');
    }
});

let activeLabFilters = new Set(['all']);

function createFilterToggle(filtersSet, groupSelector, renderFn) {
    return function(btn) {
        const filter = btn.dataset.filter;
        if (filter === 'all') {
            filtersSet.clear();
            filtersSet.add('all');
            document.querySelectorAll(`${groupSelector} .filter-btn`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        } else {
            if (filtersSet.has('all')) {
                filtersSet.delete('all');
                document.querySelector(`${groupSelector} [data-filter="all"]`).classList.remove('active');
            }
            if (filtersSet.has(filter)) {
                filtersSet.delete(filter);
                btn.classList.remove('active');
            } else {
                filtersSet.add(filter);
                btn.classList.add('active');
            }
            if (filtersSet.size === 0) {
                filtersSet.add('all');
                document.querySelector(`${groupSelector} [data-filter="all"]`).classList.add('active');
            }
        }
        renderFn();
    };
}

const toggleLabFilter = createFilterToggle(activeLabFilters, '#labFilterGroup', renderLabList);

function initLabFilters() {
    const allCategories = new Set();
    labData.forEach(p => p.categories.forEach(c => allCategories.add(c.trim())));
    const sortedCategories = Array.from(allCategories).sort();

    const filterGroup = document.getElementById('labFilterGroup');
    filterGroup.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'all';
    allBtn.onclick = (e) => toggleLabFilter(e.target);
    filterGroup.appendChild(allBtn);

    sortedCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.toLowerCase();
        btn.dataset.filter = cat;
        btn.onclick = () => toggleLabFilter(btn);
        filterGroup.appendChild(btn);
    });
}

function renderLabList() {
    const labListContainer = document.getElementById('labList');
    labListContainer.innerHTML = '';

    labData.forEach(item => {
        const matches = activeLabFilters.has('all') || item.categories.some(c => activeLabFilters.has(c));
        if (!matches) return;

        const div = document.createElement('div');
        div.className = 'lab-item';

        const yearDiv = document.createElement('div');
        yearDiv.className = 'lab-year';
        yearDiv.textContent = item.year;

        const titleGroup = document.createElement('div');
        titleGroup.className = 'lab-title-group';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'lab-title';
        titleDiv.textContent = item.title;
        const catDiv = document.createElement('div');
        catDiv.className = 'lab-cat';
        catDiv.textContent = item.categories.map(c => c.toLowerCase()).join(' / ');
        titleGroup.appendChild(titleDiv);
        titleGroup.appendChild(catDiv);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'lab-meta';
        metaDiv.textContent = item.org;
        const locSpan = document.createElement('span');
        locSpan.className = 'lab-meta-location';
        locSpan.textContent = item.location;
        metaDiv.appendChild(document.createElement('br'));
        metaDiv.appendChild(locSpan);

        div.appendChild(yearDiv);
        div.appendChild(titleGroup);
        div.appendChild(metaDiv);

        div.addEventListener('mouseenter', () => updateHoverPreview(item.shortDesc));
        div.addEventListener('mouseleave', () => updateHoverPreview(null));
        div.addEventListener('click', () => openProjectDetail(item));

        labListContainer.appendChild(div);
    });
}

function initSite() {
    prepareHero();
    prepareContact();
    prepareChaosText(aboutTitle);
    prepareChaosText(workTitle);
    prepareChaosText(labTitle);

    renderHeroProjects();
    renderAboutText();
    initWorkCategories();
    renderWorkList();

    initLabFilters();
    renderLabList();

    initUniversalScramble();

    scrambler.setText('beatnyk');
    animateHeroIn();

    startChaosAnimation(heroTitle);
    startChaosAnimation(contactTitle);
    startChaosAnimation(aboutTitle);
    startChaosAnimation(workTitle);
    startChaosAnimation(labTitle);

    window.addEventListener('beforeunload', () => {
        chaosIntervals.forEach(id => clearInterval(id));
    });
}