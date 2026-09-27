import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { isBrokenUploadUrl } from '@/lib/imageUpload'
import type { StaffMember } from '@/types'

interface TeamProps {
  staff: StaffMember[]
}

export function Team({ staff }: TeamProps) {
  return (
    <section id="team" className="section-pad relative">
      <Container>
        <SectionHeading
          eyebrow="Our Team"
          title="Meet Our Wellness Therapists"
          subtitle="Experienced professionals dedicated to your comfort, care, and lasting relaxation."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((member, i) => (
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
      </Container>
    </section>
  )
}
