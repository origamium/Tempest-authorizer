export type ProviderData = {
    apiKey: string;
    apiSecret: string;
    url: string;
};

export const pawoo: ProviderData = {
    apiKey: process.env.MASTODON_PAWOO_APIKEY!,
    apiSecret: process.env.MASTODON_PAWOO_APISECRET!,
    url: "https://pawoo.net/oauth/token",
};

export const mstdnjp: ProviderData = {
    apiKey: process.env.MASTODON_MSTDNJP_APIKEY!,
    apiSecret: process.env.MASTODON_MSTDNJP_APISECRET!,
    url: "https://mstdn.jp/oauth/token",
};
