document.addEventListener('DOMContentLoaded', () => {
	const themeToggle = document.getElementById('theme-toggle');
	const languageToggle = document.getElementById('language-toggle');
	const languageSwitcher = document.getElementById('language-switcher');
	const i18nElements = document.querySelectorAll('[data-i18n]');

	// --- Theme ---
	// Handles theme initialization and switching. Loads theme from localStorage ("dark" or "light") on page load.
	// Updates body class and toggle button icon. Saves user choice to localStorage on toggle.
	const applyTheme = (theme) => {
		const isDark = theme === 'dark';
		document.documentElement.dataset.theme = theme;
		document.body.classList.toggle('dark-theme', isDark);
		document.body.classList.toggle('light-theme', !isDark);

		const themeColor = document.querySelector('meta[name="theme-color"]');
		if (themeColor) themeColor.content = isDark ? '#121212' : '#fbfbfb';

		if (themeToggle) {
			themeToggle.innerHTML = isDark
				? '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42m0-12.72 1.42-1.42M4.22 19.78l1.42-1.42M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
				: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 15.1A9 9 0 0 1 8.9 3.3 9 9 0 1 0 20.7 15.1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
			themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
		}
	};

	const savedTheme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
	applyTheme(savedTheme);
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
			applyTheme(nextTheme);
			localStorage.setItem('theme', nextTheme);
		});
	}

	// --- Language detection (query, localStorage, browser) ---
	// Determines the user's language preference in the following order:
	// 1. Query parameter (?lang=ru|en|es)
	// 2. localStorage ("language")
	// 3. Browser language (with region mapping for RU/CIS and ES-speaking countries)
	const languageMap = {
		ru: {
			description: 'Портфолио Дениса Гуцуляка: JavaScript, TypeScript, frontend-инструменты и независимые веб-приложения.',
			keywords: 'd9911, разработчик, проекты, портфолио, технологии, frontend, backend, cv, контакты, open source',
			htmlLang: 'ru',
			translations: {
				'hi': "Привет, я Денис и я FullStack JavaScript Developer",
				'page-title': 'Денис Гуцуляк — FullStack JavaScript Developer',
				"process": 'В процессе',
				"free-time-h3": 'Я провожу своё свободное время',
			}
		},
		es: {
			description: 'Portafolio de Denis Gutsuliak: JavaScript, TypeScript, herramientas frontend y aplicaciones web independientes.',
			keywords: 'd9911, desarrollador, proyectos, portafolio, tecnologías, frontend, backend, currículum, contacto, open source',
			htmlLang: 'es',
			translations: {
				'hi': "Hola, soy Denis y soy FullStack JavaScript Developer",
				'page-title': 'Denis Gutsuliak — FullStack JavaScript Developer',
				"process": 'En el proceso',
				"free-time-h3": 'Paso mi tiempo libre,',
			}
		},
		en: {
			description: 'Portfolio of Denis Gutsuliak: JavaScript, TypeScript, frontend tools, and independent web applications.',
			keywords: 'd9911, developer, projects, portfolio, technologies, frontend, backend, cv, contacts, open source',
			htmlLang: 'en',
			translations: {
				'hi': "Hi, I'm Denis and I'm a FullStack JavaScript Developer",
				'page-title': 'Denis Gutsuliak — FullStack JavaScript Developer',
				"process": 'In the process',
				"free-time-h3": 'I spend my free time on',
			}
		}
	};

	function getLangFromQuery() {
		// Checks for ?lang=... in the URL and saves to localStorage if valid
		const params = new URLSearchParams(window.location.search);
		const langParam = params.get('lang');
		if (langParam && languageMap[langParam]) {
			localStorage.setItem('language', langParam);
			return langParam;
		}
		return null;
	}

	function detectLanguage() {
		// Returns the preferred language code
		const savedLang = localStorage.getItem('language');
		if (savedLang && languageMap[savedLang]) return savedLang;
		// Если нет в localStorage, определяем и сохраняем
		const queryLang = getLangFromQuery();
		if (queryLang) {
			localStorage.setItem('language', queryLang);
			return queryLang;
		}
		const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
		const shortLang = browserLang.split('-')[0];
		const ruLangs = ['ru', 'uk', 'be', 'kk', 'ky', 'uz', 'ab', 'mo', 'tg', 'tk'];
		const esLangs = ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec', 'uy', 'bo', 'py', 'gt', 'cr', 'pa', 'do', 'hn', 'sv', 'ni', 'cu'];
		let detected = 'en';
		if (ruLangs.includes(shortLang)) detected = 'ru';
		else if (esLangs.includes(shortLang)) detected = 'es';
		localStorage.setItem('language', detected);
		return detected;
	}

	let currentLanguage = detectLanguage();

	// --- setLangMeta ---
	// Updates <html lang> and meta description/keywords for SEO and accessibility
	function setLangMeta(lang) {
		const meta = languageMap[lang];
		document.documentElement.lang = meta.htmlLang;
		const desc = document.querySelector('meta[name="description"]');
		if (desc) desc.setAttribute('content', meta.description);
		const kw = document.querySelector('meta[name="keywords"]');
		if (kw) kw.setAttribute('content', meta.keywords);
	}

	// --- showLoaderBeforeGreeting ---
	// Shows an animated loader (atom-loader.svg) before the greeting <h1> and hides it after a short delay
	function showLoaderBeforeGreeting(lang) {
		const h1 = document.querySelector('h1[data-i18n="hi"]')?.parentElement;
		if (!h1) return;
		const loaderDiv = document.createElement('div');
		loaderDiv.id = 'atom-loader-wrap';
		loaderDiv.innerHTML = `<img src="src/image/atom-loader.svg" alt="Loading..." width="64" height="64" style="display:block;margin:0 auto;" />`;
		h1.parentNode.insertBefore(loaderDiv, h1);
		h1.style.display = 'none';
		window.addEventListener('load', () => {
			setTimeout(() => {
				loaderDiv.remove();
				h1.style.display = '';
			}, 1200);
		});
	}

	// --- i18n/meta ---
	// Handles translation of all elements with data-i18n and meta tags with data-i18n-meta

	const translationsMeta = {
		ru: {
			description: 'Портфолио Дениса Гуцуляка: JavaScript, TypeScript, frontend-инструменты и независимые веб-приложения.',
			'og:description': 'Портфолио Дениса Гуцуляка: JavaScript, TypeScript, frontend-инструменты и независимые веб-приложения.',
			'twitter:description': 'Портфолио Дениса Гуцуляка: JavaScript, TypeScript, frontend-инструменты и независимые веб-приложения.',
			keywords: 'd9911, разработчик, проекты, портфолио, технологии, frontend, backend, cv, контакты, open source',
		},
		en: {
			description: 'Portfolio of Denis Gutsuliak: JavaScript, TypeScript, frontend tools, and independent web applications.',
			'og:description': 'Portfolio of Denis Gutsuliak: JavaScript, TypeScript, frontend tools, and independent web applications.',
			'twitter:description': 'Portfolio of Denis Gutsuliak: JavaScript, TypeScript, frontend tools, and independent web applications.',
			keywords: 'd9911, developer, projects, portfolio, technologies, frontend, backend, cv, contacts, open source',
		},
		es: {
			description: 'Portafolio de Denis Gutsuliak: JavaScript, TypeScript, herramientas frontend y aplicaciones web independientes.',
			'og:description': 'Portafolio de Denis Gutsuliak: JavaScript, TypeScript, herramientas frontend y aplicaciones web independientes.',
			'twitter:description': 'Portafolio de Denis Gutsuliak: JavaScript, TypeScript, herramientas frontend y aplicaciones web independientes.',
			keywords: 'd9911, desarrollador, proyectos, portafolio, tecnologías, frontend, backend, currículum, contacto, open source',
		},
	};

	function updateMetaTags() {
		// Updates all meta tags with data-i18n-meta for the current language
		const metaTags = document.querySelectorAll('meta[data-i18n-meta]');
		metaTags.forEach((meta) => {
			const key = meta.getAttribute('data-i18n-meta');
			const value = translationsMeta[currentLanguage][key];
			if (value) {
				meta.setAttribute('content', value);
			}
		});
	}

	const translatePage = () => {
		// Always get all elements with data-i18n (including those rendered dynamically)
		document.querySelectorAll('[data-i18n]').forEach((el) => {
			const key = el.getAttribute('data-i18n');
			const translation = languageMap[currentLanguage].translations[key];
			if (translation) {
				if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
					el.placeholder = translation;
				} else {
					el.textContent = translation;
				}
			}
		});
		updateMetaTags();
		setLangMeta(currentLanguage);
		updateLanguageMenu();
	};

	const languageMenu = document.getElementById('language-options');
	const languageCurrent = document.getElementById('language-current');
	const languageOptions = [...document.querySelectorAll('[data-language]')];
	const updateLanguageMenu = () => {
		if (languageCurrent) languageCurrent.textContent = currentLanguage.toUpperCase();
		languageOptions.forEach(option => option.setAttribute('aria-selected', String(option.dataset.language === currentLanguage)));
	};
	const closeLanguageMenu = (restoreFocus = false) => {
		if (!languageToggle || !languageMenu) return;
		languageMenu.hidden = true;
		languageToggle.setAttribute('aria-expanded', 'false');
		if (restoreFocus) languageToggle.focus();
	};
	const openLanguageMenu = () => {
		if (!languageToggle || !languageMenu) return;
		languageMenu.hidden = false;
		languageToggle.setAttribute('aria-expanded', 'true');
		(languageOptions.find(option => option.dataset.language === currentLanguage) || languageOptions[0])?.focus();
	};

	// --- Language switchers ---
	// Handles both a select (languageSwitcher) and a button (languageToggle) for changing language
	if (languageSwitcher) {
		languageSwitcher.value = currentLanguage;
		languageSwitcher.addEventListener('change', (e) => {
			const lang = e.target.value;
			currentLanguage = lang;
			document.documentElement.lang = lang;
			localStorage.setItem('language', lang);
			translatePage();
		});
	}

	if (languageToggle) {
		languageToggle.addEventListener('click', () => languageMenu?.hidden ? openLanguageMenu() : closeLanguageMenu());
	}
	languageOptions.forEach((option, index) => {
		option.addEventListener('click', () => {
			currentLanguage = option.dataset.language;
			localStorage.setItem('language', currentLanguage);
			translatePage();
			closeLanguageMenu(true);
		});
		option.addEventListener('keydown', event => {
			if (event.key === 'Escape') { event.preventDefault(); closeLanguageMenu(true); }
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				const step = event.key === 'ArrowDown' ? 1 : -1;
				languageOptions[(index + step + languageOptions.length) % languageOptions.length].focus();
			}
		});
	});
	document.addEventListener('pointerdown', event => {
		if (!languageToggle?.contains(event.target) && !languageMenu?.contains(event.target)) closeLanguageMenu();
	});

	// --- Initial render ---
	// Sets <html lang>, translates page, sets meta, and shows loader before greeting

	document.documentElement.lang = currentLanguage;
	translatePage();
	setLangMeta(currentLanguage);
	showLoaderBeforeGreeting(currentLanguage);

	// --- README.md loading ---
	// Loads and renders README.md into the #readme-container using marked.js
	const readmeContainer = document.getElementById('readme-container');
	const renderMarkdown = (markdown) => {
		if (window.marked?.parse) return window.marked.parse(markdown);

		const fallback = document.createElement('pre');
		fallback.className = 'markdown-fallback';
		fallback.textContent = markdown;
		return fallback;
	};

	fetch('./README.md')
		.then((res) => {
			if (!res.ok) throw new Error('Не удалось загрузить README.md');
			return res.text();
		})
		.then((markdown) => {
			const rendered = renderMarkdown(markdown);
			readmeContainer.replaceChildren();
			if (typeof rendered === 'string') readmeContainer.innerHTML = rendered;
			else readmeContainer.append(rendered);
			const images = [...readmeContainer.querySelectorAll('img')];
			images.forEach((image, index) => {
				image.decoding = 'async';
				if (index > 1) image.loading = 'lazy';
				if (image.src.includes('github-readme-stats.vercel.app')) {
					image.addEventListener('error', () => {
						const fallback = document.createElement('span');
						fallback.className = 'external-image-fallback';
						fallback.textContent = currentLanguage === 'ru' ? 'Статистика GitHub временно недоступна' : currentLanguage === 'es' ? 'Las estadísticas de GitHub no están disponibles' : 'GitHub stats are temporarily unavailable';
						image.replaceWith(fallback);
					}, { once: true });
				}
			});
			readmeContainer.setAttribute('aria-busy', 'false');
			translatePage(); // <-- translate new elements!
		})
		.catch((err) => {
			console.error(err);
			readmeContainer.setAttribute('aria-busy', 'false');
			readmeContainer.innerHTML = '<p>Error while loading content..</p>';
		});

	// --- SVG Sprite ---
	// Inserts the sprite.svg content into a hidden div for easy access
	const svgSpriteContainer = document.getElementById('svg-sprite-container');
	if (svgSpriteContainer) {
		fetch('src/sprite/sprite.svg')
			.then(r => r.text())
			.then(svg => {
				svgSpriteContainer.innerHTML = svg;
			})
			.catch(err => {
				console.error('Error loading sprite.svg:', err);
			});
	}
});
