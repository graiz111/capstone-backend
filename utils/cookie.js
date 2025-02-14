export const createCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true, // Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
        sameSite: 'strict', // Helps prevent CSRF attacks
        path: '/', // Cookie accessible across all routes
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });
};



