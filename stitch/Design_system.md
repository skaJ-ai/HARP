<!-- Design System -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>HARP | HR Reporting Refined by AI</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "tertiary-fixed-dim": "#bcc7dd",
              "surface-dim": "#e1e3e5",
              "on-secondary-fixed-variant": "#005145",
              "primary-container": "#0f4c81",
              "outline-variant": "#c2c7d1",
              "on-primary-fixed-variant": "#07497d",
              "tertiary": "#293446",
              "surface-container-highest": "#e0e3e5",
              "on-primary": "#ffffff",
              "on-primary-fixed": "#001c37",
              "surface-bright": "#ffffff",
              "secondary-fixed-dim": "#44ddc1",
              "primary-fixed": "#d2e4ff",
              "surface-container": "#f1f3f5",
              "on-tertiary-fixed-variant": "#3c475a",
              "surface-container-low": "#f8f9fa",
              "surface-tint": "#2d6197",
              "secondary-container": "#68fadd",
              "on-surface": "#191c1e",
              "on-secondary-fixed": "#00201a",
              "background": "#ffffff",
              "outline": "#727780",
              "on-error": "#ffffff",
              "secondary-fixed": "#68fadd",
              "surface": "#ffffff",
              "on-tertiary": "#ffffff",
              "on-background": "#191c1e",
              "on-error-container": "#93000a",
              "on-secondary": "#ffffff",
              "surface-container-lowest": "#ffffff",
              "on-tertiary-fixed": "#111c2c",
              "primary-fixed-dim": "#a0c9ff",
              "inverse-surface": "#2d3133",
              "inverse-on-surface": "#eff1f3",
              "on-primary-container": "#8ebdf9",
              "on-tertiary-container": "#b0bbd1",
              "secondary": "#006b5c",
              "tertiary-container": "#404b5e",
              "primary": "#00355f",
              "tertiary-fixed": "#d8e3fa",
              "surface-variant": "#e0e3e5",
              "error-container": "#ffdad6",
              "inverse-primary": "#a0c9ff",
              "error": "#ba1a1a",
              "on-surface-variant": "#42474f",
              "surface-container-high": "#e8eaec",
              "on-secondary-container": "#007261"
            },
            fontFamily: {
              "headline": ["Manrope", "sans-serif"],
              "body": ["Manrope", "sans-serif"],
              "label": ["Manrope", "sans-serif"]
            },
            borderRadius: {"DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .btn-primary {
            @apply bg-gradient-to-b from-[#00355f] to-[#0f4c81] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98];
        }
        .btn-teal {
            @apply bg-[#006b5c] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-[#005145] active:scale-[0.98];
        }
        .btn-secondary {
            @apply border border-outline-variant/30 bg-transparent text-on-surface px-6 py-3 rounded-lg font-semibold transition-all hover:bg-surface-container-low active:scale-[0.98];
        }
        .workspace-card {
            @apply bg-surface-container-lowest rounded-lg p-8 border border-outline-variant/10 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0px_12px_32px_rgba(0,0,0,0.06)] hover:border-outline-variant/20;
        }
        .glass-header {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body selection:bg-secondary-container">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 glass-header border-b border-outline-variant/10">
<div class="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
<div class="flex items-center">
<img alt="HARP Logo" class="h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE9fqcdxzZAPNDTdiP4SKSvqkQdQ_gavCqWXk0fkk_j3_fZB6-Psx_Y1h4obNjZbSKySJlhF-p0cc7tvLJWl1z0tl-qCfwoCDpckkNRz44WgbHRUr0BD-ui3M3v-9CKKC_vGwo28QOHvdUKmG_93sGEUmM1p-NWew0Z4FJUGlIvwj3pm9BhURFZ9R4t5X59d4tG-YC1d3jEn1UsoJZnvSWvZEliYTn5_7ly7K1KWioWZ1XWysMLzlU7xaKoD9Lz85w7hFBYuqS9oQ"/>
</div>
<nav class="hidden md:flex items-center gap-10">
<a class="font-headline font-bold text-sm tracking-tight text-[#0f4c81] border-b-2 border-[#006b5c] pb-1" href="#">Features</a>
<a class="font-headline font-medium text-sm tracking-tight text-slate-600 hover:text-[#0f4c81] transition-all" href="#">Solutions</a>
<a class="font-headline font-medium text-sm tracking-tight text-slate-600 hover:text-[#0f4c81] transition-all" href="#">Pricing</a>
</nav>
<div class="flex items-center gap-6">
<button class="font-headline font-medium text-sm text-[#0f4c81] hover:opacity-80 transition-opacity">Login</button>
<button class="btn-teal text-sm py-2.5 px-6 shadow-sm">Get Started</button>
</div>
</div>
</header>
<main class="pt-24">
<!-- Hero Section -->
<section class="max-w-7xl mx-auto px-8 py-24 md:py-36 grid lg:grid-cols-2 gap-20 items-center relative">
<div class="space-y-10 relative z-10">
<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-widest">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                The Future of HR
            </div>
<h1 class="text-6xl md:text-7xl font-extrabold font-headline leading-[1.05] text-primary tracking-tight">
                HR Reporting, <br/>
<span class="text-secondary">Refined</span> by AI
            </h1>
<p class="text-xl text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Turn raw data into strategic insights in seconds. Built for the modern enterprise to navigate workforce complexity with ease.
            </p>
<div class="flex flex-wrap gap-5 pt-6">
<button class="btn-teal text-lg px-10 py-4 flex items-center gap-2 shadow-lg shadow-[#006b5c]/15">
                    Get Started
                    <span class="material-symbols-outlined">arrow_forward</span>
</button>
<button class="btn-secondary text-lg px-10 py-4 flex items-center gap-2">
<span class="material-symbols-outlined">play_circle</span>
                    Watch Demo
                </button>
</div>
</div>
<div class="relative group">
<!-- Brand Badge -->
<div class="absolute -top-12 right-0 z-20 hidden md:block">
<div class="bg-white/80 backdrop-blur-md border border-outline-variant/20 px-4 py-2 rounded-full shadow-sm">
<p class="text-[10px] font-extrabold font-headline uppercase tracking-[0.2em] text-primary-container flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        HARP: HR AI Report Platform
                    </p>
</div>
</div>
<div class="absolute -inset-10 bg-gradient-to-tr from-primary-container/5 to-secondary/10 rounded-[3rem] blur-3xl group-hover:opacity-80 transition duration-700 opacity-40"></div>
<div class="relative rounded-2xl overflow-hidden group-hover:translate-y-[-8px] transition-transform duration-500">
<img alt="A high-end, isometric 3D illustration of a professional AI HR analytics platform interface" class="w-full h-auto object-cover scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEJADTV4Ngcd5-SnNFebdODWafWhS1XK74t7afuhrGXDlSUFG3YFavXARTLP5rxczo4BYXC-jgLuqoDqhzhcpOKaNURUZPVAarKrwyO2ZdA0yWl-_ME8Rbce0vusDHK8N30W0BkHzwsgC61_WtSud--qbBe5UZTJkq4o4mk1mzztLz06nbhhu0pmkkuDDniSrdeHJ_zoMyDTKU2n4jrDWaYNBvu16hcf_dM8cTMVQ7fGZWBhyN0aQQGO_oX-2tfnyy4lV49fPEEpc"/>
</div>
</div>
</section>
<!-- Trust Section -->
<section class="bg-surface-container-low py-20 border-y border-outline-variant/5">
<div class="max-w-7xl mx-auto px-8">
<p class="text-center text-xs font-bold uppercase tracking-[0.3em] text-outline/60 mb-16">Trusted by Global Leaders</p>
<div class="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
<div class="flex items-center gap-3 font-headline font-bold text-2xl text-on-surface">
<span class="material-symbols-outlined text-3xl">corporate_fare</span> NEXUS
                </div>
<div class="flex items-center gap-3 font-headline font-bold text-2xl text-on-surface">
<span class="material-symbols-outlined text-3xl">account_balance</span> VELOCITY
                </div>
<div class="flex items-center gap-3 font-headline font-bold text-2xl text-on-surface">
<span class="material-symbols-outlined text-3xl">change_history</span> PRISM
                </div>
<div class="flex items-center gap-3 font-headline font-bold text-2xl text-on-surface">
<span class="material-symbols-outlined text-3xl">token</span> ORBIT
                </div>
<div class="flex items-center gap-3 font-headline font-bold text-2xl text-on-surface">
<span class="material-symbols-outlined text-3xl">scatter_plot</span> LUMINA
                </div>
</div>
</div>
</section>
<!-- Features Grid -->
<section class="max-w-7xl mx-auto px-8 py-32">
<div class="text-center mb-24 space-y-6">
<h2 class="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">Intelligence in every byte</h2>
<p class="text-on-surface-variant max-w-2xl mx-auto text-xl leading-relaxed">HARP eliminates the manual toil of data extraction, allowing you to focus on what matters: your people.</p>
</div>
<div class="grid md:grid-cols-3 gap-8">
<!-- Card 1 -->
<div class="workspace-card group">
<div class="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-8 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">dataset</span>
</div>
<h3 class="text-xl font-bold font-headline mb-4 text-on-surface">Automated Synthesis</h3>
<p class="text-on-surface-variant leading-relaxed text-base">Instantly aggregate data from disparate HRIS, payroll, and LMS systems into a single, cohesive narrative.</p>
<div class="mt-10 flex items-center gap-2 text-secondary font-bold text-sm cursor-pointer hover:gap-3 transition-all">
                    Explore module <span class="material-symbols-outlined text-sm">chevron_right</span>
</div>
</div>
<!-- Card 2 -->
<div class="workspace-card group">
<div class="w-12 h-12 bg-secondary-container/30 rounded-lg flex items-center justify-center mb-8 text-secondary transition-all duration-300 group-hover:bg-secondary group-hover:text-white group-hover:scale-105">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">trending_up</span>
</div>
<h3 class="text-xl font-bold font-headline mb-4 text-on-surface">Predictive Retention</h3>
<p class="text-on-surface-variant leading-relaxed text-base">Identify flight risks before they happen with our neural flight-risk scoring, trained on industry-specific benchmarks.</p>
<div class="mt-10 flex items-center gap-2 text-secondary font-bold text-sm cursor-pointer hover:gap-3 transition-all">
                    View predictions <span class="material-symbols-outlined text-sm">chevron_right</span>
</div>
</div>
<!-- Card 3 -->
<div class="workspace-card group">
<div class="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-8 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">architecture</span>
</div>
<h3 class="text-xl font-bold font-headline mb-4 text-on-surface">Strategic Headcount Planning</h3>
<p class="text-on-surface-variant leading-relaxed text-base">Simulate hiring scenarios and budget impacts in real-time. Turn financial goals into workforce requirements.</p>
<div class="mt-10 flex items-center gap-2 text-secondary font-bold text-sm cursor-pointer hover:gap-3 transition-all">
                    Start planning <span class="material-symbols-outlined text-sm">chevron_right</span>
</div>
</div>
</div>
</section>
<!-- Asymmetric CTA Section -->
<section class="max-w-7xl mx-auto px-8 pb-32">
<div class="bg-primary rounded-[2rem] p-16 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16">
<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-transparent to-transparent opacity-40"></div>
<div class="relative z-10 max-w-xl text-center md:text-left">
<h2 class="text-5xl md:text-6xl font-extrabold font-headline text-white leading-tight mb-8">Ready to lead with data?</h2>
<p class="text-primary-fixed-dim text-xl leading-relaxed mb-12">Join over 500 enterprises transforming their human resources from a cost center to a strategic engine.</p>
<div class="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
<button class="btn-teal text-lg px-12 py-5 shadow-xl shadow-secondary/20">Start Free Trial</button>
<button class="px-12 py-5 font-bold text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all">Contact Sales</button>
</div>
</div>
<div class="relative z-10 hidden lg:block w-80">
<div class="p-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 rotate-3 shadow-2xl">
<div class="flex items-center gap-4 mb-6">
<div class="w-12 h-12 rounded-full bg-secondary"></div>
<div class="h-5 w-40 bg-white/20 rounded-full"></div>
</div>
<div class="space-y-3">
<div class="h-2.5 w-full bg-white/15 rounded-full"></div>
<div class="h-2.5 w-4/5 bg-white/15 rounded-full"></div>
<div class="h-2.5 w-5/6 bg-white/15 rounded-full"></div>
</div>
</div>
<div class="p-8 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 -rotate-6 mt-6 -ml-16 shadow-xl">
<div class="h-32 w-full bg-gradient-to-t from-secondary/40 to-transparent rounded-lg"></div>
</div>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-surface-container-low w-full border-t border-outline-variant/10 py-16">
<div class="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12">
<div class="flex flex-col gap-6">
<img alt="HARP Logo" class="h-10 w-auto object-contain self-start" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE9fqcdxzZAPNDTdiP4SKSvqkQdQ_gavCqWXk0fkk_j3_fZB6-Psx_Y1h4obNjZbSKySJlhF-p0cc7tvLJWl1z0tl-qCfwoCDpckkNRz44WgbHRUr0BD-ui3M3v-9CKKC_vGwo28QOHvdUKmG_93sGEUmM1p-NWew0Z4FJUGlIvwj3pm9BhURFZ9R4t5X59d4tG-YC1d3jEn1UsoJZnvSWvZEliYTn5_7ly7K1KWioWZ1XWysMLzlU7xaKoD9Lz85w7hFBYuqS9oQ"/>
<p class="font-body text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Empowering HR leaders with AI-driven insights to build the workforce of tomorrow.
            </p>
<p class="font-headline text-xs text-slate-500 font-medium tracking-wide uppercase">© 2024 HARP AI HR Platform. All rights reserved.</p>
</div>
<div class="flex flex-wrap gap-x-16 gap-y-8">
<div class="flex flex-col gap-4">
<span class="font-headline font-bold text-primary text-[11px] uppercase tracking-widest">Company</span>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">About Us</a>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Careers</a>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Contact</a>
</div>
<div class="flex flex-col gap-4">
<span class="font-headline font-bold text-primary text-[11px] uppercase tracking-widest">Product</span>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Features</a>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Security</a>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Enterprise</a>
</div>
<div class="flex flex-col gap-4">
<span class="font-headline font-bold text-primary text-[11px] uppercase tracking-widest">Legal</span>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Privacy Policy</a>
<a class="font-body text-sm text-slate-600 hover:text-secondary transition-all" href="#">Terms of Service</a>
</div>
</div>
<div class="flex gap-4">
<button class="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-outline-variant/10 text-primary shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
<span class="material-symbols-outlined text-lg">share</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-outline-variant/10 text-primary shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
<span class="material-symbols-outlined text-lg">mail</span>
</button>
</div>
</div>
</footer>
</body></html>

<!-- HARP Refined Landing: Isometric AI Concept -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>HARP - Template Selector</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Manrope:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface": "#ffffff",
              "on-error": "#ffffff",
              "on-tertiary": "#ffffff",
              "on-primary-fixed": "#001c37",
              "on-error-container": "#93000a",
              "outline": "#727780",
              "secondary-fixed": "#68fadd",
              "surface-variant": "#f0f2f4",
              "tertiary": "#293446",
              "primary": "#0F4C81",
              "inverse-primary": "#a0c9ff",
              "surface-container-high": "#f1f3f5",
              "tertiary-container": "#404b5e",
              "secondary-container": "#68fadd",
              "on-secondary-fixed": "#00201a",
              "tertiary-fixed": "#d8e3fa",
              "inverse-on-surface": "#eff1f3",
              "surface-bright": "#ffffff",
              "on-secondary-container": "#007261",
              "on-tertiary-fixed-variant": "#3c475a",
              "on-primary": "#ffffff",
              "inverse-surface": "#2d3133",
              "primary-fixed-dim": "#a0c9ff",
              "on-tertiary-container": "#b0bbd1",
              "on-secondary": "#ffffff",
              "surface-container-lowest": "#ffffff",
              "secondary-fixed-dim": "#44ddc1",
              "on-primary-fixed-variant": "#07497d",
              "secondary": "#006b5c",
              "error": "#ba1a1a",
              "on-background": "#191c1e",
              "surface-tint": "#0F4C81",
              "surface-dim": "#d8dadc",
              "tertiary-fixed-dim": "#bcc7dd",
              "on-primary-container": "#ffffff",
              "primary-fixed": "#d2e4ff",
              "background": "#ffffff",
              "surface-container": "#f8f9fa",
              "on-tertiary-fixed": "#111c2c",
              "on-surface": "#191c1e",
              "surface-container-low": "#ffffff",
              "error-container": "#ffdad6",
              "on-surface-variant": "#42474f",
              "surface-container-highest": "#e0e3e5",
              "primary-container": "#0F4C81",
              "outline-variant": "#e2e8f0",
              "on-secondary-fixed-variant": "#005145"
            },
            fontFamily: {
              "headline": ["Manrope", "sans-serif"],
              "body": ["Inter", "sans-serif"],
              "label": ["Inter", "sans-serif"]
            },
            borderRadius: {"DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .workspace-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .workspace-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -10px rgba(15, 76, 129, 0.15);
            border-color: #0F4C81;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface">
<!-- SideNavBar -->
<aside class="h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-900 flex flex-col py-6 px-4 z-50 border-r border-slate-200/60">
<div class="flex items-center gap-3 mb-10 px-2">
<div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
<span class="material-symbols-outlined" data-icon="blur_on">blur_on</span>
</div>
<div>
<h1 class="text-xl font-bold text-primary dark:text-blue-100 font-headline">HARP</h1>
<p class="text-[10px] font-semibold text-slate-500 tracking-wider">HR AI PLATFORM</p>
</div>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 hover:bg-white transition-colors duration-200 rounded-lg" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-sm font-semibold uppercase tracking-tight font-headline">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-primary dark:text-white font-semibold border-r-4 border-primary bg-white transition-all duration-150 rounded-l-lg" href="#">
<span class="material-symbols-outlined" data-icon="description">description</span>
<span class="text-sm uppercase tracking-tight font-headline">Templates</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white transition-colors duration-200 rounded-lg" href="#">
<span class="material-symbols-outlined" data-icon="history">history</span>
<span class="text-sm font-semibold uppercase tracking-tight font-headline">History</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white transition-colors duration-200 rounded-lg" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="text-sm font-semibold uppercase tracking-tight font-headline">Settings</span>
</a>
</nav>
<div class="mt-auto pt-6 border-t border-slate-200/50 space-y-1">
<button class="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-primary hover:bg-white transition-colors rounded-lg">
<span class="material-symbols-outlined" data-icon="help">help</span>
<span class="text-sm font-semibold uppercase tracking-tight font-headline">Support</span>
</button>
<button class="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-white transition-colors rounded-lg">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
<span class="text-sm font-semibold uppercase tracking-tight font-headline">Logout</span>
</button>
</div>
</aside>
<!-- TopAppBar -->
<header class="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/90 backdrop-blur-md flex justify-between items-center px-8 z-40 border-b border-slate-100">
<div class="flex items-center flex-1 max-w-xl">
<div class="relative w-full group">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input class="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Search templates..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="hover:bg-slate-100 rounded-full p-2 transition-all relative">
<span class="material-symbols-outlined text-slate-600" data-icon="notifications">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="hover:bg-slate-100 rounded-full p-2 transition-all">
<span class="material-symbols-outlined text-slate-600" data-icon="help_outline">help_outline</span>
</button>
<div class="h-8 w-[1px] bg-outline-variant mx-2"></div>
<div class="flex items-center gap-3">
<div class="text-right hidden sm:block">
<p class="text-xs font-bold text-on-surface">Alex Rivera</p>
<p class="text-[10px] text-on-surface-variant">HR Director</p>
</div>
<img alt="Alex Rivera" class="w-9 h-9 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1OO69NMYWIQ3J72I-tZopQPIidPCKXtsqUQnlocdQBFqNKp8MnqbCT0-rlynUjo0MRvXwAuzq-7BanmSjuDRC-0XevWR4SJNPL5REa62XY7kHP9rrw-xym6WPt7KwuK-8VHsB6DqrGfxS2deeyLuI64CkAeKGuhsRW1ZseLR3UFXvvf_lNNG6eBydWWzjk_J4lpRh3kTS7xjW2TnwV2oS-JkEThbazO7P8i3ek7qyCk9CF21S2fijaMAelcQuEQug9riG-xwmJvE"/>
</div>
</div>
</header>
<!-- Main Content Canvas -->
<main class="ml-64 pt-24 pb-12 px-8 min-h-screen bg-white">
<!-- Hero / Section Title -->
<div class="mb-10 flex justify-between items-end">
<div>
<h2 class="text-3xl font-bold font-headline tracking-tight text-primary">Template Selector</h2>
<p class="text-on-surface-variant mt-1">Choose a blueprint to generate your next AI-driven HR report.</p>
</div>
<button class="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
<span class="material-symbols-outlined text-lg" data-icon="add">add</span>
                Custom Template
            </button>
</div>
<!-- Empty State (Search Feedback) -->
<div class="hidden flex-col items-center justify-center py-20 bg-slate-50 rounded-xl mb-8 border-2 border-dashed border-outline-variant">
<div class="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 text-outline shadow-sm">
<span class="material-symbols-outlined text-3xl" data-icon="search_off">search_off</span>
</div>
<h3 class="text-xl font-semibold font-headline text-on-surface">No templates found</h3>
<p class="text-on-surface-variant mt-1 text-center max-w-sm">We couldn't find any templates matching your search criteria. Try adjusting your filters or search terms.</p>
<button class="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
</div>
<!-- Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
<!-- Template Card 1 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-secondary uppercase font-label px-2 py-1 bg-secondary-container/10 border border-secondary-container/20 rounded">Evaluation</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        5 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">Quarterly Performance Review</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Automated performance synthesis combining manager feedback, self-evaluations, and peer reviews into a cohesive narrative.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Key Metrics</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Growth Path</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">360 Feedback</span>
</div>
</div>
</article>
<!-- Template Card 2 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-primary uppercase font-label px-2 py-1 bg-primary/5 border border-primary/10 rounded">Reporting</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        3 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">DEI Impact Summary</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Visualize diversity, equity, and inclusion metrics across departments with AI-suggested improvement strategies.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Demographics</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Equity Index</span>
</div>
</div>
</article>
<!-- Template Card 3 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-secondary uppercase font-label px-2 py-1 bg-secondary-container/10 border border-secondary-container/20 rounded">Insights</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        8 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">Retention Risk Analysis</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Identify attrition patterns and high-risk clusters using predictive AI models based on engagement data.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Risk Heatmap</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Action Plan</span>
</div>
</div>
</article>
<!-- Template Card 4 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-primary uppercase font-label px-2 py-1 bg-primary/5 border border-primary/10 rounded">Reporting</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        4 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">Annual Workforce Planning</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Strategic foresight report for headcount budgeting, skills gap analysis, and upcoming recruitment requirements.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Skills Matrix</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Budgeting</span>
</div>
</div>
</article>
<!-- Template Card 5 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-secondary uppercase font-label px-2 py-1 bg-secondary-container/10 border border-secondary-container/20 rounded">Evaluation</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        10 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">Leadership Competency Profile</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Detailed assessment of executive-level soft skills, strategic alignment, and potential for upward mobility.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Leadership Traits</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Benchmarks</span>
</div>
</div>
</article>
<!-- Template Card 6 -->
<article class="workspace-card p-6 flex flex-col h-full group">
<div class="flex justify-between items-start mb-4">
<span class="text-[10px] font-bold tracking-widest text-primary uppercase font-label px-2 py-1 bg-primary/5 border border-primary/10 rounded">Operations</span>
<span class="text-[10px] font-bold text-on-surface-variant bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
                        2 min
                    </span>
</div>
<h3 class="text-lg font-bold font-headline mb-2 text-primary group-hover:text-primary/80 transition-colors">Onboarding Velocity Tracker</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
                    Measure time-to-productivity for new hires and identify bottlenecks in your operational workflows.
                </p>
<div class="pt-4 border-t border-slate-100">
<p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Sections Included</p>
<div class="flex flex-wrap gap-2">
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Cohort Stats</span>
<span class="text-[10px] text-on-tertiary-fixed-variant bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Bottleneck Map</span>
</div>
</div>
</article>
</div>
<!-- Pagination or Load More -->
<div class="mt-12 flex justify-center">
<button class="px-8 py-3 bg-white border border-slate-200 text-primary font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2">
                Show more templates
                <span class="material-symbols-outlined" data-icon="expand_more">expand_more</span>
</button>
</div>
</main>
<!-- Floating Action -->
<div class="fixed bottom-8 right-8 z-50">
<button class="w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-transform hover:scale-110">
<span class="material-symbols-outlined text-2xl" data-icon="auto_awesome">auto_awesome</span>
</button>
</div>
</body></html>

<!-- White Theme Template Selector -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>HARP - HR AI Platform Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface": "#FFFFFF",
                        "on-error": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "on-primary-fixed": "#001c37",
                        "on-error-container": "#93000a",
                        "outline": "#727780",
                        "secondary-fixed": "#68fadd",
                        "surface-variant": "#F8FAFC",
                        "tertiary": "#293446",
                        "primary": "#0F4C81",
                        "inverse-primary": "#a0c9ff",
                        "surface-container-high": "#f1f5f9",
                        "tertiary-container": "#404b5e",
                        "secondary-container": "#68fadd",
                        "on-secondary-fixed": "#00201a",
                        "tertiary-fixed": "#d8e3fa",
                        "inverse-on-surface": "#eff1f3",
                        "surface-bright": "#ffffff",
                        "on-secondary-container": "#007261",
                        "on-tertiary-fixed-variant": "#3c475a",
                        "on-primary": "#ffffff",
                        "inverse-surface": "#2d3133",
                        "primary-fixed-dim": "#a0c9ff",
                        "on-tertiary-container": "#b0bbd1",
                        "on-secondary": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed-dim": "#44ddc1",
                        "on-primary-fixed-variant": "#07497d",
                        "secondary": "#00BFA5",
                        "error": "#ba1a1a",
                        "on-background": "#191c1e",
                        "surface-tint": "#0F4C81",
                        "surface-dim": "#f1f5f9",
                        "tertiary-fixed-dim": "#bcc7dd",
                        "on-primary-container": "#8ebdf9",
                        "primary-fixed": "#d2e4ff",
                        "background": "#FFFFFF",
                        "surface-container": "#f8fafc",
                        "on-tertiary-fixed": "#111c2c",
                        "on-surface": "#1e293b",
                        "surface-container-low": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-surface-variant": "#64748b",
                        "surface-container-highest": "#e2e8f0",
                        "primary-container": "#0F4C81",
                        "outline-variant": "#e2e8f0",
                        "on-secondary-fixed-variant": "#005145"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    },
                    borderRadius: { "DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        body { font-family: 'Manrope', sans-serif; background-color: #FFFFFF; color: #1e293b; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .workspace-card { background-color: #ffffff; border-radius: 0.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05); }
        .workspace-card:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07); border-color: #e2e8f0; }
        .workspace-card-muted { background-color: #ffffff; border-radius: 0.5rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05); }
        .btn-primary { background: #0F4C81; color: white; }
        .badge-success { background-color: #e6fffa; color: #007261; border-radius: 9999px; padding: 2px 10px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }
        .badge-warning { background-color: #fff5f5; color: #93000a; border-radius: 9999px; padding: 2px 10px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }
        .logo-gradient-text { background: linear-gradient(135deg, #0F4C81, #00BFA5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="bg-surface text-on-surface">
<!-- SideNavBar Shell -->
<aside class="h-screen w-64 fixed left-0 top-0 bg-[#F8FAFC] border-r border-slate-200 flex flex-col py-8 px-5 z-50">
<div class="mb-12 px-2 flex items-center gap-3">
<img alt="HARP Logo" class="w-9 h-9 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE9fqcdxzZAPNDTdiP4SKSvqkQdQ_gavCqWXk0fkk_j3_fZB6-Psx_Y1h4obNjZbSKySJlhF-p0cc7tvLJWl1z0tl-qCfwoCDpckkNRz44WgbHRUr0BD-ui3M3v-9CKKC_vGwo28QOHvdUKmG_93sGEUmM1p-NWew0Z4FJUGlIvwj3pm9BhURFZ9R4t5X59d4tG-YC1d3jEn1UsoJZnvSWvZEliYTn5_7ly7K1KWioWZ1XWysMLzlU7xaKoD9Lz85w7hFBYuqS9oQ"/>
<div>
<h1 class="text-xl font-extrabold text-primary leading-none tracking-tight">HARP</h1>
<p class="text-[9px] font-bold text-secondary tracking-[0.2em] uppercase mt-1">AI HR Intelligence</p>
</div>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 text-primary font-bold border-r-4 border-primary bg-primary/5 transition-all duration-150" href="#">
<span class="material-symbols-outlined" data-icon="dashboard" style="font-variation-settings: 'FILL' 1;">grid_view</span>
<span class="font-headline text-xs tracking-wider uppercase">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="description">layers</span>
<span class="font-headline text-xs tracking-wider uppercase">Templates</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="history">hub</span>
<span class="font-headline text-xs tracking-wider uppercase">History</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings_suggest</span>
<span class="font-headline text-xs tracking-wider uppercase">Settings</span>
</a>
</nav>
<div class="mt-auto pt-8 border-t border-slate-200 space-y-1">
<button class="w-full mb-6 py-3 px-4 btn-primary rounded-lg font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
<span class="material-symbols-outlined text-sm">add_chart</span>
                Generate Report
            </button>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="help">help_center</span>
<span class="font-headline text-xs tracking-wider uppercase">Support</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="logout">power_settings_new</span>
<span class="font-headline text-xs tracking-wider uppercase">Logout</span>
</a>
</div>
</aside>
<!-- Main Content Area -->
<main class="ml-64 min-h-screen bg-white">
<!-- TopAppBar -->
<header class="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/95 backdrop-blur-md flex justify-between items-center h-20 px-10 border-b border-slate-100">
<div class="flex items-center bg-slate-50 rounded-lg px-4 py-2.5 w-[480px] group border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-all">
<span class="material-symbols-outlined text-slate-400 text-lg">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 ml-2" placeholder="Search analytics, candidates, or insights..." type="text"/>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-1">
<button class="hover:bg-slate-50 rounded-lg p-2.5 transition-all text-slate-500 relative">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
</button>
<button class="hover:bg-slate-50 rounded-lg p-2.5 transition-all text-slate-500">
<span class="material-symbols-outlined" data-icon="help_outline">contact_support</span>
</button>
</div>
<div class="h-8 w-[1px] bg-slate-200 mx-1"></div>
<div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 py-1.5 px-3 rounded-lg transition-all">
<div class="text-right hidden xl:block">
<p class="text-xs font-bold text-slate-900 leading-none">Alex Rivera</p>
<p class="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">HR Director</p>
</div>
<div class="relative">
<img alt="Alex Rivera" class="w-9 h-9 rounded-lg object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuxrjD-ALoD6RI8TEsTRqI2mAYhcJBMgqGS8bE8Qbs9BFRHQUjdUKdab_tQJI5w70bK2MMRQy-h2c9m34cw6VUcoep9tL4vMwfJz0DTYFneSFEEscvX2-gPuaoUAgR2TSwWR2ZbTeU5gWrhidhx2f4wNJ-4Oqjuvm-a35WZR2rfcMi4u4_3eUzyu38-Hv4ib5cQridtEMBal680tAe9ozsgYef1QWdD0ozeuyQpyIxQMn9ruza3sofOLJ7DxJsIg8FB_7JvWLbkLw"/>
<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary border-2 border-white rounded-full"></span>
</div>
</div>
</div>
</header>
<!-- Dashboard Canvas -->
<div class="pt-28 pb-16 px-10 max-w-7xl mx-auto">
<!-- Page Header -->
<div class="mb-12 flex justify-between items-end">
<div>
<div class="flex items-center gap-2 mb-2">
<span class="text-secondary font-bold text-[10px] uppercase tracking-[0.15em] bg-secondary/10 px-2.5 py-1 rounded">Trust Within Flow</span>
</div>
<h2 class="text-4xl font-extrabold font-headline text-slate-900 tracking-tight">Organization Overview</h2>
<p class="text-slate-500 mt-2 font-body text-base">Deep-dive workforce health analysis powered by HARP AI.</p>
</div>
<div class="flex gap-3">
<button class="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
<span class="material-symbols-outlined text-lg">calendar_month</span>
                        Last 7 Days
                    </button>
<button class="px-5 py-2.5 bg-secondary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-secondary/20">
<span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">insights</span>
                        Quick Analysis
                    </button>
</div>
</div>
<!-- Top Row: KPI Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
<!-- KPI 1 -->
<div class="workspace-card-muted p-7 flex flex-col justify-between min-h-[170px]">
<div class="flex justify-between items-start">
<span class="font-headline text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Retention Score</span>
<span class="material-symbols-outlined text-secondary opacity-80">analytics</span>
</div>
<div>
<div class="text-4xl font-extrabold text-primary font-headline mb-4 tracking-tight">94.2%</div>
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-secondary h-full rounded-full" style="width: 94%"></div>
</div>
<p class="text-[12px] text-secondary font-bold mt-3 flex items-center gap-1.5">
<span class="material-symbols-outlined text-base">trending_up</span> +2.4% vs prev. month
                        </p>
</div>
</div>
<!-- KPI 2 -->
<div class="workspace-card-muted p-7 flex flex-col justify-between min-h-[170px]">
<div class="flex justify-between items-start">
<span class="font-headline text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Active Reports</span>
<span class="material-symbols-outlined text-secondary opacity-80">data_exploration</span>
</div>
<div>
<div class="text-4xl font-extrabold text-primary font-headline mb-4 tracking-tight">128</div>
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-secondary h-full rounded-full" style="width: 65%"></div>
</div>
<p class="text-[11px] text-slate-500 font-bold mt-3 uppercase tracking-wider">65% of weekly goal</p>
</div>
</div>
<!-- KPI 3 -->
<div class="workspace-card-muted p-7 flex flex-col justify-between min-h-[170px]">
<div class="flex justify-between items-start">
<span class="font-headline text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">AI Insights</span>
<span class="material-symbols-outlined text-secondary opacity-80">psychology_alt</span>
</div>
<div>
<div class="text-4xl font-extrabold text-primary font-headline mb-4 tracking-tight">42</div>
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-secondary h-full rounded-full" style="width: 82%"></div>
</div>
<p class="text-[12px] text-secondary font-bold mt-3 flex items-center gap-1.5">
<span class="material-symbols-outlined text-base">auto_awesome</span> 8 critical alerts
                        </p>
</div>
</div>
<!-- KPI 4 -->
<div class="workspace-card-muted p-7 flex flex-col justify-between min-h-[170px]">
<div class="flex justify-between items-start">
<span class="font-headline text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Avg. Time to Hire</span>
<span class="material-symbols-outlined text-secondary opacity-80">speed</span>
</div>
<div>
<div class="text-4xl font-extrabold text-primary font-headline mb-4 tracking-tight">18d</div>
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-secondary h-full rounded-full" style="width: 40%"></div>
</div>
<p class="text-[12px] text-error font-bold mt-3 flex items-center gap-1.5">
<span class="material-symbols-outlined text-base">warning</span> 3 days slower vs Q3
                        </p>
</div>
</div>
</div>
<!-- Bento Content Area -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Main Activity Table -->
<div class="lg:col-span-2 workspace-card overflow-hidden bg-white">
<div class="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
<h3 class="font-headline font-bold text-slate-900 text-lg flex items-center gap-3">
<span class="material-symbols-outlined text-secondary text-2xl">format_list_bulleted</span>
                            Intelligence Stream
                        </h3>
<button class="text-secondary text-xs font-bold hover:text-primary transition-all uppercase tracking-[0.15em]">View All Records</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-slate-50/50">
<tr>
<th class="px-8 py-5 font-headline text-[11px] font-bold text-slate-500 uppercase tracking-widest">Analysis Record</th>
<th class="px-6 py-5 font-headline text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ownership</th>
<th class="px-8 py-5 font-headline text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Progress</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100">
<tr class="hover:bg-slate-50/50 transition-colors cursor-pointer group">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
<span class="material-symbols-outlined text-xl">description</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900">Q4 Talent Acquisition Flow</p>
<p class="text-[12px] text-slate-500 font-medium">AI-Vetting: 1.2k resumes analyzed</p>
</div>
</div>
</td>
<td class="px-6 py-6">
<div class="flex items-center gap-2.5">
<img alt="Sarah Chen" class="w-7 h-7 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBp0TvnCV3zWxlZTboKPhPQrOyaXO2pESFRs01INkBxB3nQ6QtJF-EgtF8yv3VeoCsFOEbUph0NMXQdNL9TCuu_UgTKeJMu8u1XGuOSojqyme7_6oWxBPV-N7Q8e8q_1HntMTvEnU0IzINQLuDIAAcnqKPQDcJyoX736Ml9zK-HW_Ii_ZoqGqZlxwKod4xSwTf63jFmbN48Ta5pq_n7GtuI4DO8fLAn00x6Ia-Y-OCgQ60vE370CBrgLTR5nnkkSQhNlFKQgM4b1s"/>
<span class="text-xs font-bold text-slate-700">Sarah Chen</span>
</div>
</td>
<td class="px-8 py-6 text-right">
<span class="badge-success">Verified</span>
</td>
</tr>
<tr class="hover:bg-slate-50/50 transition-colors cursor-pointer group">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
<span class="material-symbols-outlined text-xl">monitoring</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900">Burnout Risk Prediction</p>
<p class="text-[12px] text-slate-500 font-medium">Sentiment analysis active</p>
</div>
</div>
</td>
<td class="px-6 py-6">
<div class="flex items-center gap-2.5">
<img alt="Marcus Wright" class="w-7 h-7 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACjwxQaI2UmekEF7PTw1p1pONB6tfZSmN7ExOAwRjFCO156rhwMi1xg67qvXhVHvca1pafDdtghofocTv1TrvTQ3B8wDLfNyUk_QFZVbT-dz-uoqbFmFUtvh_UEc9dFaz0UtTVDW9o5DaYVmep1qj1KjWY4MTWrBn7ye5modJ40u_anKvMZfU1gWKlBJCyeRs7tR-p6lIt_5E3O-QzlWjXsqu81Y49auOlekom3IianGxdsjBoWWaz_G17E5jaICzbLVoCqwXpSXg"/>
<span class="text-xs font-bold text-slate-700">Marcus Wright</span>
</div>
</td>
<td class="px-8 py-6 text-right">
<span class="badge-warning">Processing</span>
</td>
</tr>
<tr class="hover:bg-slate-50/50 transition-colors cursor-pointer group">
<td class="px-8 py-6">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
<span class="material-symbols-outlined text-xl">diversity_3</span>
</div>
<div>
<p class="text-sm font-bold text-slate-900">DEI Benchmarking Audit</p>
<p class="text-[12px] text-slate-500 font-medium">Industry peer comparison 2024</p>
</div>
</div>
</td>
<td class="px-6 py-6">
<div class="flex items-center gap-2.5">
<img alt="Elena Petrova" class="w-7 h-7 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5GECR8hTv1-arDYur4ftYmZ8Zc8zVKY_-Hz-6aoNGglH1bLB5Wv2XOdVsXdm5n0Fv92hvYpxdxiU69l22CDQ1YYN7YrJBTSKmvMBFmZad5akORG0U-lPyKos3U_NWvW3Sa60BKr52Spy70PlyMH3pmDaQ5M8Ruy-hGjBRcCkW01aGrqqx3j46E9YaA7juHcr4tbxc0d5r6LwMWNDgCq8Ze4SQT9KM2GVK81WtUtB5RtXTsS7J8-MsPxiD44vcP7_Fpa-I12J_TgI"/>
<span class="text-xs font-bold text-slate-700">Elena Petrova</span>
</div>
</td>
<td class="px-8 py-6 text-right">
<span class="badge-success">Verified</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Insight Section -->
<div class="space-y-8">
<div class="workspace-card p-8 bg-primary text-white border-none shadow-xl shadow-primary/30 relative overflow-hidden">
<div class="absolute -right-12 -top-12 w-48 h-48 bg-secondary opacity-20 rounded-full blur-3xl"></div>
<div class="flex justify-between items-start mb-8 relative z-10">
<h3 class="font-headline font-bold text-white flex items-center gap-3">
<span class="material-symbols-outlined text-secondary">auto_awesome</span>
                                AI Insight Peak
                            </h3>
</div>
<p class="text-slate-100 text-base leading-relaxed mb-10 relative z-10 font-medium italic">
                            "Sales Engineering shows a 15% uptick in turnover risk due to competitive poaching. Recommend reviewing retention bonuses for senior roles."
                        </p>
<button class="w-full py-4 bg-secondary text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all shadow-lg shadow-black/10 relative z-10">
                            Explore Risk Heatmap
                        </button>
</div>
<div class="workspace-card p-8 border-slate-100 bg-white">
<h3 class="font-headline font-bold text-slate-900 mb-8 flex items-center gap-3">
<span class="material-symbols-outlined text-secondary">signal_cellular_alt</span>
                            Weekly Pipeline
                        </h3>
<div class="space-y-8">
<div>
<div class="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
<span>Screening</span>
<span class="text-primary">82%</span>
</div>
<div class="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
<div class="bg-secondary h-full" style="width: 82%"></div>
</div>
</div>
<div>
<div class="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
<span>Interviews</span>
<span class="text-primary">45%</span>
</div>
<div class="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
<div class="bg-secondary h-full" style="width: 45%"></div>
</div>
</div>
<div>
<div class="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
<span>Offer Prep</span>
<span class="text-primary">20%</span>
</div>
<div class="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
<div class="bg-secondary h-full" style="width: 20%"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>

<!-- White Theme Dashboard -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface": "#ffffff",
                        "on-error": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "on-primary-fixed": "#001c37",
                        "on-error-container": "#93000a",
                        "outline": "#727780",
                        "secondary-fixed": "#68fadd",
                        "surface-variant": "#f1f3f5",
                        "tertiary": "#293446",
                        "primary": "#0F4C81",
                        "inverse-primary": "#a0c9ff",
                        "surface-container-high": "#f8f9fa",
                        "tertiary-container": "#404b5e",
                        "secondary-container": "#68fadd",
                        "on-secondary-fixed": "#00201a",
                        "tertiary-fixed": "#d8e3fa",
                        "inverse-on-surface": "#eff1f3",
                        "surface-bright": "#ffffff",
                        "on-secondary-container": "#007261",
                        "on-tertiary-fixed-variant": "#3c475a",
                        "on-primary": "#ffffff",
                        "inverse-surface": "#2d3133",
                        "primary-fixed-dim": "#a0c9ff",
                        "on-tertiary-container": "#b0bbd1",
                        "on-secondary": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed-dim": "#44ddc1",
                        "on-primary-fixed-variant": "#07497d",
                        "secondary": "#006b5c",
                        "error": "#ba1a1a",
                        "on-background": "#191c1e",
                        "surface-tint": "#0F4C81",
                        "surface-dim": "#f1f3f5",
                        "tertiary-fixed-dim": "#bcc7dd",
                        "on-primary-container": "#ffffff",
                        "primary-fixed": "#d2e4ff",
                        "background": "#ffffff",
                        "surface-container": "#f8f9fa",
                        "on-tertiary-fixed": "#111c2c",
                        "on-surface": "#191c1e",
                        "surface-container-low": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-surface-variant": "#42474f",
                        "surface-container-highest": "#f1f3f5",
                        "primary-container": "#0F4C81",
                        "outline-variant": "#c2c7d1",
                        "on-secondary-fixed-variant": "#005145"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    },
                    borderRadius: { "DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.5rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        body { font-family: 'Manrope', sans-serif; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .input-surface {
            @apply bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 py-3 px-4 text-on-surface text-sm;
        }
        .btn-primary {
            @apply bg-primary text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:opacity-90 transition-all;
        }
        .workspace-card {
            @apply bg-white border border-slate-100 rounded-lg transition-all duration-300;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-surface text-on-surface min-h-screen">
<!-- SideNavBar -->
<aside class="h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-100 flex flex-col py-6 px-4">
<div class="mb-10 px-2 flex items-center gap-3">
<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
<span class="text-white font-bold text-xl">H</span>
</div>
<div>
<h1 class="text-xl font-bold text-primary">HARP</h1>
<p class="text-[10px] font-semibold text-slate-500 tracking-wider">HR AI PLATFORM</p>
</div>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-xl" data-icon="dashboard">dashboard</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-xl" data-icon="description">description</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">Templates</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-xl" data-icon="history">history</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">History</span>
</a>
<!-- Active State Navigation: Settings -->
<a class="flex items-center gap-3 px-4 py-3 text-primary font-semibold border-r-4 border-primary bg-white transition-all duration-150" href="#">
<span class="material-symbols-outlined text-xl" data-icon="settings">settings</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">Settings</span>
</a>
</nav>
<div class="mt-auto space-y-1 border-t border-slate-200 pt-4">
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-xl" data-icon="help">help</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">Support</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200" href="#">
<span class="material-symbols-outlined text-xl" data-icon="logout">logout</span>
<span class="font-headline text-xs font-semibold uppercase tracking-wider">Logout</span>
</a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="ml-64 min-h-screen flex flex-col">
<!-- TopAppBar -->
<header class="sticky top-0 right-0 z-40 bg-white/90 backdrop-blur-md flex justify-between items-center h-16 px-8 border-b border-slate-100">
<div class="flex items-center flex-1 max-w-md">
<div class="relative w-full">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" data-icon="search">search</span>
<input class="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search analytics or reports..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="hover:bg-slate-50 rounded-lg p-2 transition-all relative">
<span class="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="hover:bg-slate-50 rounded-lg p-2 transition-all">
<span class="material-symbols-outlined text-primary" data-icon="help_outline">help_outline</span>
</button>
<div class="h-8 w-[1px] bg-slate-100 mx-2"></div>
<div class="flex items-center gap-3">
<div class="text-right hidden sm:block">
<p class="text-xs font-bold text-on-surface">Alex Rivera</p>
<p class="text-[10px] text-slate-500">Sr. HR Director</p>
</div>
<img alt="User Profile" class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2th5wzV76EjxUkgoXBKuDL2Yz1xAeYemc20jkbb19_4Cjs36kkuo5iNs4i-njsa7zm_wdixdWG4_VJLeNePJN84C-Yb0Nfh3-vOhe1HegYRpJmrP23rdWXNcCCgKD4ylqT421MrMACepoXJjzVOBWN0TOz3i6ZFt5EGORN9B_Sn9-uUB2Xv8b3GT_yjeNU7vmtShj3M_qQ72Cev48q5fzvNxjJTl_uWF7uZxs2f40KVyXwJRtWy3N3SNEn9tGM4CpnlgSutbPavM"/>
</div>
</div>
</header>
<!-- Settings Content -->
<div class="p-10 max-w-6xl mx-auto w-full flex-1">
<div class="mb-10">
<h2 class="text-3xl font-headline font-bold text-on-surface tracking-tight">System Settings</h2>
<p class="text-slate-500 mt-2">Manage your professional identity and workspace preferences across the HARP ecosystem.</p>
</div>
<div class="grid grid-cols-12 gap-10">
<!-- Left Sidebar Menu -->
<nav class="col-span-12 md:col-span-3 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-lg text-primary font-bold" href="#">
<span class="material-symbols-outlined text-xl" data-icon="person">person</span>
<span class="text-sm">Personal info</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 transition-all" href="#">
<span class="material-symbols-outlined text-xl" data-icon="hub">hub</span>
<span class="text-sm">Workspace</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 transition-all" href="#">
<span class="material-symbols-outlined text-xl" data-icon="tune">tune</span>
<span class="text-sm">Preferences</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 transition-all" href="#">
<span class="material-symbols-outlined text-xl" data-icon="security">security</span>
<span class="text-sm">Security</span>
</a>
</nav>
<!-- Right Main Form Area -->
<div class="col-span-12 md:col-span-9 space-y-8">
<!-- Account Info Section -->
<section class="workspace-card p-8">
<div class="flex items-center gap-3 mb-8">
<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-xl" data-icon="badge">badge</span>
</div>
<h3 class="text-lg font-headline font-bold text-on-surface">Account Info</h3>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="flex flex-col gap-2">
<label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
<input class="input-surface" type="text" value="Alex Rivera"/>
</div>
<div class="flex flex-col gap-2">
<label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Work Email</label>
<input class="input-surface" type="email" value="a.rivera@globalcorp.ai"/>
</div>
<div class="flex flex-col gap-2">
<label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Employee ID</label>
<input class="input-surface bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" readonly="" type="text" value="EMP-99201"/>
<p class="text-[10px] text-slate-400 px-1 italic">Read-only system identifier</p>
</div>
<div class="flex flex-col gap-2">
<label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Knox ID</label>
<input class="input-surface bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" readonly="" type="text" value="KNOX_4491_B"/>
<p class="text-[10px] text-slate-400 px-1 italic">Provisioned by IT Administration</p>
</div>
</div>
</section>
<!-- Preferences Section -->
<section class="workspace-card p-8">
<div class="flex items-center gap-3 mb-8">
<div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-secondary text-xl" data-icon="settings_suggest">settings_suggest</span>
</div>
<h3 class="text-lg font-headline font-bold text-on-surface">Preferences</h3>
</div>
<div class="space-y-8">
<div class="flex flex-col gap-2 max-w-md">
<label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Default Template</label>
<div class="relative">
<select class="input-surface w-full appearance-none cursor-pointer pr-10">
<option>Quarterly Performance Summary</option>
<option>Recruitment Velocity Report</option>
<option>Equity &amp; Inclusion Audit</option>
<option>Attrition Predictive Analytics</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" data-icon="expand_more">expand_more</span>
</div>
</div>
<div class="pt-4 space-y-6">
<div class="flex items-center justify-between">
<div>
<h4 class="font-semibold text-on-surface">Email Report Digests</h4>
<p class="text-xs text-slate-500">Receive a weekly summary of AI-generated insights.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<div class="flex items-center justify-between">
<div>
<h4 class="font-semibold text-on-surface">Critical Anomaly Alerts</h4>
<p class="text-xs text-slate-500">Push notifications for significant shifts in workforce data.</p>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
</div>
</div>
</section>
</div>
</div>
</div>
<!-- Fixed Footer Actions -->
<footer class="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-8 py-5 flex items-center justify-between z-50">
<div class="flex items-center gap-2 text-slate-400">
<span class="material-symbols-outlined text-sm" data-icon="info">info</span>
<span class="text-[11px] font-medium">Last change saved 4 hours ago</span>
</div>
<div class="flex items-center gap-4">
<button class="px-5 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
<button class="btn-primary flex items-center gap-2 text-sm">
<span class="material-symbols-outlined text-lg" data-icon="save">save</span>
                    Save Changes
                </button>
</div>
</footer>
</main>
</body></html>

<!-- White Theme Settings Panel -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>HARP - Data Extractor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface": "#ffffff",
                        "on-error": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "on-primary-fixed": "#001c37",
                        "on-error-container": "#93000a",
                        "outline": "#727780",
                        "secondary-fixed": "#68fadd",
                        "surface-variant": "#f1f3f4",
                        "tertiary": "#293446",
                        "primary": "#0F4C81",
                        "inverse-primary": "#a0c9ff",
                        "surface-container-high": "#f8f9fa",
                        "tertiary-container": "#404b5e",
                        "secondary-container": "#68fadd",
                        "on-secondary-fixed": "#00201a",
                        "tertiary-fixed": "#d8e3fa",
                        "inverse-on-surface": "#eff1f3",
                        "surface-bright": "#ffffff",
                        "on-secondary-container": "#007261",
                        "on-tertiary-fixed-variant": "#3c475a",
                        "on-primary": "#ffffff",
                        "inverse-surface": "#2d3133",
                        "primary-fixed-dim": "#a0c9ff",
                        "on-tertiary-container": "#b0bbd1",
                        "on-secondary": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed-dim": "#44ddc1",
                        "on-primary-fixed-variant": "#07497d",
                        "secondary": "#006b5c",
                        "error": "#ba1a1a",
                        "on-background": "#191c1e",
                        "surface-tint": "#0F4C81",
                        "surface-dim": "#f8f9fa",
                        "tertiary-fixed-dim": "#bcc7dd",
                        "on-primary-container": "#8ebdf9",
                        "primary-fixed": "#d2e4ff",
                        "background": "#ffffff",
                        "surface-container": "#f1f3f4",
                        "on-tertiary-fixed": "#111c2c",
                        "on-surface": "#191c1e",
                        "surface-container-low": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-surface-variant": "#42474f",
                        "surface-container-highest": "#e0e3e5",
                        "primary-container": "#0F4C81",
                        "outline-variant": "#e0e3e5",
                        "on-secondary-fixed-variant": "#005145"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "0.5rem", "lg": "0.5rem", "xl": "0.5rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .btn-primary-gradient {
            background: #0F4C81;
        }
        .sidebar-border {
            border-right: 1px solid #f1f3f4;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface">
<!-- SideNavBar (Shared Component) -->
<aside class="h-screen w-64 fixed left-0 top-0 bg-white sidebar-border flex flex-col py-6 px-4 z-50">
<div class="mb-10 px-2 flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">analytics</span>
</div>
<div>
<h1 class="text-xl font-bold text-primary font-headline tracking-tight">HARP</h1>
<p class="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">HR AI Platform</p>
</div>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors duration-200" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-semibold text-[13px] uppercase tracking-wider">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-semibold border-r-4 border-primary bg-slate-50 transition-all duration-150" href="#">
<span class="material-symbols-outlined">description</span>
<span class="font-semibold text-[13px] uppercase tracking-wider">Templates</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors duration-200" href="#">
<span class="material-symbols-outlined">history</span>
<span class="font-semibold text-[13px] uppercase tracking-wider">History</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors duration-200" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-semibold text-[13px] uppercase tracking-wider">Settings</span>
</a>
</nav>
<div class="mt-auto space-y-6">
<button class="w-full py-3 px-4 btn-primary-gradient text-white rounded-lg font-headline font-bold text-sm shadow-sm hover:opacity-90 transition-all">
                Generate Report
            </button>
<div class="space-y-1 border-t border-slate-100 pt-4">
<a class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined text-xl">help</span>
<span class="font-semibold text-xs uppercase tracking-wider">Support</span>
</a>
<a class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined text-xl">logout</span>
<span class="font-semibold text-xs uppercase tracking-wider">Logout</span>
</a>
</div>
</div>
</aside>
<!-- TopAppBar (Shared Component) -->
<header class="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white border-b border-slate-100 flex justify-between items-center h-16 px-8">
<div class="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg w-96 transition-all focus-within:ring-2 focus-within:ring-primary/20">
<span class="material-symbols-outlined text-slate-400">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400" placeholder="Search insights..." type="text"/>
</div>
<div class="flex items-center gap-4">
<button class="hover:bg-slate-50 rounded-full p-2 transition-all relative">
<span class="material-symbols-outlined text-slate-600">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
</button>
<button class="hover:bg-slate-50 rounded-full p-2 transition-all">
<span class="material-symbols-outlined text-slate-600">help_outline</span>
</button>
<div class="h-8 w-[1px] bg-slate-100 mx-2"></div>
<div class="flex items-center gap-3 pl-2">
<img alt="User Profile" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBidUBDeqgsUKZW_7PMwVJurG5uCAD8NnkBU5SPdPKv2jfDgse1FBi9OSA8_3NbxACMr4_t-d2-kVoEvV-8FnuSnqZGulR0hm962YLZr1hPAfFzEquWnnWeYRkXG1e8EKU7zYKZJKLofId9yPmPLLvH0k0sYlPLA5J7UgSNDWkqCNF5heCSkEkCSKgpPxY5HIqvjC2Dv3lhucGb8prneIISJXcufoQ_FSCO9mbSW1hLjWov83udDo8LiRyn-Ny8TpjzA1tNgTE3Iw"/>
<div class="hidden lg:block text-left">
<p class="text-xs font-bold text-primary font-headline leading-tight">Marcus Chen</p>
<p class="text-[10px] text-slate-500 font-medium">Lead Strategist</p>
</div>
</div>
</div>
</header>
<!-- Main Content Area -->
<main class="ml-64 pt-24 p-8 min-h-screen bg-white">
<div class="max-w-7xl mx-auto space-y-8">
<!-- Context Header -->
<div class="flex justify-between items-end">
<div>
<span class="label-sm font-semibold text-secondary uppercase tracking-widest mb-2 block">AI Workspace</span>
<h2 class="text-3xl font-headline font-bold text-on-surface leading-tight">Data Extractor</h2>
<p class="text-on-surface-variant max-w-xl mt-2">Convert raw unstructured survey data or bulk CSV exports into verified HR metrics using HARP's proprietary LLM processing.</p>
</div>
<div class="flex gap-4">
<button class="px-5 py-2.5 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-slate-50 transition-all">Cancel</button>
<button class="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:opacity-90 transition-all">
<span class="material-symbols-outlined text-sm">cloud_upload</span>
                        Save Results
                    </button>
</div>
</div>
<!-- Bento Layout Workspace -->
<div class="grid grid-cols-12 gap-8 items-stretch">
<!-- Left: Raw Input Area -->
<div class="col-span-12 lg:col-span-5 flex flex-col gap-4">
<div class="flex items-center justify-between px-2">
<h3 class="text-base font-headline font-semibold flex items-center gap-2">
<span class="material-symbols-outlined text-primary">raw_on</span>
                            Raw Source Data
                        </h3>
<span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">MAX 50,000 CHARS</span>
</div>
<div class="flex-1 bg-white border border-slate-200 rounded-lg p-1 group focus-within:ring-2 focus-within:ring-primary/10 transition-all">
<textarea class="w-full h-[500px] bg-white rounded-lg border-none focus:ring-0 p-6 font-mono text-sm text-slate-600 placeholder:text-slate-300 resize-none" placeholder="Paste raw CSV data or survey response text here...

Example:
Q1: How likely are you to recommend? Response: 9/10...
Q2: Satisfaction with management? Response: Extremely satisfied..."></textarea>
</div>
</div>
<!-- Center: Action Bridge -->
<div class="col-span-12 lg:col-span-2 flex flex-col items-center justify-center gap-6 relative">
<div class="hidden lg:block absolute h-full w-[1px] bg-slate-100"></div>
<button class="z-10 bg-white border border-slate-200 text-secondary hover:text-white hover:bg-secondary w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group">
<span class="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
<div class="z-10 px-4 py-2 bg-secondary/5 rounded-full border border-secondary/10">
<p class="text-[11px] font-bold text-secondary uppercase tracking-widest text-center">Analyze Pattern</p>
</div>
</div>
<!-- Right: Output & Result Panel -->
<div class="col-span-12 lg:col-span-5 flex flex-col gap-4">
<div class="flex items-center justify-between px-2">
<h3 class="text-base font-headline font-semibold flex items-center gap-2 text-secondary">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                            Extracted Insights
                        </h3>
<div class="flex gap-2">
<span class="px-2 py-0.5 rounded-full bg-secondary/10 text-[10px] font-bold text-secondary uppercase tracking-tight">AI Active</span>
<span class="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight">Confidence: 98%</span>
</div>
</div>
<!-- Result Container with clear distinction -->
<div class="space-y-4 p-6 bg-slate-50/50 rounded-lg border border-slate-100">
<!-- Result Card 1 -->
<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-all group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span class="material-symbols-outlined">groups</span>
</div>
<div>
<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Participation Rate</p>
<p class="text-2xl font-bold text-on-surface font-headline">92%</p>
</div>
</div>
<div class="text-right">
<span class="material-symbols-outlined text-secondary text-sm">check_circle</span>
<p class="text-[10px] text-slate-400 mt-1">N=452</p>
</div>
</div>
<!-- Result Card 2 -->
<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-all group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span class="material-symbols-outlined">sentiment_satisfied</span>
</div>
<div>
<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg. Satisfaction</p>
<p class="text-2xl font-bold text-on-surface font-headline">4.6<span class="text-sm font-medium text-slate-400 ml-1">/ 5.0</span></p>
</div>
</div>
<div class="text-right">
<span class="material-symbols-outlined text-secondary text-sm">check_circle</span>
<p class="text-[10px] text-slate-400 mt-1">+0.4 vs LW</p>
</div>
</div>
<!-- Skeleton UI - Processing state -->
<div class="bg-white border border-slate-100 rounded-lg p-5 animate-pulse space-y-4">
<div class="flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-lg bg-slate-100"></div>
<div class="space-y-2">
<div class="h-2 w-24 bg-slate-100 rounded-full"></div>
<div class="h-4 w-16 bg-slate-100 rounded-full"></div>
</div>
</div>
<div class="w-10 h-3 bg-slate-100 rounded-full"></div>
</div>
<div class="w-full h-[1px] bg-slate-50"></div>
<div class="flex justify-between items-center text-[10px] font-medium text-slate-300 uppercase italic">
<span>Scanning for sentiment patterns...</span>
<span class="material-symbols-outlined text-sm">sync</span>
</div>
</div>
<!-- Empty Placeholder -->
<div class="relative h-24 rounded-lg overflow-hidden group border border-dashed border-slate-200">
<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
<span class="material-symbols-outlined text-slate-300 mb-1">pending</span>
<p class="text-[11px] font-medium text-slate-400 italic">Remaining keys will appear here as extraction completes</p>
</div>
</div>
</div>
</div>
</div>
<!-- Contextual Insight Footer -->
<div class="bg-primary text-white p-8 rounded-lg flex items-center justify-between overflow-hidden relative">
<div class="z-10">
<h4 class="font-headline font-bold text-lg mb-1">HARP AI Suggestion</h4>
<p class="text-primary-fixed-dim text-sm max-w-xl opacity-90">We detected a significant correlation between "Flexible Work" mentions and high satisfaction scores. Would you like to create a specific cross-tab analysis?</p>
</div>
<button class="z-10 px-6 py-2.5 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-lg text-sm hover:scale-105 transition-transform flex items-center gap-2">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">insights</span>
                    Generate Correlation
                </button>
<!-- Aesthetic Background Element -->
<div class="absolute top-0 right-0 h-full w-1/3 bg-white/5 flex items-center justify-end pr-8">
<span class="material-symbols-outlined text-8xl opacity-10">trending_up</span>
</div>
</div>
</div>
</main>
</body></html>