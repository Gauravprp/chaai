const GRADIENTS = [
  ['#4f46e5', '#06b6d4'], // Indigo -> Cyan
  ['#ec4899', '#f43f5e'], // Pink -> Rose
  ['#10b981', '#059669'], // Emerald -> Green
  ['#f59e0b', '#d97706'], // Amber -> Orange
  ['#8b5cf6', '#d946ef'], // Violet -> Fuchsia
];

// In-memory cache for generated avatars
const avatarCache = {};

export function generateAvatar(projectName) {
  if (!projectName) projectName = 'TF';
  
  if (avatarCache[projectName]) {
    return avatarCache[projectName];
  }

  // Get initials
  const initials = projectName
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Pick gradient deterministically based on hash
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradientIndex = Math.abs(hash) % GRADIENTS.length;
  const [color1, color2] = GRADIENTS[gradientIndex];

  // Generate responsive SVG string
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="24" fill="url(#grad-${hash})" />
    <text x="50" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  avatarCache[projectName] = dataUri;
  return dataUri;
}
