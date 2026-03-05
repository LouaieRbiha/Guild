import { Skeleton } from '@/components/ui/skeleton';

export default function LeaksLoading() {
	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center gap-3'>
				<Skeleton className='h-6 w-6 rounded' />
				<Skeleton className='h-8 w-32' />
			</div>
			<div className='space-y-4'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className='h-32 rounded-xl' />
				))}
			</div>
		</div>
	);
}
