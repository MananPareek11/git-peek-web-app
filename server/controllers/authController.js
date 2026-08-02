import axios from 'axios';
import AuthUser from '../models/AuthUser.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user (Normal Login / Email)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, githubUsername } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await AuthUser.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Optional avatar fetch if githubUsername is provided
    let avatarUrl = '';
    if (githubUsername) {
      avatarUrl = `https://github.com/${githubUsername}.png`;
    }

    const user = await AuthUser.create({
      name,
      email: email.toLowerCase(),
      password,
      githubUsername: githubUsername || '',
      avatar: avatarUrl,
      authProvider: 'local',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      avatar: user.avatar,
      authProvider: user.authProvider,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token (Normal Login / Email)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const user = await AuthUser.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        avatar: user.avatar,
        authProvider: user.authProvider,
        token,
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get GitHub OAuth Authorization URL
// @route   GET /api/auth/github/url
// @access  Public
export const getGithubAuthUrl = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/callback';

  if (!clientId) {
    // If GITHUB_CLIENT_ID is not configured in env, return flag indicating dev fallback mode
    return res.json({
      configured: false,
      message: 'GitHub OAuth Client ID not set in server .env',
    });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=user:email,read:user`;

  res.json({
    configured: true,
    url: githubAuthUrl,
  });
};

// @desc    GitHub OAuth Callback (Exchange code for token & authenticate)
// @route   POST /api/auth/github/callback
// @access  Public
export const githubCallback = async (req, res, next) => {
  try {
    const { code, githubUsername } = req.body;

    // Handle Direct / Demo GitHub Login (for quick testing or fallback when OAuth secret is absent)
    if (githubUsername && !code) {
      try {
        const ghRes = await axios.get(`https://api.github.com/users/${githubUsername}`, {
          headers: {
            'User-Agent': 'GitPeek-App',
            ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
          },
        });

        const ghUser = ghRes.data;
        let user = await AuthUser.findOne({
          $or: [
            { githubId: String(ghUser.id) },
            { githubUsername: new RegExp(`^${ghUser.login}$`, 'i') },
          ],
        });

        if (!user) {
          user = await AuthUser.create({
            name: ghUser.name || ghUser.login,
            githubId: String(ghUser.id),
            githubUsername: ghUser.login,
            avatar: ghUser.avatar_url,
            authProvider: 'github',
          });
        } else {
          user.githubId = String(ghUser.id);
          user.githubUsername = ghUser.login;
          user.name = ghUser.name || user.name;
          user.avatar = ghUser.avatar_url;
          await user.save();
        }

        const token = generateToken(user._id);

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email || '',
          githubUsername: user.githubUsername,
          avatar: user.avatar,
          authProvider: user.authProvider,
          token,
        });
      } catch (err) {
        return res.status(404).json({ message: `GitHub username '${githubUsername}' not found` });
      }
    }

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        message: 'GitHub OAuth credentials not configured on server',
      });
    }

    // 1. Exchange code for GitHub access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ message: 'Failed to obtain access token from GitHub' });
    }

    // 2. Fetch user profile from GitHub API
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GitPeek-App',
      },
    });

    const ghUser = userResponse.data;

    // Fetch email if private/missing from base user profile
    let primaryEmail = ghUser.email;
    if (!primaryEmail) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'GitPeek-App',
          },
        });
        if (Array.isArray(emailsResponse.data)) {
          const primaryObj = emailsResponse.data.find((e) => e.primary && e.verified) || emailsResponse.data[0];
          if (primaryObj && primaryObj.email) {
            primaryEmail = primaryObj.email;
          }
        }
      } catch (e) {
        // Email fetch failed, proceed with profile data
      }
    }

    // 3. Find or Create AuthUser (Search by githubId, githubUsername, or email)
    const searchConditions = [
      { githubId: String(ghUser.id) },
      { githubUsername: new RegExp(`^${ghUser.login}$`, 'i') },
    ];
    if (primaryEmail) {
      searchConditions.push({ email: primaryEmail.toLowerCase() });
    }

    let user = await AuthUser.findOne({ $or: searchConditions });

    if (!user) {
      const userDataToCreate = {
        name: ghUser.name || ghUser.login,
        githubId: String(ghUser.id),
        githubUsername: ghUser.login,
        avatar: ghUser.avatar_url,
        authProvider: 'github',
      };
      if (primaryEmail) {
        userDataToCreate.email = primaryEmail.toLowerCase();
      }

      user = await AuthUser.create(userDataToCreate);
    } else {
      user.githubId = String(ghUser.id);
      user.githubUsername = ghUser.login;
      user.avatar = ghUser.avatar_url;
      if (ghUser.name) user.name = ghUser.name;
      if (primaryEmail && !user.email) user.email = primaryEmail.toLowerCase();
      if (user.authProvider === 'local') user.authProvider = 'both';
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email || '',
      githubUsername: user.githubUsername,
      avatar: user.avatar,
      authProvider: user.authProvider,
      token,
    });
  } catch (error) {
    console.error('GitHub Auth Callback Error:', error.message);
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Link GitHub Account / Username
// @route   POST /api/auth/link-github
// @access  Private
export const linkGithub = async (req, res, next) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    // Verify username on GitHub
    const ghRes = await axios.get(`https://api.github.com/users/${githubUsername}`, {
      headers: {
        'User-Agent': 'GitPeek-App',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });

    const user = await AuthUser.findById(req.user._id);
    user.githubUsername = ghRes.data.login;
    user.githubId = String(ghRes.data.id);
    if (!user.avatar) user.avatar = ghRes.data.avatar_url;
    if (user.authProvider === 'local') user.authProvider = 'both';

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      githubUsername: user.githubUsername,
      avatar: user.avatar,
      authProvider: user.authProvider,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    next(error);
  }
};

