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
            `INSERT INTO RoundRobinStudy.Demographics (participant_id, age, hispanic_latino, races, other_race, sex, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?);`,
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