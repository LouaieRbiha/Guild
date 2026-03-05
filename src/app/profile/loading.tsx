import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<Skeleton className='h-10 w-64' />
			<Skeleton className='h-48 w-full rounded-xl' />
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className='h-24 rounded-xl' />
				))}
			</div>
		</div>
	);
}
