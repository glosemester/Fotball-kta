import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const team = await prisma.team.findFirst();
  if (!team) return console.log("No team found");

  const datesToSchedule = [new Date()];

  const sessionsToCreate = datesToSchedule.map(date => ({
    team_id: team.id,
    coach_id: team.coach_id,
    title: "Trening (Månedsplan)",
    date,
    age_group: team.age_group,
    theme: "PASNING_MOTTAK" as any,
    duration_minutes: 60,
    actual_player_count: 12,
    planned_player_count: 14,
    field_length_meters: 60,
    field_width_meters: 40,
    status: "DRAFT" as any,
    phases: [],
    constraints_applied: []
  }));

  try {
    const result = await prisma.trainingSession.createMany({
      data: sessionsToCreate
    });
    console.log("Success:", result);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main().finally(() => prisma.$disconnect());
