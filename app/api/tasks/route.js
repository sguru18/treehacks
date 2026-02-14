/**
 * POST /api/tasks
 * Generates coding-agent-ready development tasks from a feature spec.
 */

import { generateDevTasks } from "@/lib/agents/taskbreaker";
import { v4 as uuid } from "uuid";

export async function POST(request) {
  try {
    const { feature, spec } = await request.json();

    if (!feature || !spec) {
      return Response.json(
        { error: "Feature and spec are required" },
        { status: 400 },
      );
    }

    const rawTasks = await generateDevTasks(feature, spec);

    // Assign IDs and statuses
    const tasks = rawTasks.map((task, index) => ({
      ...task,
      id: uuid(),
      index,
      status: "todo",
    }));

    return Response.json({ tasks });
  } catch (error) {
    console.error("[API /tasks] Error:", error);
    return Response.json(
      { error: error.message || "Task generation failed" },
      { status: 500 },
    );
  }
}
