'use client';

import { SLOT_ICONS } from '@/components/icons/genshin-icons';
import { Badge } from '@/components/ui/badge';
import { CHARACTER_GUIDES } from '@/data/character-guides';
import {
	ALL_CHARACTERS,
	CharacterEntry,
	charIconUrl,
} from '@/lib/characters';
import { weaponIconUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CharacterDetail } from '@/lib/yatta/client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type ElementColors } from './detail-helpers';

export function GuidesTab({ detail, colors }: { detail: CharacterDetail; colors: ElementColors }) {
	const guide = CHARACTER_GUIDES[detail.name];
	const [kqmGuide, setKqmGuide] = useState<any>(null);

	useEffect(() => {
		const slug = detail.name.toLowerCase().replace(/\s+/g, '-');
		fetch(`/api/guides/${slug}`)
			.then(res => res.json())
			.then(data => { if (data) setKqmGuide(data); })
			.catch(() => {});
	}, [detail.name]);

	const findCharEntry = (name: string): CharacterEntry | undefined =>
		ALL_CHARACTERS.find(c => c.name === name);

	if (!guide && !kqmGuide) {
		return (
			<div className="guild-card p-8 text-center space-y-4">
				<h2 className="text-xl font-semibold text-foreground mb-2">No Guide Available Yet</h2>
				<p className="text-guild-muted">Community guide for {detail.name} hasn&apos;t been added yet.</p>
				<div className="flex items-center justify-center gap-3">
					<a href={`https://kqm.gg/${detail.name.toLowerCase().replace(/\s+/g, '-')}`} target="_blank" rel="noopener noreferrer"
						className="px-4 py-2 rounded-lg bg-guild-accent/20 text-guild-accent hover:bg-guild-accent/30 transition-colors text-sm">
						Check KQM Guide
					</a>
					<a href={`https://genshin-impact.fandom.com/wiki/${detail.name.replace(/\s+/g, '_')}`} target="_blank" rel="noopener noreferrer"
						className="px-4 py-2 rounded-lg bg-guild-elevated text-guild-muted hover:bg-foreground/10 transition-colors text-sm">
						View on Wiki
					</a>
				</div>
			</div>
		);
	}

	// Source badge colors
	const SOURCE_COLORS: Record<string, string> = {
		Wish: 'bg-purple-500/20 text-purple-300',
		BP: 'bg-amber-500/20 text-amber-300',
		Craft: 'bg-teal-500/20 text-teal-300',
		Shop: 'bg-blue-500/20 text-blue-300',
		F2P: 'bg-green-500/20 text-green-300',
		Event: 'bg-pink-500/20 text-pink-300',
		Fish: 'bg-cyan-500/20 text-cyan-300',
	};

	// Section header component
	const SectionHeader = ({ title }: { title: string }) => (
		<div className={cn("px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide", colors.bg, colors.text)}>
			{title}
		</div>
	);

	const weapons = guide?.bestWeapons || (kqmGuide?.weapons?.map((w: any) => ({ name: w.name, weaponId: 0, note: w.note || '', source: undefined })) || []);
	const artifacts = guide?.bestArtifacts || (kqmGuide?.artifacts?.map((a: any) => ({ setName: a.set, pieces: a.pieces || 4, note: a.note || '' })) || []);
	const talentStr = guide?.talentPriority || (kqmGuide?.talentPriority?.join(' > ') || '');
	const teams = guide?.teams || (kqmGuide?.teams?.map((t: any) => ({ name: t.name || 'Team', members: t.members || [], archetype: t.archetype || '' })) || []);

	return (
		<div className="space-y-4">
			{/* Role + KQM link */}
			<div className="flex items-center justify-between flex-wrap gap-3">
				{guide?.role && (
					<div className="flex items-center gap-2">
						<span className={cn("text-sm font-semibold", colors.text)}>{guide.role}</span>
					</div>
				)}
				<a href={`https://kqm.gg/${detail.name.toLowerCase().replace(/\s+/g, '-')}`}
					target="_blank" rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-xs font-medium">
					Full KQM Guide &rarr;
				</a>
			</div>

			{/* TL;DR */}
			{guide?.tldr && (
				<div className={cn("guild-card p-4 border-l-4", colors.border)}>
					<p className="text-sm text-foreground/90 italic leading-relaxed">{guide.tldr}</p>
				</div>
			)}

			{/* Weapons Section */}
			<div className="guild-card overflow-hidden p-0">
				<SectionHeader title="Weapons" />
				<div className="p-4">
					<div className="flex flex-wrap gap-3">
						{weapons.map((w: any, i: number) => (
							<div key={i} className="flex flex-col items-center gap-1.5 w-20">
								<div className="relative">
									{w.weaponId > 0 && (
										<Image src={weaponIconUrl(w.weaponId)} alt={w.name} width={56} height={56}
											quality={100}
											className="rounded-lg bg-guild-elevated border border-guild-border" />
									)}
									{!w.weaponId && (
										<div className="w-14 h-14 rounded-lg bg-guild-elevated border border-guild-border flex items-center justify-center text-guild-muted text-xs">?</div>
									)}
									{i === 0 && <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-guild-gold flex items-center justify-center text-[8px] font-bold text-black">1</div>}
									{w.source && (
										<span className={cn("absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded", SOURCE_COLORS[w.source] || 'bg-foreground/10 text-foreground/60')}>
											{w.source}
										</span>
									)}
								</div>
								<span className="text-[10px] text-center leading-tight text-guild-muted truncate w-full">{w.name}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Artifact Sets + Talent Priority side by side */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Artifact Sets */}
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Artifact Sets" />
					<div className="p-4">
						<div className="flex items-center gap-2 flex-wrap">
							{artifacts.map((a: any, i: number) => (
								<div key={i} className="flex items-center gap-2">
									{i > 0 && <span className="text-guild-dim text-lg font-bold">&gt;</span>}
									<div className="flex flex-col items-center">
										<span className={cn("text-[10px] font-bold px-1.5 rounded", colors.bg, colors.text)}>{a.pieces}pc</span>
										<span className="text-xs text-center mt-1 max-w-24 leading-tight">{a.setName}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Talent Priority */}
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Talent Priority" />
					<div className="p-4">
						<p className="text-base font-bold text-foreground">
							{talentStr.split(' > ').map((part: string, i: number, arr: string[]) => (
								<span key={i}>
									<span className={colors.text}>{part.trim()}</span>
									{i < arr.length - 1 && <span className="text-guild-dim mx-1.5">&gt;</span>}
								</span>
							))}
						</p>
					</div>
				</div>
			</div>

			{/* Main Stats + Substats side by side */}
			{guide?.mainStats && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Main Stats */}
					<div className="guild-card overflow-hidden p-0">
						<SectionHeader title="Main Stats" />
						<div className="p-4 space-y-2">
							{([
								{ slot: 'Sands' as const, value: guide.mainStats.sands },
								{ slot: 'Goblet' as const, value: guide.mainStats.goblet },
								{ slot: 'Circlet' as const, value: guide.mainStats.circlet },
							]).map(({ slot, value }) => {
								const SI = SLOT_ICONS[slot];
								return (
									<div key={slot} className="flex items-center gap-2">
										{SI && <SI size={16} className="text-guild-muted shrink-0" />}
										<span className="text-xs text-guild-muted w-14">{slot}</span>
										<span className="text-sm font-medium">{value}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Substats */}
					<div className="guild-card overflow-hidden p-0">
						<SectionHeader title="Substats" />
						<div className="p-4">
							<div className="space-y-1.5">
								{guide.substats.map((sub, i) => (
									<div key={i} className="flex items-center gap-2">
										<span className={cn("text-xs font-bold w-5", colors.text)}>{i + 1}.</span>
										<span className="text-sm">{sub}</span>
									</div>
								))}
							</div>
							{guide.erRequirement && (
								<div className="mt-3 pt-3 border-t border-guild-border/30">
									<p className="text-xs text-guild-muted"><span className="font-semibold text-guild-accent">ER:</span> {guide.erRequirement}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Teams Section */}
			<div className="guild-card overflow-hidden p-0">
				<SectionHeader title="Teams" />
				<div className="p-4 space-y-4">
					{teams.map((team: any, i: number) => (
						<div key={i} className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								{team.members.map((member: string, j: number) => {
									const entry = findCharEntry(member);
									return entry ? (
										<Link key={j} href={`/database/${entry.id}`}>
											<div className="w-10 h-10 rounded-lg overflow-hidden border border-guild-border bg-guild-elevated hover:border-guild-accent/50 transition-colors">
												<Image src={charIconUrl(entry.id)} alt={member} width={40} height={40} className="object-cover" sizes="40px" quality={100} />
											</div>
										</Link>
									) : (
										<div key={j} className="w-10 h-10 rounded-lg bg-guild-elevated border border-guild-border flex items-center justify-center text-[10px] text-guild-muted">
											{member.slice(0, 2)}
										</div>
									);
								})}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-foreground font-medium truncate">{team.name}</p>
								{(team.archetype || team.note) && (
									<p className="text-[10px] text-guild-muted truncate">{team.note || team.archetype}</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Tips */}
			{guide?.tips && guide.tips.length > 0 && (
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Tips" />
					<div className="p-4">
						<ul className="space-y-2">
							{guide.tips.map((tip, i) => (
								<li key={i} className="flex gap-2 text-sm text-guild-muted">
									<span className={cn("font-bold shrink-0", colors.text)}>&bull;</span>
									{tip}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Playstyle */}
			{guide?.playstyle && (
				<div className="guild-card p-4">
					<p className="text-sm text-guild-muted italic">&quot;{guide.playstyle}&quot;</p>
				</div>
			)}
		</div>
	);
}
