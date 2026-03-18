import { poolPromise } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pool = await poolPromise;

        if (!body.participant_id || !Array.isArray(body.availabilities)) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const conn = await pool.getConnection();

        await conn.execute(`DELETE FROM RoundRobinStudy.Availability WHERE participant_id = ?;`, [body.participant_id]);

        if (body.availabilities.length === 0) {
            conn.release();
            return Response.json({ data: { message: "No availabilities inserted" } });
        }

        const values = body.availabilities.map((avail: string) => [body.participant_id, avail]);
        const [result] = await conn.query(
            `INSERT INTO RoundRobinStudy.Availability (participant_id, availability_string) VALUES ?;`,
            [values]
        );
        conn.release();
        return Response.json({ data: result });
    } catch (error) {
        console.error("Error fetching participant:", error);
        return Response.json({ error: "Failed to fetch participant" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get("participant_id");

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        if (participantId) {
            const [rows] = await conn.execute(
                `SELECT availability_string FROM RoundRobinStudy.Availability WHERE participant_id = ?;`,
                [participantId]
            );
            conn.release();
            return Response.json({ data: rows }, { status: 200 });
        }


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
