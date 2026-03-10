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
			<div class="school-cards">
				{filtered.map((s) => (
					<div class="school-card" key={s.school}>
						<div class="school-card-header">
							<strong>
								<Highlight text={s.school} words={searchWords} />
							</strong>
						</div>
						<div class="school-card-body">
							<p class="school-blurb">
								<Highlight text={s.blurb} words={searchWords} />
							</p>
							<div class="school-meta">
								<span>
									<em>Skill:</em> <Highlight text={s.skill} words={searchWords} />
								</span>
								<span>
									<em>Weapon:</em> <Highlight text={s.weapon} words={searchWords} />
								</span>
								<span>
									<em>Action:</em> <Highlight text={s.action} words={searchWords} />
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<p style="margin-top:var(--space-md);color:var(--text-muted);font-size:0.85rem">{footerNote}</p>
		</>
	);
}
