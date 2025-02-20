export const createCookie = (res, token) => {
    res.cookie('token', token, {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        path: '/', // Cookie accessible across all routes
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });
};

// export const createCookie = (res, token) => {
//     res.cookie('token', token, {
//         httpOnly: true,  
//         secure: process.env.NODE_ENV === 'production' ? false : true, 
//         sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',  
//         path: '/',
//         maxAge: 24 * 60 * 60 * 1000  
//     });
// };


