import { poolPromise } from "@/lib/db";

export async function GET() {
    try {
        const pool = await poolPromise;
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(
            `SELECT session_date, session_time FROM RoundRobinStudy.AvailableTimes;`
        );
        conn.release();

        return Response.json({ data: rows }, { status: 200 });
    } catch (error) {
        console.error("Error fetching available times:", error);
        return Response.json({ error: "Failed to fetch available times" }, { status: 500 });
    }
}

export async function OPTIONS(_request: Request) {
    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}