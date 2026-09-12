import React from "react";
import { splitBulletLines, splitResumeList } from "@/utils/resumeUtils.js";

const pageClass =
  "mx-auto aspect-[210/297] w-full overflow-hidden break-words bg-white text-slate-900 [overflow-wrap:anywhere] [word-break:break-word]";
const bodyTextClass =
  "break-words leading-6 [text-align:justify] [text-justify:inter-word]";
const metaTextClass = "text-[11px] leading-5";

const SectionTitle = ({ children, className = "" }) => (
  <h2
    className={`mb-2 break-words text-xs font-black uppercase tracking-[0.12em] ${className}`}
  >
    {children}
  </h2>
);

const BulletList = ({ items, className = "" }) => (
  <ul
    className={`min-w-0 space-y-1.5 pl-4 text-[12.5px] leading-5 ${className}`}
  >
    {items.map((item, index) => (
      <li
        key={`${item}-${index}`}
        className="break-words text-left marker:text-current"
      >
        {item}
      </li>
    ))}
  </ul>
);

const ResumePreviewHtml = ({ cv, templateId }) => {
  const skills = splitResumeList(cv.skills);
  const certifications = splitResumeList(cv.certifications);
  const languages = splitResumeList(cv.languages);
  const achievements = splitBulletLines(cv.achievements);
  const experience = (cv.experience || []).filter(
    (e) => e.role || e.company || e.description,
  );
  const education = (cv.education || []).filter((e) => e.degree || e.school);
  const projects = (cv.projects || []).filter((p) => p.title || p.description);
  const links = (cv.links || []).filter((link) => link.label || link.url);
  const contactBits = [cv.email, cv.phone, cv.location].filter(Boolean);
  const socialBits = [cv.linkedin, cv.portfolio].filter(Boolean);

  if (templateId === "classic") {
    return (
      <div
        className={`${pageClass} p-8 font-serif text-[13px] leading-6 text-black`}
      >
        <header className="border-b border-black pb-3">
          <h1 className="break-words text-[28px] font-bold leading-tight">
            {cv.name || "Your Name"}
          </h1>
          {contactBits.length > 0 && (
            <p className={`mt-1 break-words ${metaTextClass}`}>
              {contactBits.join(" | ")}
            </p>
          )}
          {socialBits.length > 0 && (
            <p className={`mt-1 break-all ${metaTextClass}`}>
              {socialBits.join(" | ")}
            </p>
          )}
        </header>

        {cv.summary?.trim() && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Professional Summary
            </SectionTitle>
            <p className={bodyTextClass}>{cv.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Professional Experience
            </SectionTitle>
            <div className="space-y-4">
              {experience.map((item) => {
                const bullets = splitBulletLines(item.description);
                return (
                  <article key={item.id}>
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-bold">
                          {item.role || "Role"}
                        </p>
                        <p className="break-words">
                          {item.company || "Company"}
                        </p>
                      </div>
                      {item.duration && (
                        <p
                          className={`max-w-[34%] break-words text-right ${metaTextClass}`}
                        >
                          {item.duration}
                        </p>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <BulletList items={bullets} className="mt-2" />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Education
            </SectionTitle>
            <div className="space-y-2">
              {education.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-bold">
                      {item.degree || "Degree"}
                    </p>
                    <p className="break-words">
                      {item.school || "Institution"}
                    </p>
                  </div>
                  {item.year && (
                    <p
                      className={`max-w-[34%] break-words text-right ${metaTextClass}`}
                    >
                      {item.year}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Skills
            </SectionTitle>
            <p className={bodyTextClass}>{skills.join(", ")}</p>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Projects
            </SectionTitle>
            <div className="space-y-3">
              {projects.map((project) => {
                const bullets = splitBulletLines(project.description);
                return (
                  <article key={project.id}>
                    <p className="break-words font-bold">{project.title}</p>
                    {bullets.length > 0 && (
                      <BulletList items={bullets} className="mt-1" />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <section className="mt-5">
            <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
              Achievements
            </SectionTitle>
            <BulletList items={achievements} />
          </section>
        )}

        {(certifications.length > 0 ||
          languages.length > 0 ||
          links.length > 0) && (
          <section className="mt-5 grid gap-4 sm:grid-cols-2">
            {certifications.length > 0 && (
              <div>
                <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
                  Certifications
                </SectionTitle>
                <BulletList items={certifications} />
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
                  Languages
                </SectionTitle>
                <BulletList items={languages} />
              </div>
            )}
            {links.length > 0 && (
              <div
                className={
                  certifications.length > 0 || languages.length > 0
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <SectionTitle className="border-b border-black pb-1 tracking-[0.18em]">
                  Links
                </SectionTitle>
                <div className="space-y-1 text-[12px] leading-5">
                  {links.map((link) => (
                    <p
                      key={link.id || link.url}
                      className="break-all text-left"
                    >
                      <span className="font-bold">{link.label || "Link"}:</span>{" "}
                      {link.url}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  if (templateId === "professional") {
    return (
      <div className={`${pageClass} flex`}>
        <aside className="w-[34%] overflow-hidden bg-teal-800 px-6 py-7 text-white">
          <h1 className="break-words text-[24px] font-black leading-tight">
            {cv.name || "Your Name"}
          </h1>
          {cv.title && (
            <p className="mt-2 break-words text-sm font-semibold text-teal-100">
              {cv.title}
            </p>
          )}

          <div className="mt-5 min-w-0 space-y-1.5 text-[12px] text-teal-50">
            {[cv.email, cv.phone, cv.location, cv.linkedin, cv.portfolio]
              .filter(Boolean)
              .map((item, index) => (
                <p key={`${item}-${index}`} className="break-all">
                  {item}
                </p>
              ))}
          </div>

          {skills.length > 0 && (
            <section className="mt-7">
              <SectionTitle className="text-teal-100">Skills</SectionTitle>
              <BulletList items={skills} className="text-teal-50" />
            </section>
          )}

          {education.length > 0 && (
            <section className="mt-7">
              <SectionTitle className="text-teal-100">Education</SectionTitle>
              <div className="min-w-0 space-y-3 text-[12px] text-teal-50">
                {education.map((item) => (
                  <div key={item.id}>
                    <p className="break-words font-bold text-white">
                      {item.degree}
                    </p>
                    <p className="break-words">{item.school}</p>
                    {item.year && <p className="break-words">{item.year}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="mt-7">
              <SectionTitle className="text-teal-100">
                Certifications
              </SectionTitle>
              <BulletList items={certifications} className="text-teal-50" />
            </section>
          )}

          {languages.length > 0 && (
            <section className="mt-7">
              <SectionTitle className="text-teal-100">Languages</SectionTitle>
              <BulletList items={languages} className="text-teal-50" />
            </section>
          )}
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden px-7 py-7">
          {cv.summary?.trim() && (
            <section className="mb-5">
              <SectionTitle className="text-teal-800">Profile</SectionTitle>
              <p className={`${bodyTextClass} text-[13px] text-slate-700`}>
                {cv.summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-5">
              <SectionTitle className="text-teal-800">Experience</SectionTitle>
              <div className="space-y-4">
                {experience.map((item) => {
                  const bullets = splitBulletLines(item.description);
                  return (
                    <article key={item.id}>
                      <div className="flex min-w-0 items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[14px] font-bold text-slate-900">
                            {item.role || "Role"}
                          </p>
                          <p className="break-words text-[12px] italic text-slate-500">
                            {item.company || "Company"}
                          </p>
                        </div>
                        {item.duration && (
                          <p
                            className={`max-w-[34%] break-words text-right text-slate-400 ${metaTextClass}`}
                          >
                            {item.duration}
                          </p>
                        )}
                      </div>
                      {bullets.length > 0 && (
                        <BulletList
                          items={bullets}
                          className="mt-2 text-slate-700"
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-5">
              <SectionTitle className="text-teal-800">Projects</SectionTitle>
              <div className="space-y-3">
                {projects.map((project) => {
                  const bullets = splitBulletLines(project.description);
                  return (
                    <article key={project.id}>
                      <p className="break-words text-[14px] font-bold text-slate-900">
                        {project.title}
                      </p>
                      {bullets.length > 0 && (
                        <BulletList
                          items={bullets}
                          className="mt-1 text-slate-700"
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="mb-5">
              <SectionTitle className="text-teal-800">
                Achievements
              </SectionTitle>
              <BulletList items={achievements} className="text-slate-700" />
            </section>
          )}

          {links.length > 0 && (
            <section>
              <SectionTitle className="text-teal-800">Links</SectionTitle>
              <div className="min-w-0 space-y-1 text-[12px] leading-5 text-slate-600">
                {links.map((link) => (
                  <p key={link.id || link.url} className="break-all text-left">
                    <span className="font-bold text-slate-800">
                      {link.label || "Link"}:
                    </span>{" "}
                    {link.url}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageClass} p-8 text-[13px] text-slate-900`}>
      <header className="border-b-2 border-blue-600 pb-4">
        <h1 className="break-words text-[30px] font-black leading-tight">
          {cv.name || "Your Name"}
        </h1>
        {cv.title && (
          <p className="mt-1 break-words text-sm font-semibold text-blue-700">
            {cv.title}
          </p>
        )}
        {contactBits.length > 0 && (
          <p className="mt-2 break-words text-[12px] leading-5 text-slate-500">
            {contactBits.join("   |   ")}
          </p>
        )}
        {socialBits.length > 0 && (
          <p className="mt-1 break-all text-[12px] leading-5 text-slate-500">
            {socialBits.join("   |   ")}
          </p>
        )}
      </header>

      <div className="mt-5 grid gap-5">
        {cv.summary?.trim() && (
          <section>
            <SectionTitle className="text-blue-700">Summary</SectionTitle>
            <p className={`${bodyTextClass} text-slate-700`}>{cv.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionTitle className="text-blue-700">Experience</SectionTitle>
            <div className="space-y-4">
              {experience.map((item) => {
                const bullets = splitBulletLines(item.description);
                return (
                  <article key={item.id}>
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[14px] font-bold">
                          {item.role || "Role"}
                        </p>
                        <p className="break-words text-[12px] italic text-slate-500">
                          {item.company || "Company"}
                        </p>
                      </div>
                      {item.duration && (
                        <p
                          className={`max-w-[34%] break-words text-right text-slate-400 ${metaTextClass}`}
                        >
                          {item.duration}
                        </p>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <BulletList
                        items={bullets}
                        className="mt-2 text-slate-700"
                      />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle className="text-blue-700">Education</SectionTitle>
            <div className="space-y-2">
              {education.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-bold text-slate-900">
                      {item.degree}
                    </p>
                    <p className="break-words text-[12px] text-slate-500">
                      {item.school}
                    </p>
                  </div>
                  {item.year && (
                    <p
                      className={`max-w-[34%] break-words text-right text-slate-400 ${metaTextClass}`}
                    >
                      {item.year}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionTitle className="text-blue-700">Skills</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionTitle className="text-blue-700">Projects</SectionTitle>
            <div className="space-y-3">
              {projects.map((project) => {
                const bullets = splitBulletLines(project.description);
                return (
                  <article key={project.id}>
                    <p className="break-words text-[14px] font-bold text-slate-900">
                      {project.title}
                    </p>
                    {bullets.length > 0 && (
                      <BulletList
                        items={bullets}
                        className="mt-1 text-slate-700"
                      />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {(achievements.length > 0 ||
          certifications.length > 0 ||
          languages.length > 0 ||
          links.length > 0) && (
          <section className="grid gap-5 md:grid-cols-2">
            {achievements.length > 0 && (
              <div>
                <SectionTitle className="text-blue-700">
                  Achievements
                </SectionTitle>
                <BulletList items={achievements} className="text-slate-700" />
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <SectionTitle className="text-blue-700">
                  Certifications
                </SectionTitle>
                <BulletList items={certifications} className="text-slate-700" />
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <SectionTitle className="text-blue-700">Languages</SectionTitle>
                <BulletList items={languages} className="text-slate-700" />
              </div>
            )}
            {links.length > 0 && (
              <div
                className={
                  achievements.length > 0 ||
                  certifications.length > 0 ||
                  languages.length > 0
                    ? "md:col-span-2"
                    : ""
                }
              >
                <SectionTitle className="text-blue-700">Links</SectionTitle>
                <div className="min-w-0 space-y-1 text-[12px] leading-5 text-slate-600">
                  {links.map((link) => (
                    <p
                      key={link.id || link.url}
                      className="break-all text-left"
                    >
                      <span className="font-bold text-slate-800">
                        {link.label || "Link"}:
                      </span>{" "}
                      {link.url}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreviewHtml;
