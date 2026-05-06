import { createSelectSchema } from "drizzle-zod";
import { formatLastActive, getUserByEmail, lastActive, newTokensGenerator, scanCount, verifyToken } from "../services/auth.services.js";
import { email } from "zod";


export const verifyAuthentication = async(req, res, next) => {
    // console.log(req.cookies)

    const accessToken=req.cookies?.access_token || null;
    const refreshToken=req.cookies?.refresh_token || null;

    // console.log(accessToken);
    // console.log(refreshToken);

    req.user = null;

    if(!accessToken && !refreshToken){
        return res
            .status(401)
            .json({ error: "Unauthorized HTTP, Tokens not provided" });

        return next();
    }

    if(accessToken) {
        try{
            const decodedToken = await verifyToken(accessToken);
            // console.log("Users---",decodedToken);

            const [userExist] = await getUserByEmail(decodedToken.email);
            
            if(!userExist){
                return res.status(400).json({error: "Invalid email or password"});
            }

            const [scanCountResult, lastSessionResult] = await Promise.all([
                        scanCount(decodedToken.userId),
                        lastActive(decodedToken.userId)
                    ]);
            
            const totalScans = scanCountResult[0]?.count || 0;
    
            const rawDate = lastSessionResult[0]?.lastActive;
            const lastActiveFormatted = rawDate 
                ? formatLastActive(rawDate) 
                : "Just now";
            
            const user = {
                id: decodedToken.userId,
                name: decodedToken.name,
                email: decodedToken.email,
                totalScans,
                lastActive: lastActiveFormatted
            }

            req.user = user;

            // console.log("req",req.user);

            return next();
        }catch(error){
            if (!refreshToken) return res.status(401).json({ error: "Invalid token" });
            // return res.status(401).json({error: "accessToken is invalid"});
        }
    }

    if(refreshToken){
        try{
            
            const {newAccessToken, newRefreshToken, user} = await newTokensGenerator(refreshToken);
            // console.log("hello");
            // const safeUser = createSelectSchema(user);

            // console.log(safeUser);
            delete user.sessionId;
            req.user=user;

            // console.log("User--",req.user);

            // console.log("new",newAccessToken);
            // console.log("new",newRefreshToken);


            const AccessBaseConfig = { httpOnly: false, withCredentials: true, sameSite: "Lax",  };
            const RefreshBaseConfig = { httpOnly: true, withCredentials:true, sameSite: "Strict" };
            
            
            res.cookie("access_token", newAccessToken, {
                ...AccessBaseConfig,
                maxAge: ACCESS_TOKEN_EXPIRY,
            });
            
            res.cookie("refresh_token", newRefreshToken, {
                ...RefreshBaseConfig,
                maxAge: REFRESH_TOKEN_EXPIRY,
            });
        
            next();

        }catch(error){
            // return res.status(400).json({error:error.message});
            return res.status(401).json({ error: "Session expired, please login again " });
        }
    }

    next();
}