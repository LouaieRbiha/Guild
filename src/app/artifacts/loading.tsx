import { Skeleton } from '@/components/ui/skeleton';

export default function ArtifactsLoading() {
	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center gap-3'>
				<Skeleton className='h-6 w-6 rounded' />
				<Skeleton className='h-8 w-36' />
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className='h-64 rounded-xl' />
				))}
			</div>
		</div>
	);
}
