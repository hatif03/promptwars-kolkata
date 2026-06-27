import { notFound } from "next/navigation";
import { AppShell } from "@/components/saathi/AppShell";
import { ExercisePlayer } from "@/components/saathi/ExercisePlayer";
import { getExerciseById } from "@/lib/data/calm-kit";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExercisePage({ params }: Props) {
  const { id } = await params;
  const exercise = getExerciseById(id);

  if (!exercise) notFound();

  return (
    <AppShell title={exercise.title} subtitle={`${exercise.duration} min`}>
      <ExercisePlayer exercise={exercise} />
    </AppShell>
  );
}
