require('dotenv').config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token || token !== process.env.JWT_TOKEN) {
    return res.status(403).json({ message: 'Token inválido o faltante' });
    }

    next();
}

module.exports = authMiddleware;
