const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const BACKEND_URL =
    process.env.BACKEND_URL || "http://127.0.0.1:5000";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (req, res) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        const backend = await response.json();
        res.status(response.ok ? 200 : 503).json({
            status: response.ok ? "success" : "error",
            frontend: "ok",
            backend
        });
    } catch (error) {
        res.status(503).json({
            status: "error",
            frontend: "ok",
            message: "Flask backend is unavailable"
        });
    }
});

app.get("/", (req, res) => {
    res.render("index");
}); 

app.post("/submit", async (req, res) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message
            })
        });

        const result = await response.json();

        res.status(response.status).render("result", {
            status: result.status || "unknown",
            message: result.message || "Request completed"
        });
    } catch (error) {
        console.error("Flask request failed:", error.message);

        res.status(502).render("result", {
            status: "error",
            message:
                "Flask backend is unavailable. Please check that it is running."
        });
    } 
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express frontend running on port http://localhost:${PORT}`);
    console.log(`Flask backend configured at ${BACKEND_URL}`);
});
