const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const bip39 = require('bip39');
const pool = require('../db');

const router = express.Router();

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// REGISTER - generates recovery phrase + private key + wallet address
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate BIP-39 recovery phrase (12 words)
    const recoveryPhrase = bip39.generateMnemonic();

    // Generate Ethereum wallet from mnemonic
    const seed = await bip39.mnemonicToSeed(recoveryPhrase);
    const wallet = ethers.HDNodeWallet.fromSeed(seed);
    const privateKey = wallet.privateKey;
    const walletAddress = wallet.address;

    // Save user – including wallet_address
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, private_key, wallet_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, wallet_address`,
      [email, passwordHash, privateKey, walletAddress]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created',
      token,
      recoveryPhrase, // shown only once
      user: { 
        id: user.id, 
        email: user.email,
        walletAddress: user.wallet_address 
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// VERIFY FOR PRIVATE KEY
router.post('/verify-for-private-key', authenticateJWT, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.userId;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash, private_key FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    if (!user.private_key) {
      return res.status(404).json({ error: 'No private key found' });
    }

    res.json({
      success: true,
      privateKey: user.private_key
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE ACCOUNT NAME
router.patch('/update-account-name', authenticateJWT, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Valid name is required' });
  }

  const trimmedName = name.trim().slice(0, 100);

  try {
    const result = await pool.query(
      'UPDATE users SET account_name = $1 WHERE id = $2 RETURNING account_name',
      [trimmedName, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      accountName: result.rows[0].account_name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET current user info (includes wallet_address)
router.get('/me', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT id, email, account_name, wallet_address FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      accountName: user.account_name || 'Account 1',
      walletAddress: user.wallet_address || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user's tokens and total balance
router.get('/wallet/tokens', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const tokensResult = await pool.query(
      `SELECT token_symbol, amount 
       FROM user_tokens 
       WHERE user_id = $1 
       ORDER BY token_symbol ASC`,
      [userId]
    );

    const userTokens = tokensResult.rows;

    // Mock prices (replace with real price API later)
    const mockPrices = {
      ETH: 2500,
      BTC: 56000,
      USDC: 1,
      USDT: 1,
      BNB: 550,
      SOL: 140,
      XRP: 0.60,
      ADA: 0.58,
      DOGE: 0.12,
      LINK: 15.25,
    };

    let totalUsd = 0;
    const formattedTokens = userTokens.map(row => {
      const price = mockPrices[row.token_symbol] || 0;
      const usdValue = (row.amount * price).toFixed(2);
      totalUsd += parseFloat(usdValue);

      return {
        symbol: row.token_symbol,
        amount: Number(row.amount).toFixed(6),
        value: `$${usdValue}`
      };
    });

    res.json({
      totalBalance: `$${totalUsd.toFixed(2)}`,
      tokens: formattedTokens.length > 0 ? formattedTokens : []
    });
  } catch (err) {
    console.error('Wallet tokens error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MUST be GET /wallet-address (no /user/ prefix unless you added it)
router.get('/wallet-address', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].wallet_address) {
      return res.status(404).json({ 
        error: 'No wallet address found for this user' 
      });
    }

    res.json({ walletAddress: result.rows[0].wallet_address });
  } catch (err) {
    console.error('Wallet address fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;