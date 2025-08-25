import { register, login, registerCustomer, forgotPassword, verifyOtp, resetPassword } from './service.js';

export async function registerController(req, res) {
  const created = await register(req.body);
  res.status(201).json(created);
}

export async function registerCustomerController(req, res) {
  const created = await registerCustomer(req.body);
  res.status(201).json(created);
}

export async function loginController(req, res) {
  // console.log(req.body, 'req.body');
  const { token, user } = await login(req.body);
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  // Also include token in response for frontend access
  res.json({ user: { ...user, token } });
}

export async function logoutController(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.status(204).send();
}

export async function forgotPasswordController(req, res) {
  const result = await forgotPassword(req.body);
  res.json(result);
}

export async function verifyOtpController(req, res) {
  const result = await verifyOtp(req.body);
  res.json(result);
}

export async function resetPasswordController(req, res) {
  const result = await resetPassword(req.body);
  res.json(result);
}


