import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	turbopack: {
		root: path.resolve(__dirname),
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'enka.network',
				pathname: '/ui/**',
			},
			{
				protocol: 'https',
				hostname: 'gi.yatta.moe',
				pathname: '/assets/**',
			},
			{
				protocol: 'https',
				hostname: 'static-cdn.jtvnw.net',
			},
			{
				protocol: 'https',
				hostname: '*.jtvnw.net',
			},
			{
				protocol: 'https',
				hostname: 'i.ytimg.com',
			},
			{
				protocol: 'https',
				hostname: 'yt3.ggpht.com',
			},
		],
	},
};

export default nextConfig;
