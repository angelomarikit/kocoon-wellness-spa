import { useMemo, useState } from 'react'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { STAFF_BRANCHES, STAFF_BRANCH_LABELS } from '@/lib/constants'
import { isBrokenUploadUrl } from '@/lib/imageUpload'
import { cn } from '@/lib/utils'
import type { StaffBranch, StaffMember } from '@/types'

interface TeamProps {
  staff: StaffMember[]
}

function normalizeBranch(branch: string | undefined): StaffBranch {
  return branch === 'Manila' ? 'Manila' : 'Baguio'
}

export function Team({ staff }: TeamProps) {
  const [activeBranch, setActiveBranch] = useState<StaffBranch>('Baguio')

  const filtered = useMemo(
    () => staff.filter((member) => normalizeBranch(member.branch) === activeBranch),
    [staff, activeBranch],
  )

  return (
    <section id="team" className="section-pad relative">
      <Container>
        <SectionHeading
          eyebrow="Our Team"
          title="Meet Our Wellness Therapists"
          subtitle="Experienced professionals dedicated to your comfort, care, and lasting relaxation."
        />

        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Team branches"
        >
          {STAFF_BRANCHES.map((branch) => {
            const selected = branch === activeBranch
            return (
              <button
                key={branch}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveBranch(branch)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm uppercase tracking-wider transition',
                  selected
                    ? 'border-gold/50 bg-gold/15 text-gold'
                    : 'border-border bg-surface text-muted-light hover:border-gold/30 hover:text-cream',
                )}
              >
                {STAFF_BRANCH_LABELS[branch]}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            Therapists for the {STAFF_BRANCH_LABELS[activeBranch]} will appear here soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="tabpanel">
            {filtered.map((member, i) => (
              <Reveal key={member.id} delay={i * 0.05}>
                <article className="group overflow-hidden rounded-2xl border border-gold/12 bg-surface">
                  <div className="relative aspect-[3/4] overflow-hidden bg-bg-elevated">
                    {!isBrokenUploadUrl(member.imageUrl) ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-cream">{member.name}</h3>
                    <p className="mt-1 text-sm text-gold">{member.position}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>
                    <p className="mt-3 text-xs uppercase tracking-wider text-muted-light">
                      {member.yearsExperience}+ years · {member.specialty}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
