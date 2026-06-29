const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.' });
    }

    next();
  };
};

module.exports = roleMiddleware;
