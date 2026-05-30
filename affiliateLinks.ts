export const AFFILIATE_LINKS: string[] = [
'https://s.shopee.co.id/50WITe1hfK',
'https://s.shopee.co.id/7fX3ebpJiS',
'https://s.shopee.co.id/1109iNsquh',
'https://s.shopee.co.id/5flzGzQNan',
'https://s.shopee.co.id/9Uyhq3wxEK',
'https://s.shopee.co.id/7KuDG900oQ',
'https://s.shopee.co.id/3g0utR9vq7',
'https://s.shopee.co.id/9zuyR6el2A',
  // ...
];

export function openAffiliateLink(): void {
  if (AFFILIATE_LINKS.length === 0) return;
  const idx = Math.floor(Math.random() * AFFILIATE_LINKS.length);
  const link = AFFILIATE_LINKS[idx];

  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
