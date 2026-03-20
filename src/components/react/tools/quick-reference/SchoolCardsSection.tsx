import type { ReactNode } from "react";
import { Highlight } from "./Highlight";
import type { QRefSchool } from "./qref-data";

interface SchoolCardsSectionProps {
	footer: ReactNode;
	schools: readonly QRefSchool[];
	searchWords: string[];
}

export function SchoolCardsSection({ schools, searchWords, footer }: SchoolCardsSectionProps) {
	const filtered = schools.filter((s) => {
		if (searchWords.length === 0) return true;
		const text = `${s.school} ${s.skill} ${s.weapon} ${s.action} ${s.blurb}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-md max-[600px]:grid-cols-1">
				{filtered.map((s) => (
					<div
						className="overflow-hidden rounded-md border border-border bg-surface transition-colors duration-150 hover:border-accent"
						key={s.school}
					>
						<div className="border-border border-b bg-surface-highlight px-md py-sm text-[0.95rem] text-accent">
							<strong>
								<Highlight text={s.school} words={searchWords} />
							</strong>
						</div>
						<div className="px-md py-sm pb-md">
							<p className="m-0 mb-sm text-[0.85rem] text-text-primary leading-[1.45]">
								<Highlight text={s.blurb} words={searchWords} />
							</p>
							<div className="flex flex-wrap gap-x-md gap-y-[4px] text-[0.8rem] text-text-muted">
								<span>
									<em className="text-text-muted not-italic opacity-70">Skill:</em>{" "}
									<Highlight text={s.skill} words={searchWords} />
								</span>
								<span>
									<em className="text-text-muted not-italic opacity-70">Weapon:</em>{" "}
									<Highlight text={s.weapon} words={searchWords} />
								</span>
								<span>
									<em className="text-text-muted not-italic opacity-70">Action:</em>{" "}
									<Highlight text={s.action} words={searchWords} />
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="mt-md text-[0.85rem] text-text-muted">{footer}</div>
		</>
	);
}
