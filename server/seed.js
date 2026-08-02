import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuthUser from './models/AuthUser.js';
import User from './models/User.js';
import Repository from './models/Repository.js';
import SearchHistory from './models/SearchHistory.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/github-explorer';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      AuthUser.deleteMany({}),
      User.deleteMany({}),
      Repository.deleteMany({}),
      SearchHistory.deleteMany({}),
    ]);
    console.log('Cleared existing database records.');

    // 1. Seed Auth Users
    const authUsers = await AuthUser.create([
      {
        name: 'Demo Admin',
        email: 'admin@gitpeek.com',
        password: 'password123',
        githubUsername: 'octocat',
        githubId: '583231',
        avatar: 'https://github.com/octocat.png',
        authProvider: 'both',
      },
      {
        name: 'Linus Torvalds',
        email: 'torvalds@kernel.org',
        password: 'password123',
        githubUsername: 'torvalds',
        githubId: '1024025',
        avatar: 'https://github.com/torvalds.png',
        authProvider: 'github',
      },
      {
        name: 'Jane Developer',
        email: 'jane@example.com',
        password: 'password123',
        githubUsername: 'janedoe',
        avatar: 'https://github.com/github.png',
        authProvider: 'local',
      },
    ]);
    console.log(`Seeded ${authUsers.length} AuthUsers.`);

    // 2. Seed Cached GitHub Users
    const cachedUsers = await User.create([
      {
        githubId: 583231,
        username: 'octocat',
        name: 'The Octocat',
        avatar: 'https://github.com/octocat.png',
        bio: 'GitHub mascot and sample user profile.',
        company: '@github',
        location: 'San Francisco',
        blog: 'https://github.blog',
        twitter: 'github',
        followers: 10500,
        following: 9,
        publicRepos: 8,
        publicGists: 4,
        profileUrl: 'https://github.com/octocat',
        hireable: true,
        createdAtGithub: new Date('2011-01-25'),
        lastFetched: new Date(),
      },
      {
        githubId: 1024025,
        username: 'torvalds',
        name: 'Linus Torvalds',
        avatar: 'https://github.com/torvalds.png',
        bio: 'Creator of Linux & Git.',
        company: 'Linux Foundation',
        location: 'Portland, OR',
        blog: 'https://kernel.org',
        twitter: '',
        followers: 215000,
        following: 0,
        publicRepos: 6,
        publicGists: 0,
        profileUrl: 'https://github.com/torvalds',
        hireable: false,
        createdAtGithub: new Date('2011-09-03'),
        lastFetched: new Date(),
      },
      {
        githubId: 69631,
        username: 'facebook',
        name: 'Meta Open Source',
        avatar: 'https://github.com/facebook.png',
        bio: 'Open source projects from Meta.',
        company: 'Meta',
        location: 'Menlo Park, CA',
        blog: 'https://opensource.fb.com',
        twitter: 'metaopensource',
        followers: 43000,
        following: 0,
        publicRepos: 120,
        publicGists: 0,
        profileUrl: 'https://github.com/facebook',
        hireable: false,
        createdAtGithub: new Date('2009-04-02'),
        lastFetched: new Date(),
      },
    ]);
    console.log(`Seeded ${cachedUsers.length} Cached Users.`);

    // 3. Seed Repositories
    const repos = await Repository.create([
      {
        githubRepoId: 182212,
        owner: 'octocat',
        name: 'git-consortium',
        description: 'This repo is for demonstrating GitHub features.',
        language: 'JavaScript',
        stars: 342,
        forks: 189,
        issues: 5,
        visibility: 'public',
        defaultBranch: 'master',
        repoUrl: 'https://github.com/octocat/git-consortium',
        updatedAtGithub: new Date('2025-10-12'),
        lastFetched: new Date(),
      },
      {
        githubRepoId: 1327019,
        owner: 'octocat',
        name: 'Spoon-Knife',
        description: 'This repo is your guide to forking projects.',
        language: 'HTML',
        stars: 12400,
        forks: 142000,
        issues: 12,
        visibility: 'public',
        defaultBranch: 'main',
        repoUrl: 'https://github.com/octocat/Spoon-Knife',
        updatedAtGithub: new Date('2026-01-15'),
        lastFetched: new Date(),
      },
      {
        githubRepoId: 2325298,
        owner: 'torvalds',
        name: 'linux',
        description: 'Linux kernel source tree',
        language: 'C',
        stars: 185000,
        forks: 55000,
        issues: 0,
        visibility: 'public',
        defaultBranch: 'master',
        repoUrl: 'https://github.com/torvalds/linux',
        updatedAtGithub: new Date('2026-02-01'),
        lastFetched: new Date(),
      },
      {
        githubRepoId: 10270250,
        owner: 'facebook',
        name: 'react',
        description: 'The library for web and native user interfaces.',
        language: 'JavaScript',
        stars: 228000,
        forks: 46200,
        issues: 890,
        visibility: 'public',
        defaultBranch: 'main',
        repoUrl: 'https://github.com/facebook/react',
        updatedAtGithub: new Date('2026-02-02'),
        lastFetched: new Date(),
      },
    ]);
    console.log(`Seeded ${repos.length} Repositories.`);

    // 4. Seed Search History
    const history = await SearchHistory.create([
      { username: 'octocat', searchedAt: new Date(Date.now() - 3600000) },
      { username: 'torvalds', searchedAt: new Date(Date.now() - 1800000) },
      { username: 'facebook', searchedAt: new Date(Date.now() - 900000) },
      { username: 'gaearon', searchedAt: new Date(Date.now() - 300000) },
    ]);
    console.log(`Seeded ${history.length} Search History entries.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
