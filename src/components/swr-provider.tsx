'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
	return (
		<SWRConfig
			value={{
				dedupingInterval: 60000,
				revalidateOnFocus: false,
				errorRetryCount: 3,
				errorRetryInterval: 5000,
			}}
		>
			{children}
		</SWRConfig>
	);
}
