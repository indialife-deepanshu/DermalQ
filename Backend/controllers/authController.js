import { authenticateUser,
         checkIfAdmin,
         comparePassword,
         createFeedback,
         createUser,
         formatLastActive,
         getAllFeedback,
         getAllReports,
         getAllUsers,
         getUserByEmail,
         getUserReports,
         hashThePassword,
         lastActive,
         saveReport, 
         scanCount} from "../services/auth.services.js";
import { canUploadToCloudinary } from "../utils/cloudinaryGuard.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { insertFeedbackSchema, insertUserSchema, loginSchema, publicUserSchema } from "../validators/auth_validator.js";
import { insertSkinReportSchema } from "../validators/skin_report_validator.js";



export const Register = async(req, res) => {
    if(req.user) return res.redirect("/");

    // console.log(req.body);
    const {data, error} = insertUserSchema.safeParse(req.body);

    if(error) {
        const err = error.issues.map((curElem) => curElem.message);
        // console.log(err);
        return res.status(400).json({error: err})
    }

    // console.log(data);

    const {name, email, password} = data;

    try {
        const [userExist] = await getUserByEmail(email);

        if(userExist){
            // console.log("User Exist: ",userExist)
            return res.status(409).json({error: "User already exists!"});
        }

       
        const hashedPassword = await hashThePassword(password);
        

        const [newUser] = await createUser({name, email, password: hashedPassword});
        
        // console.log("User-----",  newUser);

        if(!newUser){
            // console.log("User Exist: ",userExist)
            return res.status(500).json({error: "Database Error---"});
        }


        const {accessToken, refreshToken} = await authenticateUser({req, res, id: newUser.id, name, email});
        
        // return res.status(200).json({ userId: newUser});

        // return res.status(200).json({ 
        //     accessToken,
        //     refreshToken
        // });
        res.status(200).json({
            message : "Register Successfull",
        })

    } catch (err) {
        // console.error("Registration Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


export const Login = async(req, res) => {
    if(req.user) return res.redirect("/");

   
    const {data, error} = loginSchema.safeParse(req.body);
    

    if(error) {
        const err = error.issues.map((curElem) => curElem.message);
        // console.log(err);
        return res.status(400).json({error: err})
    }
    

    const {email, password} = data;

    try {
        const [userExist] = await getUserByEmail(email);

        if(!userExist){
            return res.status(400).json({error: "Invalid email or password"});
        }
        

        const safeUser = publicUserSchema.parse(userExist);
       
        const isPasswordValid = await comparePassword(password,userExist.password);
        // console.log("here");
        if(!isPasswordValid){
            return res.status(400).json({error: "Invalid email or password"})
        }

        
        const {accessToken, refreshToken} = await authenticateUser({req, res, id: userExist.id, name: userExist.name, email: userExist.email});
        
        // return res.status(200).json({ user: safeUser});

        // console.log("Cookies---", req.cookies);
        // return res.status(200).json({ 
        //     accessToken,
        //     refreshToken
        // });

        res.status(200).json({
            message : "Login Successfull",
        })  

    } catch (err) {
        // console.error("Registration Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


export const Feedbacks = async(req, res) => {
    if(!req.user) {
        return res.status(401).json({ error: "Please log in first" });
    }

    const {data, error} = insertFeedbackSchema.safeParse(req.body);

    if(error) {
        return res.status(400).json({ error: error.issues.map(e => e.message) });
    }

    try {
        // console.log(data);
        await createFeedback({
            message: data.message,
            userId: req.user.id
        });

        return res.status(201).json({ success: "Feedback submitted!" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to save feedback" });
    }
}

// export const getProfileData = async (req, res) => {
//     try {
//         const userId = req.user.id; 

//         const scanCountResult = await scanCount(userId);
//         const lastSession = await lastActive(userId);

//         const totalScans = scanCountResult[0]?.count || 0;
        
//         const lastActiveDate = lastSession[0]?.lastActive;
//         const lastActiveFormatted = lastActiveDate 
//             ? formatLastActive(lastActiveDate) 
//             : "Unknown";

//         return res.status(200).json({
//             success: true,
//             totalScans,
//             lastActive: lastActiveFormatted
//         });

//     } catch (error) {
//         console.error("Profile Data Error:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };


export const User = async(req, res) => {
    if(!req.user) res.redirect("/");
    try{
        const User=req.user;

        const [scanCountResult, lastSessionResult] = await Promise.all([
            scanCount(User.id),
            lastActive(User.id)
        ]);

        const totalScans = scanCountResult[0]?.count || 0;

        const rawDate = lastSessionResult[0]?.lastActive;
        const lastActiveFormatted = rawDate 
            ? formatLastActive(rawDate) 
            : "Just now";

        // console.log(User);

        return res.status(200).json({
            user:{
                id: User.id,
                name: User.name,
                email: User.email,
                totalScans,
                lastActive: lastActiveFormatted
            }
        });
    }catch(error){
        return res.status(500).json({error: "Something went wrong"});
    }
}

export const CheckIsAdmin = async(req, res) => {
   if(!req.user) res.redirect("/");

   const {id:userId} = req.user;
//    console.log(req.user);

   try{
        const isAdmin = await checkIfAdmin(userId);
        // console.log(isAdmin);
        
        res.status(200).json({ isAdmin: isAdmin });
    }catch(e) {
        res.status(400).json({ message: `Something went wrong ${e}` })
    }
}


export const SkinReport = async(req, res) => {
    if(!req.user) res.redirect("/");

    try {

        // 1. Guardrail Check
        const isSafe = await canUploadToCloudinary();
        if (!isSafe) return res.status(503).json({ error: "Cloud storage quota reached." });

        // 2. Cloudinary Upload
        if (!req.file) return res.status(400).json({ error: "Please upload a skin image." });
        const uploadedUrl = await uploadToCloudinary(req.file.buffer);

        // console.log(req.body);
        // 3. Data Preparation & Validation
        // Combine body data with our new URL and the logged-in User ID
        const rawData = {
            ...req.body,
            imageUrl: uploadedUrl,
            userId: req.user.id,
        };

        // console.log(rawData);

        const {data, error} = insertSkinReportSchema.safeParse(rawData);

        if(error) {
            const err = error.issues.map((curElem) => curElem.message);
            // console.log(err);
            return res.status(400).json({error: err})
        }

        // const result = insertSkinReportSchema.safeParse(rawData);

        // if (!result.success) {
        //     const err = result.error.issues.map((curElem) => curElem.message);
        //     console.log("Validation Failed:", err);
        //     return res.status(400).json({ error: err });
        // }
        const now = new Date();
        // console.log(data);
        const [result] = await saveReport(data);

        // console.log(result);
        
        res.status(201).json({ 
            success: true, 
            reportId: result.id, 
            imageUrl: uploadedUrl,
            createdAt: now
        });

    } catch (err) {
        // if (err instanceof z.ZodError) return res.status(400).json({error : err.errors});
        // res.status(500).json({error : "Server Error"});
        // if (err instanceof z.ZodError) {
        //     return res.status(400).json({ error: err.errors.map(e => e.message) });
        // }
        // console.error("Report Save Error:", err);
        res.status(500).json({ error: "Failed to process skin report" });
    }

}

export const getUserHistory = async(req, res) => {
    if (!req.user) return res.redirect('/');

    try {
        const history = await getUserReports(req.user.id);
        res.status(200).json({ success: true, history });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
}


export const GetAdminDashboard = async(req, res) => {
    if (!req.user) return res.redirect('/');

    try {
        const isAdmin = await checkIfAdmin(req.user.id); // Guardrail: Admin only
        if (!isAdmin) return res.status(403).json({ error: "Access Denied" });

        const [users, feedback, reports] = await Promise.all([
            getAllUsers(),
            getAllFeedback(),
            getAllReports()
        ]);

        res.status(200).json({ success: true, data: { users, feedback, reports } });
    } catch (err) {
        res.status(500).json({ error: "Admin data fetch failed" });
    }
}