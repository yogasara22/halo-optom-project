import { AppDataSource } from "../config/ormconfig";
import { User, UserRole } from "../entities/User";
import * as bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const userRepo = AppDataSource.getRepository(User);
        const email = "admin@halooptom.com";
        const password = "password123";

        const existingAdmin = await userRepo.findOne({ where: { email } });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const admin = userRepo.create({
            name: "Super Admin",
            email,
            password_hash,
            role: UserRole.Admin,
            is_verified: true,
            phone: "081234567890",
            bio: "System Administrator"
        });

        await userRepo.save(admin);
        console.log("Admin user created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await AppDataSource.destroy();
    }
};

createAdmin();
