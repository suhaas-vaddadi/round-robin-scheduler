"use server"
import { NextRequest, NextResponse } from "next/server";
import { poolPromise } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('participant_id')
    const pool = await poolPromise;
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`SELECT * FROM RoundRobinStudy.Participant WHERE participant_id = ?;`, [id]);
    conn.release();

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: Array.isArray(rows) && rows.length > 0 ? rows[0] : rows },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pool = await poolPromise;
    const conn = await pool.getConnection();
    const [result] = await conn.execute(
      `INSERT INTO RoundRobinStudy.Participant (participant_id, full_name, session_state, session_date, session_time, email) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), session_date = VALUES(session_date), session_time = VALUES(session_time), email = VALUES(email);`,
      [body.participantId, body.fullName, 0, null, null, body.email]
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