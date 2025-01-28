export const createCookie=(res,token)=>{

    res.cookie('token', token, {
        httpOnly: true, // Prevent client-side access to the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        path: '/', // Apply the cookie to the entire domain
        maxAge: 60 * 60 * 1000, // Optional: Match JWT expiration (1 hour in this case)
    });
    

} 


