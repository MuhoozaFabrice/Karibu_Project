export const BRANCHES = ['Maganjo', 'Matugga'];
export const DIRECTOR_BRANCH = 'Head Office';

export const ALLOWED_PRODUCE = ['Beans', 'Grain Maize', 'Cow peas', 'G-nuts', 'Soybeans'];

const normalizeSpaces = (value = '') => value.trim().replace(/\s+/g, ' ');

export const normalizeBranch = (value = '') => {
    const clean = normalizeSpaces(value).toLowerCase();
    if (clean === 'maganjo') return 'Maganjo';
    if (clean === 'matugga') return 'Matugga';
    return '';
};

export const normalizeProduceName = (value = '') => {
    const clean = normalizeSpaces(value).toLowerCase();
    const match = ALLOWED_PRODUCE.find((item) => item.toLowerCase() === clean);
    return match || '';
};

export const isAlphaOnlyMin2 = (value = '') => /^[A-Za-z\s]{2,}$/.test(normalizeSpaces(value));
export const isAlphaNumericMin2 = (value = '') => /^[A-Za-z0-9.\-\s]{2,}$/.test(normalizeSpaces(value));

export const isValidPhone = (value = '') => /^\+?\d{10,15}$/.test(String(value).replace(/[\s()-]/g, ''));
export const isValidNIN = (value = '') => /^[A-Z0-9]{13,14}$/i.test(normalizeSpaces(value));

export const isAtLeastFiveDigits = (value) => Number(value) >= 10000;

export const isCompanyDirector = (user) => {
    const name = normalizeSpaces(user?.name || '').toLowerCase();
    return name === 'mr. orban' || name === 'mr orban' || name === 'orban';
};
