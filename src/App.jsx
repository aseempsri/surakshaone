import { useEffect, useMemo, useState } from 'react'
import homeSource from '../surakhas one index.txt?raw'
import howSource from '../How it works.txt?raw'
import protectionSource from '../Protection.txt?raw'
import employersSource from '../for exployers.txt?raw'

const pages = {
  '/': homeSource,
  '/index.html': homeSource,
  '/how-it-works': howSource,
  '/how-it-works.html': howSource,
  '/protection': protectionSource,
  '/protection.html': protectionSource,
  '/employers': employersSource,
  '/employers.html': employersSource,
}

const BASE_URL = import.meta.env.BASE_URL
const LOGO_SRC = `${BASE_URL}logo.png`
const LOGO_MARK_SRC = `${BASE_URL}logo-mark.png`
const FAVICON_SRC = `${BASE_URL}fav.png`
const WHATSAPP_NUMBER = '919235777101'
const APP_STORE_URL = '' // e.g. https://apps.apple.com/app/idXXXXXXXX
const PLAY_STORE_URL = '' // e.g. https://play.google.com/store/apps/details?id=...

function stripBase(pathname) {
  const base = BASE_URL.replace(/\/$/, '')
  if (base && pathname.startsWith(base)) {
    const rest = pathname.slice(base.length)
    return rest ? (rest.startsWith('/') ? rest : `/${rest}`) : '/'
  }
  return pathname || '/'
}

function withBase(path) {
  const normalised = path.startsWith('/') ? path : `/${path}`
  if (normalised === '/') return BASE_URL
  return `${BASE_URL.replace(/\/$/, '')}${normalised}`
}

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function openWhatsApp(message) {
  window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
}

function normaliseMarkup(markup) {
  return markup
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replaceAll('href="index.html', `href="${BASE_URL}`)
    .replaceAll('href="how-it-works.html', `href="${withBase('/how-it-works')}`)
    .replaceAll('href="protection.html', `href="${withBase('/protection')}`)
    .replaceAll('href="employers.html', `href="${withBase('/employers')}`)
}

function rebaseImageAssets(markup) {
  const base = BASE_URL.replace(/\/$/, '')
  return markup.replaceAll('/images/', `${base}/images/`)
}

function parsePage(source) {
  const parsed = new DOMParser().parseFromString(source, 'text/html')
  parsed.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || ''
    if (img.closest('.core')) {
      img.setAttribute('src', LOGO_MARK_SRC)
      img.setAttribute('alt', 'SurakshaOne')
      return
    }
    if (src.startsWith('data:image') || img.closest('.brand, .fbrand')) {
      img.setAttribute('src', LOGO_SRC)
      img.setAttribute('alt', 'SurakshaOne')
    }
  })
  return {
    title: parsed.title,
    description:
      parsed.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    styles: rebaseImageAssets(
      [...parsed.querySelectorAll('style')].map((node) => node.textContent).join('\n'),
    ),
    body: rebaseImageAssets(normaliseMarkup(parsed.body.innerHTML)),
  }
}

function addListener(target, event, callback, options, cleanups) {
  if (!target) return
  target.addEventListener(event, callback, options)
  cleanups.push(() => target.removeEventListener(event, callback, options))
}

