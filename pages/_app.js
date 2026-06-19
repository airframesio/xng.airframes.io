import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GA_TRACKING_ID, pageview } from '../lib/gtag';
import { archivo, instrument, mono } from '../lib/fonts';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#090d13" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon-32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-32.png" />
      </Head>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <div className={`${archivo.variable} ${instrument.variable} ${mono.variable} site`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
