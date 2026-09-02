const GA_ID = 'G-TGBLKX855E'

export function trackPageView(path: string) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    send_to: GA_ID,
  })
}
