import { useEffect } from 'react';

export const SITE = {
  name: 'CloudDrive',
  tagline: 'Secure cloud storage built for modern teams',
  url: import.meta.env.VITE_SITE_URL || 'https://clouddrive.app',
  defaultDescription:
    'CloudDrive is a secure, fast cloud storage platform with AWS S3 integration. Upload, organize, and share files with enterprise-grade security and email-verified accounts.',
  defaultImage: '/og-image.svg',
  twitter: '@clouddrive',
};

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO({
  title,
  description = SITE.defaultDescription,
  path = '',
  image = SITE.defaultImage,
  type = 'website',
  noindex = false,
} = {}) {
  useEffect(() => {
    const pageTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
    const canonical = `${SITE.url}${path}`;
    const imageUrl = image.startsWith('http') ? image : `${SITE.url}${image}`;

    document.title = pageTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:site_name', SITE.name);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
  }, [title, description, path, image, type, noindex]);
}
