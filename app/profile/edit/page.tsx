import AppShell from "@/components/AppShell";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

export default function ProfileEditPage() {
    return (
        <AppShell label="Profil" title="Kreator profilu">
            <ProfileEditForm />
        </AppShell>
    );
}
