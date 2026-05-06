import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../config/db.js"
import { Feedback, Sessions, SkinReports, Users } from "../drizzle/schema.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constant.js";

const saltRounds = Number(process.env.SALTROUNDS) || 10;


export const getUserByEmail = async(email) => {
    return await db
            .select()
            .from(Users)
            .where(eq(Users.email, email));
}


export const hashThePassword = async(password) => {
    return await bcrypt.hash(password, saltRounds);
}

export const createUser =  async({name, email, password}) => {
    return await db
                    .insert(Users)
                    .values({name, email, password})
                    .$returningId();
}


export const comparePassword = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

export const createFeedback = async({userId, message}) => {
    console.log(userId, message);
    return await db
                    .insert(Feedback)
                    .values({userId, message});
}


export const authenticateUser = async({req, res, id, name, email}) => {
    // console.log(id, name, email);

    const session =  await createSession({
        userId: id,
        ip : req.clientIp || req.ip,
        userAgent : req.headers["user-agent"],
    });

    // console.log(session);

    const accessToken = await createAccessToken({
        userId: id,
        name,
        email,
        sessionId: session[0].id
    })

    // console.log(accessToken);

    const refreshToken = await createRefreshToken(session[0].id);

    // console.log(refreshToken);

    const AccessBaseConfig = { httpOnly: false, withCredentials: true, sameSite: "Lax",  };
    const RefreshBaseConfig = { httpOnly: true, withCredentials:true, sameSite: "Strict"  };


    res.cookie("access_token", accessToken, {
        ...AccessBaseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY, //1*60*1000 ,
    });

    res.cookie("refresh_token", refreshToken, {
        ...RefreshBaseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY, // 10*60*1000 //,
    });

    return {
        accessToken,
        refreshToken
    }
}

export const createSession = async({userId, ip, userAgent}) => {
    

    await db
            .delete(Sessions)
            .where(eq(Sessions.userId, userId));

    return await db
                    .insert(Sessions)
                    .values({userId, ip, userAgent})
                    .$returningId();
}

export const createAccessToken = async({userId, name, email, sessionId}) => {
    // console.log(userId, name, email, sessionId);
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment variables.");
        }

        const payload = { userId, name, email, sessionId };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY, //5*60*1000, // Example: 15 minutes
            algorithm: 'HS256' // Explicitly defining the algorithm is a security best practice
        });
    } catch (error) {
        console.error("Error signing JWT:", error.message);
        throw new Error("Token generation failed.");
    }
}

export const createRefreshToken = async(sessionId) => {
    // console.log(sessionId);
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment variables.");
        }

        const payload = { sessionId };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY, // 5*60*1000, // // Example: 15 minutes
            algorithm: 'HS256' // Explicitly defining the algorithm is a security best practice
        });
    } catch (error) {
        console.error("Error signing JWT:", error.message);
        throw new Error("Token generation failed.");
    }
}


export const verifyToken = async(token) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment variables.");
        }

        return jwt.verify(token, process.env.JWT_SECRET)

    } catch (error) {
        console.error("Error signing JWT:", error.message);
        throw new Error("Token verification failed.");
    }
}


export const newTokensGenerator = async(refreshToken) => {
    try{
        const decodeToken = await verifyToken(refreshToken);

        // console.log("token",decodeToken);

        const currentSession = await findSessionById(decodeToken.sessionId)

        // console.log("Session",currentSession);
        

        if (!currentSession || !currentSession.valid) {
            throw new Error("Invalid session");
        }

        const user = await findUserById(currentSession.userId);

        if (!user) throw new Error("Invalid User");

        const [scanCountResult, lastSessionResult] = await Promise.all([
                        scanCount(user.id),
                        lastActive(user.id)
                    ]);
            
            const totalScans = scanCountResult[0]?.count || 0;
    
            const rawDate = lastSessionResult[0]?.lastActive;
            const lastActiveFormatted = rawDate 
                ? formatLastActive(rawDate) 
                : "Just now";

        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            sessionId: currentSession.id,
            totalScans,
            lastActive: lastActiveFormatted
        }
        
        const newAccessToken = createAccessToken(userInfo);
        const newRefreshToken = createRefreshToken(currentSession.id);
        
        return {
          newAccessToken,
          newRefreshToken,
          user: userInfo,
        };

        // console.log(user);
    }catch(error){
        throw new Error(error);
    }
}


const findSessionById = async(id) =>{
    const [session] = await db
        .select()
        .from(Sessions)
        .where(eq(Sessions.id, id));

    return session;
}


const findUserById = async(id) => {
    const [user] = await db
        .select({
            id: Users.id,
            name: Users.name,
            email: Users.email
        })
        .from(Users)
        .where(eq(Users.id, id));

    return user;
}


export const checkIfAdmin = async(userId) => {
    const [res] = await db
                        .select({ isAdmin: Users.isAdmin })
                        .from(Users)
                        .where(eq(Users.id, userId));

                        
    return res ? res.isAdmin : false;
}

export const saveReport = async(data) => {
    return await db
                    .insert(SkinReports)
                    .values(data)
                    .$returningId();

}


export const getUserReports = async(userId) => {
    return await db
        .select()
        .from(SkinReports)
        .where(eq(SkinReports.userId, userId))
        .orderBy(desc(SkinReports.createdAt));
}

export const getAllUsers = async () => {
    return await db.select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        isAdmin: Users.isAdmin,
        createdAt: Users.createdAt
    }).from(Users);
};

export const getAllFeedback = async () => {
    return await db.select().from(Feedback); 
};

export const getAllReports = async () => {
    return await db.select().from(SkinReports); 
};

export const scanCount = async(userId) => {
    return await db
            .select({ count: sql`count(${SkinReports.id})` })
            .from(SkinReports)
            .where(eq(SkinReports.userId, userId));
}

export const lastActive = async(userId) => {
    return await db
            .select({ lastActive: Sessions.updatedAt })
            .from(Sessions)
            .where(eq(Sessions.userId, userId))
            .orderBy(desc(Sessions.updatedAt))
            .limit(1);
}


export const formatLastActive = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}