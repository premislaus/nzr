import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

type SettingsPayload = {
    lookingFor?: string;
    ageRange?: string;
    values?: string[] | string;
    lifestyle?: string;
    maxDistanceKm?: number | string;
    preferredCity?: string;
    childrenPreference?: string;
    preferredMinHeight?: number | string;
    preferredMaxHeight?: number | string;
};

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    return NextResponse.json({
        preferences: {
            lookingFor: user.lookingFor ?? "",
            ageRange: user.ageRange ?? "",
            values: user.values ?? [],
            lifestyle: user.lifestyle ?? "",
            maxDistanceKm: user.maxDistanceKm ?? "",
            preferredCity: user.preferredCity ?? "",
            childrenPreference: user.childrenPreference ?? "",
            preferredMinHeight: user.preferredMinHeight ?? "",
            preferredMaxHeight: user.preferredMaxHeight ?? "",
        },
    });
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: SettingsPayload;

    try {
        payload = (await request.json()) as SettingsPayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const lookingFor = payload.lookingFor?.trim() ?? "";
    const ageRange = payload.ageRange?.trim() ?? "";
    const lifestyle = payload.lifestyle?.trim() ?? "";
    const preferredCity = payload.preferredCity?.trim() ?? "";
    const childrenPreference = payload.childrenPreference?.trim() ?? "";
    const ageRangeRegex = /^\d{2}-\d{2}$/;
    const allowedLifestyle = new Set(["aktywny", "spokojny", "mieszany"]);
    const allowedChildrenPreference = new Set(["any", "yes", "no"]);
    if (lookingFor && lookingFor !== "woman" && lookingFor !== "man") {
        return NextResponse.json({ error: "Wybierz poprawną wartość." }, { status: 400 });
    }

    if (ageRange && !ageRangeRegex.test(ageRange)) {
        return NextResponse.json(
            { error: "Zakres wieku musi mieć format 26-35." },
            { status: 400 },
        );
    }

    if (lifestyle && !allowedLifestyle.has(lifestyle)) {
        return NextResponse.json({ error: "Nieprawidłowy styl życia." }, { status: 400 });
    }

    if (childrenPreference && !allowedChildrenPreference.has(childrenPreference)) {
        return NextResponse.json({ error: "Nieprawidłowa preferencja dzieci." }, { status: 400 });
    }

    const normalizeValues = (value: SettingsPayload["values"]) => {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map((item) => (typeof item === "string" ? item.trim() : ""))
                .filter(Boolean);
        }
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const update: Record<string, unknown> = {
        updatedAt: new Date(),
    };
    const unset: Record<string, ""> = {};

    if (lookingFor) {
        update.lookingFor = lookingFor;
    } else {
        unset.lookingFor = "";
    }

    if (ageRange) {
        update.ageRange = ageRange;
    } else {
        unset.ageRange = "";
    }

    if (payload.values !== undefined) {
        const values = normalizeValues(payload.values).slice(0, 8);
        if (values.length === 0) {
            unset.values = "";
        } else {
            update.values = values;
        }
    }

    if (lifestyle) {
        update.lifestyle = lifestyle;
    } else {
        unset.lifestyle = "";
    }

    if (payload.maxDistanceKm !== undefined) {
        if (payload.maxDistanceKm === "" || payload.maxDistanceKm === null) {
            unset.maxDistanceKm = "";
        } else {
            const distanceValue =
                typeof payload.maxDistanceKm === "string"
                    ? Number(payload.maxDistanceKm)
                    : payload.maxDistanceKm;
            if (!Number.isFinite(distanceValue) || distanceValue < 5 || distanceValue > 500) {
                return NextResponse.json(
                    { error: "Odległość musi być w zakresie 5-500 km." },
                    { status: 400 },
                );
            }
            update.maxDistanceKm = distanceValue;
        }
    }

    if (preferredCity) {
        update.preferredCity = preferredCity;
    } else {
        unset.preferredCity = "";
    }

    if (childrenPreference) {
        update.childrenPreference = childrenPreference;
    } else {
        unset.childrenPreference = "";
    }

    const minHeightRaw = payload.preferredMinHeight;
    const maxHeightRaw = payload.preferredMaxHeight;
    if (minHeightRaw !== undefined || maxHeightRaw !== undefined) {
        const minHeight =
            typeof minHeightRaw === "string" ? Number(minHeightRaw) : minHeightRaw;
        const maxHeight =
            typeof maxHeightRaw === "string" ? Number(maxHeightRaw) : maxHeightRaw;

        if (
            minHeightRaw === "" ||
            minHeightRaw === null ||
            maxHeightRaw === "" ||
            maxHeightRaw === null
        ) {
            unset.preferredMinHeight = "";
            unset.preferredMaxHeight = "";
        } else if (
            !Number.isFinite(minHeight) ||
            !Number.isFinite(maxHeight) ||
            minHeight < 120 ||
            maxHeight > 230 ||
            minHeight >= maxHeight
        ) {
            return NextResponse.json(
                { error: "Wzrost powinien być w zakresie 120-230 cm i min < max." },
                { status: 400 },
            );
        } else {
            update.preferredMinHeight = minHeight;
            update.preferredMaxHeight = maxHeight;
        }
    }

    const users = await getUsersCollection();
    await users.updateOne(
        { _id: user._id },
        {
            ...(Object.keys(update).length > 0 ? { $set: update } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
        },
    );

    return NextResponse.json({ ok: true });
}
