import { Award, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {
  Button,
  Card,
  CardContent,
  NotificationSetup,
  Spinner,
} from "@/components";
import { useOnboardingStore } from "@/store";

type Props = {
  improvement: number;
  onComplete: () => void;
};
export function Result({ improvement, onComplete }: Props) {
  const { isSubmitting } = useOnboardingStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="mb-4 text-primary">Fantastic Work!</h2>
      <p className=" mb-8">You just completed your first speed reading drill</p>

      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:border-background dark:from-green-900 dark:to-emerald-950">
        <CardContent className="pt-6">
          <div className="text-5xl mb-2 text-green-600">+{improvement}%</div>
          <p className="">Faster than your baseline!</p>
          <p className="text-sm  mt-3">
            This is just the beginning. With consistent practice, you'll see
            even bigger improvements.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 pb-6">
        <Card>
          <CardContent className="pt-6">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="mb-1">Badge Earned!</h3>
            <p className="text-sm ">First Drill Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-2 text-primary">+50 XP</div>
            <p className="text-sm ">You're on your way to Level 2</p>
          </CardContent>
        </Card>
      </div>

      <NotificationSetup />

      <Button onClick={onComplete} size="lg" className="w-full">
        {isSubmitting ? <Spinner /> : null}
        Continue to Dashboard
      </Button>
    </motion.div>
  );
}
