"""Service for managing admin profile."""

from typing import Optional

from src.domain.entities.admin_profile import (
    AdminProfile,
    ContactLink,
    WorkExperience,
    AboutSection,
    CurrentlyItem,
)
from src.domain.repositories.admin_profile_repository import AdminProfileRepository
from src.infrastructure.config.settings import get_settings
from src.infrastructure.auth.password import hash_password, verify_password


class AdminProfileService:
    """Service for admin profile operations."""

    def __init__(self, profile_repository: AdminProfileRepository):
        self._repository = profile_repository
        self._settings = get_settings()

    async def get_profile(self) -> AdminProfile:
        """Get profile from DB, or initialize from env vars if not exists."""
        profile = await self._repository.get()
        if not profile:
            profile = await self._initialize_from_settings()
        return profile

    async def get_public_profile(self) -> dict:
        """Get profile data safe for public API (no password, no birthday)."""
        profile = await self.get_profile()
        return {
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "nickname": profile.nickname,
            "display_name": profile.display_name,
            "bio": profile.bio,
            "skills": profile.skills,
            "work_experience": [we.to_dict() for we in profile.work_experience],
            "about_sections": [s.to_dict() for s in profile.about_sections],
            "contact_links": [cl.to_dict() for cl in profile.contact_links],
            "currently": [c.to_dict() for c in profile.currently],
        }

    async def get_admin_profile(self) -> dict:
        """Get full profile data for admin (includes username, birthday, no password)."""
        profile = await self.get_profile()
        return {
            "username": profile.username,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "nickname": profile.nickname,
            "display_name": profile.display_name,
            "birthday": profile.birthday,
            "bio": profile.bio,
            "skills": profile.skills,
            "work_experience": [we.to_dict() for we in profile.work_experience],
            "about_sections": [s.to_dict() for s in profile.about_sections],
            "contact_links": [cl.to_dict() for cl in profile.contact_links],
            "currently": [c.to_dict() for c in profile.currently],
        }

    async def update_profile(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        nickname: Optional[str] = None,
        birthday: Optional[str] = None,
        bio: Optional[str] = None,
        skills: Optional[list] = None,
        work_experience: Optional[list] = None,
        about_sections: Optional[list] = None,
        contact_links: Optional[list] = None,
        currently: Optional[list] = None,
    ) -> AdminProfile:
        """Update profile fields (not credentials)."""
        profile = await self.get_profile()

        work_exp_entities = None
        if work_experience is not None:
            work_exp_entities = [
                WorkExperience.from_dict(we) if isinstance(we, dict) else we
                for we in work_experience
            ]

        about_sections_entities = None
        if about_sections is not None:
            about_sections_entities = [
                AboutSection.from_dict(s) if isinstance(s, dict) else s
                for s in about_sections
            ]

        contact_links_entities = None
        if contact_links is not None:
            contact_links_entities = [
                ContactLink.from_dict(cl) if isinstance(cl, dict) else cl
                for cl in contact_links
            ]

        currently_entities = None
        if currently is not None:
            currently_entities = [
                CurrentlyItem.from_dict(c) if isinstance(c, dict) else c
                for c in currently
            ]

        profile.update(
            first_name=first_name,
            last_name=last_name,
            nickname=nickname,
            birthday=birthday,
            bio=bio,
            skills=skills,
            work_experience=work_exp_entities,
            about_sections=about_sections_entities,
            contact_links=contact_links_entities,
            currently=currently_entities,
        )

        await self._repository.save(profile)
        return profile

    async def update_credentials(
        self,
        current_password: str,
        username: Optional[str] = None,
        new_password: Optional[str] = None,
    ) -> AdminProfile:
        """Update username and/or password with verification."""
        profile = await self.get_profile()

        if not verify_password(current_password, profile.hashed_password):
            raise ValueError("Current password is incorrect")

        new_hashed_password = None
        if new_password:
            new_hashed_password = hash_password(new_password)

        profile.update_credentials(
            username=username,
            hashed_password=new_hashed_password,
        )

        await self._repository.save(profile)
        return profile

    async def authenticate(self, username: str, password: str) -> Optional[AdminProfile]:
        """Authenticate admin with username and password."""
        profile = await self._repository.get()

        if not profile:
            if (
                username == self._settings.admin_username
                and password == self._settings.admin_password
            ):
                profile = await self._initialize_from_settings()
                return profile
            return None

        if profile.username == username and verify_password(password, profile.hashed_password):
            return profile

        return None

    async def _initialize_from_settings(self) -> AdminProfile:
        """Create initial profile from env vars with default About page content."""
        hashed_pwd = hash_password(self._settings.admin_password)

        work_experience = [
            WorkExperience(
                company="Netcompany",
                role="AI Engineer",
                start_date="2024-01",
                end_date=None,
                description="Focus on RAG systems, MCP servers, and Azure AI services.",
                is_current=True,
            ),
            WorkExperience(
                company="Msensis S.A.",
                role="ML Engineer",
                start_date="2022-06",
                end_date="2023-12",
                description="GenAI projects, Azure AI services, and Python backend development.",
                is_current=False,
            ),
        ]

        about_sections = [
            AboutSection(
                id="introduction",
                title="Hey there!",
                content="""I'm Dimitris Koutselis, an AI Engineer based in Thessaloniki, Greece.
I spend most of my days building intelligent systems, experimenting with
LLMs, and trying to figure out how to push the boundaries of what AI can do.

This website is my little digital space — a place where I share what I'm
learning, showcase projects I'm proud of, and occasionally ramble about
things that interest me.""",
            ),
            AboutSection(
                id="journey",
                title="The Journey So Far",
                content="""I graduated from the Information and Electronics Engineering department
at International Hellenic University. After that, I dove headfirst into
machine learning during my internship at Msensis S.A., where I ended up
staying for over a year working on GenAI projects, Azure AI services, and
Python backend development.

These days, I'm part of the team at Netcompany, where I focus on RAG systems,
MCP servers, and Azure AI services. Every day brings something new to learn,
which is exactly how I like it.""",
            ),
            AboutSection(
                id="skills",
                title="What I Work With",
                content="""My toolkit revolves around Python and the modern AI stack. I work a lot with
FastAPI for backends, LangGraph and LangChain for building agent systems,
and various vector databases for RAG implementations. Docker is my friend
for keeping things reproducible.""",
            ),
            AboutSection(
                id="philosophy",
                title="How I Think",
                content="""I believe details matter. Small things compound into big outcomes, and
getting the little stuff right is often what separates good work from great work.

I try to base my opinions on facts and data rather than ideology. In fact,
I prefer not to have strong opinions on things I don't deeply understand —
there's too much noise in the world already. When I do form an opinion,
it's usually because I've spent time digging into the subject.

Technology genuinely excites me. I see it as one of the most powerful tools
for progress we have, and I want to be part of pushing it forward responsibly.""",
            ),
            AboutSection(
                id="beyond_code",
                title="Beyond the Code",
                content="""When I'm not coding, you'll probably find me consuming stories in every
format possible — movies, series, books, video games, documentaries, podcasts.
I'm a sucker for a good narrative, regardless of the medium.

I also spend a fair amount of time exploring AI tools and trying to figure
out how to maximize their potential. It's equal parts hobby and professional
development at this point.""",
            ),
            AboutSection(
                id="story_analysis",
                title="A Question I Always Ask",
                content="""Whenever I watch a movie, read a book, or play a game, one question always
comes to mind: "Why should I root for the protagonist and not the antagonist?"

Think about it — how often do we support the hero simply because the story
tells us to? Are Vito Corleone's motives really nobler than his rivals'?
Is Daenerys truly more fit to rule than Cersei? Why is Darth Vader the villain
when both sides are willing to kill for their cause?

Of course, some stories have clear moral lines — American History X or
Snowpiercer come to mind. And the best ones, like Parasite,
deliberately blur those boundaries until you understand the characters without
necessarily endorsing them. Those are the narratives that stay with me.""",
            ),
            AboutSection(
                id="connect",
                title="Let's Connect",
                content="""Feel free to reach out if you want to chat about AI, collaborate on something
interesting, or just say hi.""",
            ),
        ]

        contact_links = [
            ContactLink(
                platform="github",
                url="https://github.com/DimitrisKoutselis",
                label="GitHub",
            ),
            ContactLink(
                platform="email",
                url="mailto:dimitriskoytselis@gmail.com",
                label="Email Me",
            ),
        ]

        skills = [
            "Python",
            "FastAPI",
            "LangGraph",
            "LangChain",
            "RAG",
            "Docker",
            "Azure AI",
            "MCP Servers",
        ]

        profile = AdminProfile.create(
            username=self._settings.admin_username,
            hashed_password=hashed_pwd,
            first_name=self._settings.admin_first_name,
            last_name=self._settings.admin_last_name,
            nickname=self._settings.admin_nickname,
            birthday=self._settings.admin_birthday or None,
            bio="I'm Dimitris Koutselis, an AI Engineer based in Thessaloniki, Greece.",
            skills=skills,
            work_experience=work_experience,
            about_sections=about_sections,
            contact_links=contact_links,
        )

        await self._repository.save(profile)
        return profile
