import bcrypt from "bcryptjs";
import readline from "node:readline";

import pool from "./src/config/database.js";


const rl =
    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


function ask(question) {

    return new Promise(
        (resolve) => {

            rl.question(
                question,
                resolve
            );

        }
    );

}


async function createAdmin() {

    try {

        const email =
            (
                await ask(
                    "Admin email: "
                )
            )
                .trim()
                .toLowerCase();


        const password =
            await ask(
                "Admin password: "
            );


        const displayName =
            (
                await ask(
                    "Admin display name: "
                )
            )
                .trim();


        if (!email) {

            throw new Error(
                "Email is required"
            );

        }


        if (
            password.length < 8
        ) {

            throw new Error(
                "Password must contain at least 8 characters"
            );

        }


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const existing =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [
                    email
                ]
            );


        if (
            existing.rows.length > 0
        ) {

            await pool.query(
                `
                UPDATE users
                SET
                    password_hash = $1,
                    display_name = $2,
                    is_admin = TRUE,
                    is_banned = FALSE,
                    updated_at = NOW()
                WHERE id = $3
                `,
                [
                    passwordHash,
                    displayName || "Administrator",
                    existing.rows[0].id
                ]
            );

            console.log(
                "Existing user promoted to admin successfully."
            );

        } else {

            await pool.query(
                `
                INSERT INTO users (
                    email,
                    password_hash,
                    display_name,
                    is_admin
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    TRUE
                )
                `,
                [
                    email,
                    passwordHash,
                    displayName || "Administrator"
                ]
            );

            console.log(
                "Admin account created successfully."
            );

        }


    } catch (error) {

        console.error(
            "Failed to create admin:",
            error.message
        );

        process.exitCode = 1;

    } finally {

        await pool.end();

        rl.close();

    }

}


createAdmin();
