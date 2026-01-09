import AppShell from "@/components/AppShell";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
    return (
        <AppShell label="Onboarding" title="Preferencje">
            <OnboardingForm />
        </AppShell>
    );
}
