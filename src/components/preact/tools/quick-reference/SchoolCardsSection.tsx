import { Highlight } from "./Highlight";
import type { QRefSchool } from "./qref-data";

interface SchoolCardsSectionProps {
	schools: readonly QRefSchool[];
	searchWords: string[];
	footerNote: string;
}

export function SchoolCardsSection({ schools, searchWords, footerNote }: SchoolCardsSectionProps) {
	const filtered = schools.filter((s) => {
		if (searchWords.length === 0) return true;
		const text = `${s.school} ${s.skill} ${s.weapon} ${s.action} ${s.blurb}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<>
			<div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-md max-[600px]:grid-cols-1">
				{filtered.map((s) => (
					<div
						class="bg-surface border border-border rounded-md overflow-hidden transition-colors duration-150 hover:border-accent"
						key={s.school}
					>
						<div class="bg-surface-highlight px-md py-sm border-b border-border text-accent text-[0.95rem]">
							<strong>
								<Highlight text={s.school} words={searchWords} />
							</strong>
						</div>
						<div class="px-md py-sm pb-md">
							<p class="m-0 mb-sm text-[0.85rem] text-text-primary leading-[1.45]">
								<Highlight text={s.blurb} words={searchWords} />
							</p>
							<div class="flex flex-wrap gap-x-md gap-y-[4px] text-[0.8rem] text-text-muted">
								<span>
									<em class="text-text-muted not-italic opacity-70">Skill:</em>{" "}
									<Highlight text={s.skill} words={searchWords} />
								</span>
								<span>
									<em class="text-text-muted not-italic opacity-70">Weapon:</em>{" "}
									<Highlight text={s.weapon} words={searchWords} />
								</span>
								<span>
									<em class="text-text-muted not-italic opacity-70">Action:</em>{" "}
									<Highlight text={s.action} words={searchWords} />
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<p class="mt-md text-text-muted text-[0.85rem]">{footerNote}</p>
		</>
	);
}
