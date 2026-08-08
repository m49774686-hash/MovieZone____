import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./src/config/env.js";
import { initializeDatabase } from "./src/config/initDatabase.js";

import healthRoutes
    from "./src/routes/health.routes.js";

import movieRoutes
    from "./src/routes/movie.routes.js";

import movieAdminRoutes
    from "./src/routes/movieAdmin.routes.js";

import authRoutes
    from "./src/routes/auth.routes.js";

import adminDashboardRoutes
    from "./src/routes/adminDashboard.routes.js";

import seriesRoutes
    from "./src/routes/series.routes.js";

import seriesAdminRoutes
    from "./src/routes/seriesAdmin.routes.js";

import animeRoutes
    from "./src/routes/anime.routes.js";

import animeAdminRoutes
    from "./src/routes/animeAdmin.routes.js";

import mediaRoutes
    from "./src/routes/media.routes.js";

import {
    notFoundHandler,
    errorHandler
} from "./src/middleware/errorHandler.js";


const app = express();


/*
|--------------------------------------------------------------------------
| Basic Configuration
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.set(
    "trust proxy",
    1
);


/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
    helmet()
);


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins =
    env.corsOrigin
        .split(",")
        .map(
            (origin) =>
                origin.trim()
        )
        .filter(Boolean);


app.use(
    cors({

        origin: (
            origin,
            callback
        ) => {

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            if (
                allowedOrigins.includes("*") ||
                allowedOrigins.includes(origin)
            ) {

                return callback(
                    null,
                    true
                );

            }


            return callback(
                new Error(
                    "Origin not allowed by CORS"
                )
            );

        },

        methods: [

            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"

        ],

        allowedHeaders: [

            "Content-Type",
            "Authorization"

        ],

        credentials: true

    })
);


/*
|--------------------------------------------------------------------------
| Request Parsing
|--------------------------------------------------------------------------
*/

app.use(
    express.json({

        limit: "2mb"

    })
);


app.use(
    express.urlencoded({

        extended: true,

        limit: "2mb"

    })
);


/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (
    env.nodeEnv !== "test"
) {

    app.use(
        morgan("combined")
    );

}


/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.use(
    "/api/health",
    healthRoutes
);


/*
|--------------------------------------------------------------------------
| Movies
|--------------------------------------------------------------------------
*/

app.use(
    "/api/movies",
    movieRoutes
);


/*
|--------------------------------------------------------------------------
| Series
|--------------------------------------------------------------------------
*/

app.use(
    "/api/series",
    seriesRoutes
);


/*
|--------------------------------------------------------------------------
| Anime
|--------------------------------------------------------------------------
*/

app.use(
    "/api/anime",
    animeRoutes
);


/*
|--------------------------------------------------------------------------
| Media
|--------------------------------------------------------------------------
*/

app.use(
    "/api/media",
    mediaRoutes
);


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use(
    "/api/auth",
    authRoutes
);


/*
|--------------------------------------------------------------------------
| PROTECTED ADMIN API
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

app.use(
    "/api/admin/dashboard",
    adminDashboardRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Movies
|--------------------------------------------------------------------------
*/

app.use(
    "/api/admin/movies",
    movieAdminRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Series
|--------------------------------------------------------------------------
*/

app.use(
    "/api/admin/series",
    seriesAdminRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Anime
|--------------------------------------------------------------------------
*/

app.use(
    "/api/admin/anime",
    animeAdminRoutes
);


/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get(
    "/",
    (
        req,
        res
    ) => {

        res.status(200).json({

            success: true,

            app:
                env.appName,

            version:
                env.appVersion,

            message:
                "MovieZone Backend API is running",

            environment:
                env.nodeEnv

        });

    }
);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
    notFoundHandler
);


/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    errorHandler
);


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {

    try {

        await initializeDatabase();


        const server =
            app.listen(
                env.port,
                () => {

                    console.log(
                        "========================================"
                    );

                    console.log(
                        `${env.appName} Backend`
                    );

                    console.log(
                        `Environment: ${env.nodeEnv}`
                    );

                    console.log(
                        `Port: ${env.port}`
                    );

                    console.log(
                        `Health: http://localhost:${env.port}/api/health`
                    );

                    console.log(
                        `Movies: http://localhost:${env.port}/api/movies`
                    );

                    console.log(
                        `Series: http://localhost:${env.port}/api/series`
                    );

                    console.log(
                        `Anime: http://localhost:${env.port}/api/anime`
                    );

                    console.log(
                        `Media: http://localhost:${env.port}/api/media`
                    );

                    console.log(
                        `Admin Login: http://localhost:${env.port}/api/auth/admin/login`
                    );

                    console.log(
                        `Admin Dashboard: http://localhost:${env.port}/api/admin/dashboard`
                    );

                    console.log(
                        `Admin Movies: http://localhost:${env.port}/api/admin/movies`
                    );

                    console.log(
                        `Admin Series: http://localhost:${env.port}/api/admin/series`
                    );

                    console.log(
                        `Admin Anime: http://localhost:${env.port}/api/admin/anime`
                    );

                    console.log(
                        "Database: connected"
                    );

                    console.log(
                        "========================================"
                    );

                }
            );


        /*
        |--------------------------------------------------------------------------
        | Graceful Shutdown
        |--------------------------------------------------------------------------
        */

        function shutdown(
            signal
        ) {

            console.log(
                `${signal} received. Shutting down...`
            );


            server.close(
                () => {

                    console.log(
                        "HTTP server closed."
                    );

                    process.exit(
                        0
                    );

                }
            );

        }


        process.on(
            "SIGTERM",
            () =>
                shutdown(
                    "SIGTERM"
                )
        );


        process.on(
            "SIGINT",
            () =>
                shutdown(
                    "SIGINT"
                )
        );


    } catch (error) {

        console.error(
            "Failed to start MovieZone Backend:",
            error
        );

        process.exit(
            1
        );

    }

}


startServer();
