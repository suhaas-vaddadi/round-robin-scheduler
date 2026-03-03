import { poolPromise } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const pool = await poolPromise;
        const conn = await pool.getConnection();
        const params = [
            body.participant_id,
            body.age,
            body.hispanicLatino,
            body.races,
            body.otherRace,
            body.sex,
            body.zipCode
        ].map(val => val === undefined ? null : val);

        const [result] = await conn.execute(
            `INSERT INTO RoundRobinStudy.Demographics (participant_id, age, hispanic_latino, races, other_race, sex, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE age = VALUES(age), hispanic_latino = VALUES(hispanic_latino), races = VALUES(races), other_race = VALUES(other_race), sex = VALUES(sex), zip_code = VALUES(zip_code);`,
            params
        );
        conn.release();


        return NextResponse.json(
            { data: result },
            { status: 200 }
        );
    } catch (err) {
        console.error('Error connecting or querying the database:', err);
        return NextResponse.json(
            { error: 'Database connection or query failed' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const participantId = request.nextUrl.searchParams.get("participant_id");

        if (!participantId) {
            return NextResponse.json({ error: "Missing participant_id" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        const [rows] = await conn.execute(
            `SELECT * FROM RoundRobinStudy.Demographics WHERE participant_id = ?;`,
            [participantId]
        );
        conn.release();

        if (Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ data: rows[0] }, { status: 200 });
        } else {
            return NextResponse.json({ data: null }, { status: 200 });
        }
    } catch (err) {
        console.error('Error fetching demographics:', err);
        return NextResponse.json(
            { error: 'Database connection or query failed' },
            { status: 500 }
        );
    }
}