function setupInteractions(root) {
  const cleanups = []
  const observers = []
  const q = (selector) => root.querySelector(selector)
  const qa = (selector) => [...root.querySelectorAll(selector)]

  const navToggle = q('#navToggle')
  const navLinks = q('#navLinks')
  const dropdown = q('#ddProt')

  addListener(
    navToggle,
    'click',
    () => {
      const open = navLinks?.classList.toggle('open') ?? false
      navToggle.setAttribute('aria-expanded', String(open))
    },
    undefined,
    cleanups,
  )

  qa('#navLinks a').forEach((link) => {
    addListener(
      link,
      'click',
      () => {
        if (dropdown && link.parentElement === dropdown && window.innerWidth <= 960) return
        navLinks?.classList.remove('open')
        navToggle?.setAttribute('aria-expanded', 'false')
        dropdown?.classList.remove('open')
      },
      undefined,
      cleanups,
    )
  })

  const dropdownLink = dropdown?.querySelector(':scope > a')
  addListener(
    dropdownLink,
    'click',
    (event) => {
      if (window.innerWidth <= 960) {
        event.preventDefault()
        dropdown.classList.toggle('open')
      }
    },
    undefined,
    cleanups,
  )

  qa('.stab').forEach((tab) => {
    addListener(
      tab,
      'click',
      () => {
        qa('.stab').forEach((item) => item.setAttribute('aria-selected', 'false'))
        tab.setAttribute('aria-selected', 'true')
        qa('.spanel').forEach((panel) => panel.classList.remove('active'))
        q(`#s-${tab.dataset.s}`)?.classList.add('active')
      },
      undefined,
      cleanups,
    )
  })

  qa('.fq').forEach((question) => {
    addListener(
      question,
      'click',
      () => {
        const item = question.parentElement
        const wasOpen = item.classList.contains('open')
        qa('.fitem').forEach((faq) => faq.classList.remove('open'))
        if (!wasOpen) item.classList.add('open')
      },
      undefined,
      cleanups,
    )
  })

  const annual = q('#tgAnnual')
  const monthly = q('#tgMonthly')
  const setBilling = (isAnnual) => {
    annual?.classList.toggle('on', isAnnual)
    monthly?.classList.toggle('on', !isAnnual)
    qa('.plan .amt,.plan .per').forEach((element) => {
      element.textContent = isAnnual ? element.dataset.a : element.dataset.m
    })
  }
  addListener(annual, 'click', () => setBilling(true), undefined, cleanups)
  addListener(monthly, 'click', () => setBilling(false), undefined, cleanups)

  const partnerForm = q('#pForm')
  const partnerMessage = q('#pMsg')
  addListener(
    partnerForm,
    'submit',
    (event) => {
      event.preventDefault()
      const name = q('#pn')?.value.trim() || ''
      const organisation = q('#po')?.value.trim() || ''
      const email = q('#pe')?.value.trim() || ''
      const teamSize = q('#ps')?.value.trim() || 'Not specified'
      openWhatsApp(
        [
          'Hi SurakshaOne,',
          '',
          "I'd like to request a conversation about team protection for my organisation.",
          '',
          `Name: ${name}`,
          `Organisation: ${organisation}`,
          `Work email: ${email}`,
          `Team size: ${teamSize}`,
          '',
          'Please share the next steps. Thank you.',
        ].join('\n'),
      )
      if (partnerMessage) {
        partnerMessage.textContent = 'Opening WhatsApp with your enquiry…'
      }
      partnerForm.reset()
    },
    undefined,
    cleanups,
  )

  qa('[data-talk="whatsapp"]').forEach((link) => {
    link.setAttribute(
      'href',
      whatsappUrl(
        [
          'Hi SurakshaOne,',
          '',
          "I'd like to talk about getting protected with SurakshaOne.",
          '',
          'Please share the next steps. Thank you.',
        ].join('\n'),
      ),
    )
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })

  qa('[data-store="ios"]').forEach((link) => {
    if (APP_STORE_URL) {
      link.setAttribute('href', APP_STORE_URL)
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    } else {
      link.setAttribute('href', '#download')
    }
  })
  qa('[data-store="android"]').forEach((link) => {
    if (PLAY_STORE_URL) {
      link.setAttribute('href', PLAY_STORE_URL)
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    } else {
      link.setAttribute('href', '#download')
    }
  })

  const reveals = qa('.reveal')
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    reveals.forEach((element) => observer.observe(element))
    observers.push(observer)
  } else {
    reveals.forEach((element) => element.classList.add('in'))
  }

  const progressBar = q('#scrollProgress')
  const header = q('header')

  // The mobile header is position:fixed, so its height has to be mirrored as
  // padding on the page. Measure it instead of hardcoding, since the logo and
  // webfont settle after first paint.
  if (header) {
    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--nav-h',
        `${Math.round(header.getBoundingClientRect().height)}px`,
      )
    }
    syncHeaderHeight()
    if ('ResizeObserver' in window) {
      const headerObserver = new ResizeObserver(syncHeaderHeight)
      headerObserver.observe(header)
      observers.push(headerObserver)
    }
    addListener(window, 'orientationchange', syncHeaderHeight, undefined, cleanups)
  }

  const updateScrollEffects = () => {
    if (progressBar) {
      const html = document.documentElement
      const percent = (html.scrollTop / (html.scrollHeight - html.clientHeight)) * 100
      progressBar.style.width = `${percent || 0}%`
    }
    header?.classList.toggle('scrolled', window.scrollY > 12)
  }
  addListener(document, 'scroll', updateScrollEffects, { passive: true }, cleanups)
  updateScrollEffects()

  const stripe = q('.stripe')
  if (stripe && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          stripe.classList.add('counted')
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(stripe)
    observers.push(observer)
  } else {
    stripe?.classList.add('counted')
  }

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const hero = q('.hero')
  if (hero && !reduceMotion) {
    addListener(
      hero,
      'mousemove',
      (event) => {
        const bounds = hero.getBoundingClientRect()
        hero.style.setProperty('--mx', `${event.clientX - bounds.left}px`)
        hero.style.setProperty('--my', `${event.clientY - bounds.top}px`)
      },
      undefined,
      cleanups,
    )
  }

  if (!reduceMotion) {
    qa('.mcard, .wcard, .tcard, .plan').forEach((card) => {
      card.classList.add('tilt')
      if (!card.querySelector(':scope > .tilt-glow')) {
        const glow = document.createElement('div')
        glow.className = 'tilt-glow'
        card.insertBefore(glow, card.firstChild)
      }
      addListener(
        card,
        'mousemove',
        (event) => {
          const bounds = card.getBoundingClientRect()
          const x = event.clientX - bounds.left
          const y = event.clientY - bounds.top
          const rotateX = ((y - bounds.height / 2) / (bounds.height / 2)) * -4
          const rotateY = ((x - bounds.width / 2) / (bounds.width / 2)) * 4
          card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`
          card.style.setProperty('--gx', `${x}px`)
          card.style.setProperty('--gy', `${y}px`)
        },
        undefined,
        cleanups,
      )
      addListener(card, 'mouseleave', () => (card.style.transform = ''), undefined, cleanups)
    })

    qa('.btn-p, .btn-g').forEach((button) => {
      addListener(
        button,
        'mousemove',
        (event) => {
          const bounds = button.getBoundingClientRect()
          const x = event.clientX - bounds.left - bounds.width / 2
          const y = event.clientY - bounds.top - bounds.height / 2
          button.style.transform = `translate(${x * 0.18}px,${y * 0.35}px)`
        },
        undefined,
        cleanups,
      )
      addListener(button, 'mouseleave', () => (button.style.transform = ''), undefined, cleanups)
    })
  }

  qa('.onode').forEach((node) => (node.style.pointerEvents = 'auto'))

  const tickerTrack = q('#tickerTrack')
  if (tickerTrack) {
    const items = [
      'CyberSafe exposure check run · Bengaluru',
      'GP consultation completed · Pune',
      'Suspicious message flagged as scam · Delhi NCR',
      'Travel assistance request · Mumbai',
      'Parent care line used · Lucknow',
      'Nominee checklist updated · Chennai',
      'Diet chart reviewed · Hyderabad',
      'Travel hotline connected · Jaipur',
    ]
    tickerTrack.innerHTML = items
      .concat(items)
      .map(
        (item) =>
          `<div class="ticker-item"><span class="dot"></span><span><b>Illustrative</b> — ${item}</span></div>`,
      )
      .join('')
  }

  const quizSteps = qa('.quiz-step')
  const progressDots = qa('#quizProgress i')
  const quizResult = q('#quizResult')
  const quizScore = q('#quizScore')
  const quizScoreLabel = q('#quizScoreLabel')
  const quizMessage = q('#quizMsg')
  const quizCount = q('#quizCount')
  const quizVisual = q('#quizVisual')
  const quizVisualTitle = q('#quizVisualTitle')
  const quizVisualSub = q('#quizVisualSub')
  let currentStep = 0
  let quizTotal = 0
  let quizTimer
  let visualTimer
  const quizMaxScore = Math.max(quizSteps.length * 2, 1)

  const syncQuizVisual = (step) => {
    if (!step || !quizVisual) return
    const next = step.getAttribute('data-img')
    const title = step.getAttribute('data-title') || ''
    const sub = step.getAttribute('data-sub') || ''
    if (quizVisualTitle) quizVisualTitle.textContent = title
    if (quizVisualSub) quizVisualSub.textContent = sub
    if (next && quizVisual.getAttribute('src') !== next) {
      quizVisual.classList.add('is-swap')
      window.clearTimeout(visualTimer)
      visualTimer = window.setTimeout(() => {
        quizVisual.setAttribute('src', next)
        quizVisual.classList.remove('is-swap')
      }, 180)
    }
  }

  const showQuizStep = (index) => {
    quizSteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index))
    progressDots.forEach((dot, dotIndex) => dot.classList.toggle('done', dotIndex <= index))
    quizResult?.classList.remove('active')
    if (quizCount) quizCount.textContent = `Question ${index + 1} of ${quizSteps.length}`
    syncQuizVisual(quizSteps[index])
  }

  qa('.quiz-opt').forEach((option) => {
    addListener(
      option,
      'click',
      () => {
        const step = option.closest('.quiz-step')
        step.querySelectorAll('.quiz-opt').forEach((item) => item.classList.remove('picked'))
        option.classList.add('picked')
        quizTotal += Number.parseInt(option.dataset.val, 10)
        quizTimer = window.setTimeout(() => {
          if (currentStep < quizSteps.length - 1) {
            currentStep += 1
            showQuizStep(currentStep)
            return
          }
          progressDots.forEach((dot) => dot.classList.add('done'))
          quizSteps.forEach((quizStep) => quizStep.classList.remove('active'))
          quizResult?.classList.add('active')
          if (quizCount) quizCount.textContent = 'Your snapshot'
          if (quizVisualTitle) quizVisualTitle.textContent = 'Checks unlock with a plan'
          if (quizVisualSub) {
            quizVisualSub.textContent =
              'Subscribe to run PAN, Aadhaar, mobile and email checks — and see the details behind your gaps.'
          }
          if (quizVisual) {
            const base = BASE_URL.replace(/\/$/, '')
            const resolved = `${base}/images/protection-hero.jpg`
            quizVisual.classList.add('is-swap')
            window.clearTimeout(visualTimer)
            visualTimer = window.setTimeout(() => {
              quizVisual.setAttribute('src', resolved)
              quizVisual.classList.remove('is-swap')
            }, 180)
          }
          const percent = Math.round((quizTotal / quizMaxScore) * 100)
          if (quizScore) quizScore.textContent = `${percent}%`
          if (percent >= 65) {
            if (quizScoreLabel) quizScoreLabel.textContent = 'High exposure'
            if (quizMessage) {
              quizMessage.textContent =
                "Several gaps are open — identity visibility, family readiness, or credit you wouldn't spot alone. A SurakshaOne check is built for exactly this."
            }
          } else if (percent >= 30) {
            if (quizScoreLabel) quizScoreLabel.textContent = 'Partial exposure'
            if (quizMessage) {
              quizMessage.textContent =
                "You've covered some basics, but enough unknowns remain that a member check on PAN, mobile or email is worth running."
            }
          } else {
            if (quizScoreLabel) quizScoreLabel.textContent = 'Low exposure'
            if (quizMessage) {
              quizMessage.textContent =
                "You're ahead of most people — still worth a periodic check so parents, loans and old email registrations don't drift."
            }
          }
        }, 260)
      },
      undefined,
      cleanups,
    )
  })

  addListener(
    q('#quizRestart'),
    'click',
    () => {
      currentStep = 0
      quizTotal = 0
      qa('.quiz-opt').forEach((option) => option.classList.remove('picked'))
      showQuizStep(0)
    },
    undefined,
    cleanups,
  )

  return () => {
    cleanups.forEach((cleanup) => cleanup())
    observers.forEach((observer) => observer.disconnect())
    window.clearTimeout(quizTimer)
    window.clearTimeout(visualTimer)
  }
}

function App() {
  const [path, setPath] = useState(() => stripBase(window.location.pathname))
  const source = pages[path] ?? homeSource
  const page = useMemo(() => parsePage(source), [source])

  useEffect(() => {
    document.title = page.title
    let description = document.querySelector('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.setAttribute('name', 'description')
      document.head.appendChild(description)
    }
    description.setAttribute('content', page.description)

    let favicon = document.querySelector('link[rel="icon"]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      document.head.appendChild(favicon)
    }
    favicon.setAttribute('type', 'image/png')
    favicon.setAttribute('href', FAVICON_SRC)

    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]')
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link')
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon')
      document.head.appendChild(appleTouchIcon)
    }
    appleTouchIcon.setAttribute('href', FAVICON_SRC)
  }, [page])

  useEffect(() => {
    const root = document.getElementById('page')
    const cleanupInteractions = setupInteractions(root)

    const handleNavigation = (event) => {
      const anchor = event.target.closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return

      const routePath = stripBase(url.pathname)
      if (!pages[routePath]) return

      event.preventDefault()
      const nextUrl = `${withBase(routePath)}${url.hash}`
      const routeChanged = routePath !== path
      window.history.pushState({}, '', nextUrl)

      if (routeChanged) {
        setPath(routePath)
      } else if (url.hash) {
        document.querySelector(url.hash)?.scrollIntoView()
      } else {
        window.scrollTo({ top: 0 })
      }
    }

    const handlePopState = () => setPath(stripBase(window.location.pathname))
    document.addEventListener('click', handleNavigation)
    window.addEventListener('popstate', handlePopState)

    if (window.location.hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(window.location.hash)?.scrollIntoView()
      })
    } else {
      window.scrollTo({ top: 0, left: 0 })
    }

    return () => {
      cleanupInteractions()
      document.removeEventListener('click', handleNavigation)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [page, path])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: page.styles }} />
      <style>{`
        html,body,#root,#page{max-width:100%;}
        /* clip (not hidden) keeps the viewport as the scroll container,
           so the sticky header and scroll position stay stable */
        html,body{overflow-x:hidden;overflow-x:clip;}
        /* the sticky header must not change height while scrolling,
           otherwise every toggle reflows the page below it */
        header.scrolled .navbar{padding-top:13px;padding-bottom:13px;}
        /* the rings spin, and a rotating square's bounding box grows to ~1.41x,
           which periodically stretched the page and yanked the scroll position */
        .orbit,.ring,.ticker-band{overflow-anchor:none;}
        @media (max-width:960px){
          /* leave orbit unclipped so Wellness / LifeSecure labels can sit
             above and below the nodes; page-level overflow-x:clip still
             absorbs the spinning-ring bounding-box growth */
          .orbit{overflow:visible;margin:28px auto 34px;}
          /* fixed rather than sticky: iOS Safari drops sticky when an
             ancestor clips overflow, which is what pins the page width */
          header{position:fixed;top:0;left:0;right:0;width:100%;}
          body{padding-top:var(--nav-h,67px);}
          html{scroll-padding-top:calc(var(--nav-h,67px) + 12px);}
          .nav-links{top:var(--nav-h,67px);max-height:calc(100dvh - var(--nav-h,67px));}
        }
        .brand img,.fbrand img{
          height:40px;
          width:auto;
          object-fit:contain;
          background:transparent;
        }
        .fbrand img{height:36px;}
        .core{
          background:transparent !important;
          box-shadow:none !important;
          border-radius:0 !important;
          overflow:visible !important;
          padding:0 !important;
        }
        .core img{
          width:100%;
          height:100%;
          object-fit:contain;
          filter:drop-shadow(0 14px 28px rgba(44,95,221,.22));
        }
      `}</style>
      <div id="page" dangerouslySetInnerHTML={{ __html: page.body }} />
    </>
  )
}

export default App
