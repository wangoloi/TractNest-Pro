import { register, login, registerCustomer } from './service.js';

export async function registerController(req, res) {
  const created = await register(req.body);
  res.status(201).json(created);
}

export async function registerCustomerController(req, res) {
  const created = await registerCustomer(req.body);
  res.status(201).json(created);
}

export async function loginController(req, res) {
  const { token, user } = await login(req.body);
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ user });
}

export async function logoutController(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.status(204).send();
}


