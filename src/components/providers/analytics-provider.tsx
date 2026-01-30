"use client"

import { useEffect } from "react"

// Inject a script tag into the document
function injectScript(id: string, content: string, location: "head" | "body" = "head") {
  if (typeof document === "undefined") return
  if (document.getElementById(id)) return

  const script = document.createElement("script")
  script.id = id
  script.innerHTML = content

  if (location === "head") {
    document.head.appendChild(script)
  } else {
    document.body.appendChild(script)
  }
}

// Inject an external script
function injectExternalScript(id: string, src: string, async = true) {
  if (typeof document === "undefined") return
  if (document.getElementById(id)) return

  const script = document.createElement("script")
  script.id = id
  script.src = src
  script.async = async
  document.head.appendChild(script)
}

// Google Analytics 4
function initGoogleAnalytics(measurementId: string) {
  injectExternalScript(
    "ga-script",
    `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  )
  injectScript(
    "ga-init",
    `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `
  )
}

// Google Tag Manager
function initGoogleTagManager(containerId: string) {
  injectScript(
    "gtm-init",
    `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `
  )
}

// Facebook Pixel
function initFacebookPixel(pixelId: string) {
  injectScript(
    "fb-pixel",
    `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `
  )
}

// TikTok Pixel
function initTikTokPixel(pixelId: string) {
  injectScript(
    "tiktok-pixel",
    `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `
  )
}

// Snapchat Pixel
function initSnapchatPixel(pixelId: string) {
  injectScript(
    "snapchat-pixel",
    `
    (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
    {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
    a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
    r.src=n;var u=t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r,u);})(window,document,
    'https://sc-static.net/scevent.min.js');
    snaptr('init', '${pixelId}', {
      'user_email': '__INSERT_USER_EMAIL__'
    });
    snaptr('track', 'PAGE_VIEW');
  `
  )
}

// Custom scripts
function injectCustomScripts(scripts: string, location: "head" | "body") {
  if (!scripts.trim()) return

  const id = location === "head" ? "custom-head-scripts" : "custom-body-scripts"
  if (typeof document === "undefined") return
  if (document.getElementById(id)) return

  const container = document.createElement("div")
  container.id = id
  container.innerHTML = scripts

  // Extract and execute any script tags
  const scriptTags = container.querySelectorAll("script")
  scriptTags.forEach((oldScript) => {
    const newScript = document.createElement("script")
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })
    newScript.innerHTML = oldScript.innerHTML
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })

  if (location === "head") {
    document.head.appendChild(container)
  } else {
    document.body.appendChild(container)
  }
}

interface IntegrationSettings {
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  tiktokPixelId?: string
  snapchatPixelId?: string
  customHeadScripts?: string
  customBodyScripts?: string
}

export function AnalyticsProvider() {
  useEffect(() => {
    // Fetch integration settings
    fetch("/api/settings?group=integrations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const settings: IntegrationSettings = {}
          data.forEach((s: { key: string; value: string }) => {
            settings[s.key as keyof IntegrationSettings] = s.value
          })

          // Initialize tracking pixels
          if (settings.googleAnalyticsId) {
            initGoogleAnalytics(settings.googleAnalyticsId)
          }
          if (settings.googleTagManagerId) {
            initGoogleTagManager(settings.googleTagManagerId)
          }
          if (settings.facebookPixelId) {
            initFacebookPixel(settings.facebookPixelId)
          }
          if (settings.tiktokPixelId) {
            initTikTokPixel(settings.tiktokPixelId)
          }
          if (settings.snapchatPixelId) {
            initSnapchatPixel(settings.snapchatPixelId)
          }

          // Inject custom scripts
          if (settings.customHeadScripts) {
            injectCustomScripts(settings.customHeadScripts, "head")
          }
          if (settings.customBodyScripts) {
            injectCustomScripts(settings.customBodyScripts, "body")
          }
        }
      })
      .catch(() => {
        // Silently fail - analytics are optional
      })
  }, [])

  return null
}
