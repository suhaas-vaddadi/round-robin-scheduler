import { poolPromise } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pool = await poolPromise;

        if (!body.participant_id || !Array.isArray(body.availabilities)) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const conn = await pool.getConnection();

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
